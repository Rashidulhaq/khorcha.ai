import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { parseBanglaExpenseNLP } from "./src/lib/banglaNlpParser";
import { generateSmartFinancialAdvice } from "./src/lib/financialAdvisor";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Circuit breaker: avoid hammering Gemini when access is denied or rate limited
let geminiCooldownUntil = 0;

function isGeminiAvailable(): boolean {
  if (!process.env.GEMINI_API_KEY) return false;
  return Date.now() > geminiCooldownUntil;
}

function recordGeminiFailure(error: any) {
  // If permission denied, quota exceeded, or project access restricted, backoff
  const errStr = String(error?.message || error?.status || "");
  if (errStr.includes("403") || errStr.includes("PERMISSION_DENIED") || errStr.includes("denied access") || errStr.includes("resource_exhausted")) {
    // 30 minute cooldown
    geminiCooldownUntil = Date.now() + 30 * 60 * 1000;
  } else {
    // 2 minute cooldown for other errors
    geminiCooldownUntil = Date.now() + 2 * 60 * 1000;
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Smart Expense Parser (Bangla NLP + Gemini with seamless fallback)
app.post("/api/ai/parse-expense", async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "টেক্সট প্রদান করুন" });
  }

  // 1. Try Gemini AI if available and not in cooldown
  if (isGeminiAvailable()) {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are the parser for 'Khorcha ai' (a Bangla personal finance app).
Analyze this Bangla sentence or mixed Banglish/English input describing a transaction:
"${text}"

Categories available for Expense:
- খাবার (Food)
- যাতায়াত (Transport)
- বাড়ি ভাড়া ও বিল (Rent & Utilities)
- কেনাকাটা (Shopping)
- স্বাস্থ্য (Health)
- বিনোদন (Entertainment)
- শিক্ষা (Education)
- ব্যক্তিগত (Personal)
- অন্যান্য (Others)

Categories available for Income:
- বেতন (Salary)
- ব্যবসা (Business)
- ফ্রিল্যান্সিং (Freelancing)
- বিনিয়োগ (Investment)
- উপহার (Gift)
- অন্যান্য আয় (Other Income)

Payment methods available:
- নগদ (Cash)
- বিকাশ (bKash)
- নগদ (Nagad)
- রকেট (Rocket)
- ব্যাংক / কার্ড (Bank/Card)

Extract and output ONLY a valid JSON object:
{
  "amount": number (positive float, convert any Bangla numerals to standard number),
  "type": "expense" or "income",
  "category": one of the exact Bangla category names listed above,
  "note": brief descriptive title or note in Bangla (maximum 50 chars),
  "paymentMethod": one of the exact Bangla payment methods listed above,
  "date": "YYYY-MM-DD" (use today's date ${new Date().toISOString().split("T")[0]} unless a relative day like গতকাল/গত পরশু was mentioned)
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const outputText = response.text?.trim() || "{}";
        const parsed = JSON.parse(outputText);
        if (typeof parsed.amount === "number" && parsed.amount > 0) {
          return res.json({
            amount: Math.abs(parsed.amount),
            type: parsed.type === "income" ? "income" : "expense",
            category: parsed.category || "অন্যান্য",
            note: parsed.note || text,
            paymentMethod: parsed.paymentMethod || "নগদ",
            date: parsed.date || new Date().toISOString().split("T")[0],
            source: "gemini",
          });
        }
      } catch (aiError: any) {
        recordGeminiFailure(aiError);
      }
    }
  }

  // 2. High-accuracy offline Bangla NLP parser
  const fallbackResult = parseBanglaExpenseNLP(text);
  return res.json({
    ...fallbackResult,
    source: "bangla_nlp",
  });
});

// AI Financial Advice Endpoint (Gemini + Smart Rules Engine)
app.post("/api/ai/financial-advice", async (req, res) => {
  const { totalIncome, totalExpense, balance, monthlyBudget, categoryBreakdown } = req.body || {};

  if (isGeminiAvailable()) {
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are 'Khorcha ai' (খরচা AI), a warm, smart, and encouraging Bangladeshi personal financial consultant.
Analyze this financial summary:
- Total Income: ৳${totalIncome || 0}
- Total Expense: ৳${totalExpense || 0}
- Current Net Balance: ৳${balance || 0}
- Monthly Budget Limit: ৳${monthlyBudget || "বাজেট নির্ধারিত নেই"}
- Top Category breakdown: ${JSON.stringify(categoryBreakdown || {})}

Provide insightful, actionable, and culturally relevant advice in friendly, natural Bengali (বাংলা).
Return ONLY a valid JSON object matching this schema:
{
  "healthScore": number between 0 and 100,
  "healthStatus": string in Bengali (যেমন "অসাধারণ", "ভারসাম্যপূর্ণ", "মনোযোগ প্রয়োজন", "সতর্কতা"),
  "summary": string in Bengali (2-3 sentences providing actionable assessment of their spending and savings),
  "tips": array of 3 specific, practical money-saving or budgeting tips in Bengali (each 1-2 sentences)
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        return res.json({
          healthScore: typeof parsed.healthScore === "number" ? parsed.healthScore : 75,
          healthStatus: parsed.healthStatus || "ভারসাম্যপূর্ণ",
          summary: parsed.summary || "আপনার লেনদেনের নিয়মিত হিসাব রাখুন এবং মাসিক সঞ্চয় নিশ্চিত করুন।",
          tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : [
            "অপ্রয়োজনীয় কেনাকাটা এড়িয়ে চলুন।",
            "মাসিক খরচের নির্দিষ্ট লিমিট সেট করুন।",
            "প্রতিদিনের খরচ সাথে সাথে লিখে রাখুন।"
          ],
          source: "gemini",
        });
      } catch (aiError: any) {
        recordGeminiFailure(aiError);
      }
    }
  }

  // Fallback to high-accuracy algorithmic financial advisor
  const fallbackAdvice = generateSmartFinancialAdvice({
    totalIncome: Number(totalIncome) || 0,
    totalExpense: Number(totalExpense) || 0,
    balance: Number(balance) || 0,
    monthlyBudget: Number(monthlyBudget) || 0,
    categoryBreakdown: categoryBreakdown || {},
  });

  return res.json(fallbackAdvice);
});

// Vite middleware for development & production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khorcha ai server running on http://localhost:${PORT}`);
  });
}

startServer();
