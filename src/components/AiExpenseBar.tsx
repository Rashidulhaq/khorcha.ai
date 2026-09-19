import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, X, CornerDownLeft, HelpCircle, Info } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { QUICK_AI_PROMPTS } from "../data/initialData";
import { ParsedExpenseAI, Transaction } from "../types";
import { formatCurrency } from "../lib/utils";
import { parseBanglaExpenseNLP } from "../lib/banglaNlpParser";

interface AiExpenseBarProps {
  onAddTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  useBengaliDigits: boolean;
}

export function AiExpenseBar({ onAddTransaction, useBengaliDigits }: AiExpenseBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedExpenseAI | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || prompt;
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setParsedResult(null);

    try {
      const response = await fetch("/api/ai/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data: ParsedExpenseAI = await response.json();
        setParsedResult(data);
        return;
      }
      // If server response wasn't ok, fallback immediately to local Bangla NLP
      const localResult = parseBanglaExpenseNLP(text);
      setParsedResult(localResult);
    } catch {
      // Offline or network error: fallback smoothly to client NLP parser
      const localResult = parseBanglaExpenseNLP(text);
      setParsedResult(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedResult) return;
    onAddTransaction({
      type: parsedResult.type,
      amount: parsedResult.amount,
      category: parsedResult.category,
      note: parsedResult.note,
      paymentMethod: parsedResult.paymentMethod,
      date: parsedResult.date,
    });
    setSuccessMsg(`৳${parsedResult.amount} এর লেনদেন সফলভাবে যুক্ত হয়েছে!`);
    setParsedResult(null);
    setPrompt("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
            Khorcha AI স্মার্ট ইনপুট
          </span>
          <span className="text-xs text-zinc-500 hidden md:inline">
            — বাংলায় সাধারণ বাক্যে লিখলেই স্বয়ংক্রিয় হিসাব তৈরি হবে
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/70 transition-colors cursor-pointer"
            title="Khorcha AI কীভাবে কাজ করে জানুন"
          >
            <HelpCircle className="h-3 w-3" />
            <span className="hidden sm:inline">কীভাবে কাজ করে?</span>
            <span className="sm:hidden">সাহায্য</span>
          </button>
          <Badge variant="emerald" className="text-[10px] sm:text-[11px] font-mono">
            বাংলা NLP
          </Badge>
        </div>
      </div>

      {/* "কীভাবে কাজ করে" Explanatory Card */}
      {showHowItWorks && (
        <div className="mb-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 p-3 text-xs text-zinc-700 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <Info className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Khorcha AI স্মার্ট ইনপুট কীভাবে কাজ করে?</span>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-200/60 text-[11px] sm:text-xs">
            <div className="bg-white/80 p-2 rounded border border-emerald-100">
              <span className="font-semibold text-emerald-800 block mb-0.5">১. সহজ বাক্যে লিখুন:</span>
              বাংলা বা বাংলিশে যেকোনো খরচের বিবরণ লিখুন। সংখ্যাগুলো বাংলা (১২০) বা ইংরেজি (120) উভয়ভাবেই লেখা যায়।
            </div>
            <div className="bg-white/80 p-2 rounded border border-emerald-100">
              <span className="font-semibold text-emerald-800 block mb-0.5">২. স্মার্ট শনাক্তকরণ:</span>
              AI নিজে থেকেই টাকার পরিমাণ, আয়/ব্যয়, ক্যাটাগরি (খাবার, রিকশাভাড়া, বিল ইত্যাদি), পেমেন্ট মাধ্যম ও তারিখ আলাদা করে।
            </div>
            <div className="bg-white/80 p-2 rounded border border-emerald-100">
              <span className="font-semibold text-emerald-800 block mb-0.5">৩. এক ক্লিকে যুক্ত করুন:</span>
              প্রিভিউ কার্ড দেখে <span className="font-semibold text-emerald-700">"যুক্ত করুন"</span> বাটনে চাপলেই সরাসরি আপনার ড্যাশবোর্ডে যোগ হয়ে যায়।
            </div>
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleParse();
            }
          }}
          placeholder="যেমন: 'আজকে দুপুরের খাবার ১২০ টাকা নগদ' বা 'বেতন পেলাম ৪৫০০০'..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-3 pr-24 sm:pr-28 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          <Button
            size="sm"
            variant="emerald"
            onClick={() => handleParse()}
            isLoading={isLoading}
            disabled={!prompt.trim()}
            className="h-8 px-2 sm:px-3 text-xs"
          >
            <span className="hidden sm:inline">হিসাব করুন</span>
            <span className="sm:hidden">হিসাব</span>
            <CornerDownLeft className="h-3 w-3 ml-0.5 opacity-70 hidden sm:inline" />
          </Button>
        </div>
      </div>

      {/* Quick Prompt Chips with horizontal touch scroll */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5 scrollbar-none">
        <span className="text-[10px] sm:text-[11px] text-zinc-400 shrink-0">উদাহরণ:</span>
        {QUICK_AI_PROMPTS.slice(0, 3).map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(item);
              handleParse(item);
            }}
            className="shrink-0 rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10px] sm:text-[11px] text-zinc-600 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Extracted preview card */}
      {parsedResult && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-bold text-sm ${
                  parsedResult.type === "income" ? "bg-emerald-600" : "bg-rose-500"
                }`}
              >
                {parsedResult.type === "income" ? "+" : "-"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900 text-sm truncate">
                    {parsedResult.note || "লেনদেন"}
                  </span>
                  <Badge variant={parsedResult.type === "income" ? "emerald" : "amber"}>
                    {parsedResult.type === "income" ? "আয়" : "ব্যয়"}
                  </Badge>
                  <span className="text-xs text-zinc-500">({parsedResult.category})</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 mt-0.5">
                  <span className="font-bold text-zinc-900 text-sm">
                    {formatCurrency(parsedResult.amount, useBengaliDigits)}
                  </span>
                  <span>•</span>
                  <span>মাধ্যম: {parsedResult.paymentMethod}</span>
                  <span>•</span>
                  <span>তারিখ: {parsedResult.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setParsedResult(null)}
                className="h-8 px-2.5 text-xs text-zinc-600"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                বাতিল
              </Button>
              <Button
                size="sm"
                variant="emerald"
                onClick={handleConfirmAdd}
                className="h-8 px-3 text-xs"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                যুক্ত করুন
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2 flex items-center gap-1.5 animate-in fade-in">
          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-2 flex items-center gap-1.5 animate-in fade-in">
          <X className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
