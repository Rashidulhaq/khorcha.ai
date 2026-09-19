import { ParsedExpenseAI, PaymentMethod, TransactionType } from "../types";

const BENGALI_TO_ENG_DIGITS: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

export function normalizeBengaliNumbers(input: string): string {
  return input.replace(/[০-৯]/g, (char) => BENGALI_TO_ENG_DIGITS[char] || char);
}

export function parseBanglaExpenseNLP(rawInput: string): ParsedExpenseAI {
  const text = (rawInput || "").trim();
  const normalized = normalizeBengaliNumbers(text);

  // 1. Amount Extraction
  // Look for currency-associated numbers first: e.g. "৫০০ টাকা", "120 tk", "৳45000", "500/-", "৪৫,০০০"
  let amount = 0;
  const currencyMatch = normalized.match(/(?:৳|\$|tk|taka|টাকা|টাকার|টাকায়)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:৳|\$|tk|taka|টাকা|টাকার|টাকায়|\/-)?/i);
  
  // Find all candidate numbers
  const allNumberMatches = Array.from(normalized.matchAll(/\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\b/g));
  
  if (allNumberMatches.length > 0) {
    // Prefer number near currency keywords if exists
    let chosenStr = allNumberMatches[0][1];
    for (const match of allNumberMatches) {
      const idx = match.index ?? -1;
      if (idx >= 0) {
        const surrounding = normalized.substring(Math.max(0, idx - 10), Math.min(normalized.length, idx + match[0].length + 10));
        if (/(টাকা|tk|taka|৳|\/-)/i.test(surrounding)) {
          chosenStr = match[1];
          break;
        }
      }
    }
    // Clean commas
    const cleanedNumStr = chosenStr.replace(/,/g, "");
    const parsed = parseFloat(cleanedNumStr);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  if (amount <= 0 && currencyMatch) {
    const cleaned = currencyMatch[1]?.replace(/,/g, "");
    const parsed = parseFloat(cleaned || "0");
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  if (amount <= 0) {
    amount = 50; // sensible default if no digits provided
  }

  // 2. Type Detection (Income vs Expense)
  let type: TransactionType = "expense";
  const incomeRegex = /(বেতন|স্যালারি|salary|ইনকাম|income|আয়|আয়|পেল|পেলাম|পেয়েছি|পেয়েছি|জমা|বোনাস|লাভ|উপহার|সালামি|টাকা এল|টাকা আসলো|টাকা পেলাম|পেমেন্ট পেলাম|বিক্রি|রেমিট্যান্স|টিউশন ফি|ভাড়া পেলাম|ভাড়া পেলাম)/i;
  if (incomeRegex.test(text)) {
    type = "income";
  }

  // 3. Category Detection
  let category = type === "income" ? "অন্যান্য আয়" : "অন্যান্য";

  if (type === "income") {
    if (/(বেতন|স্যালারি|salary)/i.test(text)) {
      category = "বেতন";
    } else if (/(ব্যবসা|দোকান|বিক্রি|লাভ|business|profit)/i.test(text)) {
      category = "ব্যবসা";
    } else if (/(ফ্রিল্যান্সিং|আপওয়ার্ক|ফাইভার|freelance|fiverr|upwork)/i.test(text)) {
      category = "ফ্রিল্যান্সিং";
    } else if (/(বিনিয়োগ|বিনিয়োগ|শেয়ার|শেয়ার|ডিভিডেন্ড|investment)/i.test(text)) {
      category = "বিনিয়োগ";
    } else if (/(উপহার|সালামি|ঈদ সালামি|gift|present)/i.test(text)) {
      category = "উপহার";
    } else {
      category = "অন্যান্য আয়";
    }
  } else {
    // Expense Categories
    if (/(খাবার|বাজার|কাঁচাবাজার|লাঞ্চ|ডিনার|নাস্তা|রেস্টুরেন্ট|চা|কফি|বিরিয়ানি|মিষ্টি|ফল|মাছ|মাংস|সবজি|ভাত|কাচ্চি|বার্গার|food|lunch|dinner|breakfast|snack)/i.test(text)) {
      category = "খাবার";
    } else if (/(রিকশা|রিকশাভাড়া|রিকশাভাড়া|বাস|উবার|পাঠাও|সিএনজি|ভাড়া|ভাড়া|ট্রেন|মেট্রো|তেল|অকটেন|পেট্রোল|গাড়ি|যাতায়াত|যাতায়াত|uber|pathao|rickshaw|bus|cng|fare)/i.test(text)) {
      category = "যাতায়াত";
    } else if (/(বাড়ি ভাড়া|বাসা ভাড়া|বিদ্যুৎ|কারেন্ট|গ্যাস|পানি|ইন্টারনেট|ওয়াইফাই|বিল|রিচার্জ|rent|bill|electricity|gas|water|wifi)/i.test(text)) {
      category = "বাড়ি ভাড়া ও বিল";
    } else if (/(কেনাকাটা|শপিং|জামা|কাপড়|কাপড়|জুতা|ঘড়ি|ঘড়ি|মার্কেট|প্যান্ট|শার্ট|shopping|dress|cloth|shirt)/i.test(text)) {
      category = "কেনাকাটা";
    } else if (/(ওষুধ|ঔষধ|ডাক্তার|হাসপাতাল|চিকিৎসা|টেস্ট|ফার্মেসি|ট্যাবলেট|রোগ|মেডিসিন|medicine|doctor|hospital)/i.test(text)) {
      category = "স্বাস্থ্য";
    } else if (/(সিনেমা|মুভি|ঘুরতে|আড্ডা|বিনোদন|খেলা|পার্ক|ট্যুর|পিকনিক|movie|fun|tour)/i.test(text)) {
      category = "বিনোদন";
    } else if (/(বই|খাতা|টিউশন|স্কুল|কলেজ|ভার্সিটি|কোর্স|পরীক্ষা|টিউশনি|education|book|course)/i.test(text)) {
      category = "শিক্ষা";
    } else if (/(ব্যক্তিগত|মোবাইল রিচার্জ|ফ্লেক্সিলোড|সেলুন|চুল|personal|salon)/i.test(text)) {
      category = "ব্যক্তিগত";
    } else {
      category = "অন্যান্য";
    }
  }

  // 4. Payment Method Detection
  let paymentMethod: PaymentMethod = "নগদ";
  if (/(বিকাশ|bkash)/i.test(text)) {
    paymentMethod = "বিকাশ";
  } else if (/(নগদ অ্যাপ|নগদে পেমেন্ট|নগদ মোবাইল|nagad)/i.test(text)) {
    paymentMethod = "নগদ (Nagad)";
  } else if (/(রকেট|rocket)/i.test(text)) {
    paymentMethod = "রকেট";
  } else if (/(ব্যাংক|কার্ড|card|bank|visa|mastercard|চেক|check)/i.test(text)) {
    paymentMethod = "ব্যাংক / কার্ড";
  } else if (/(ক্যাশ|নগদ টাকা|নগদে|cash)/i.test(text)) {
    paymentMethod = "নগদ";
  }

  // 5. Date Detection
  let targetDate = new Date();
  if (/(গতকাল|yesterday)/i.test(text)) {
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (/(গত পরশু|গতপরশু)/i.test(text)) {
    targetDate.setDate(targetDate.getDate() - 2);
  } else if (/(কাল|আগামীকাল|tomorrow)/i.test(text)) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const dateStr = targetDate.toISOString().split("T")[0];

  // 6. Clean Note Generation
  // Strip numbers, currency keywords, dates, and common fluff
  let cleanNote = text
    .replace(/[০-৯0-9,.]+/g, "")
    .replace(/(টাকা|টাকার|টাকায়|tk|taka|৳|\/-)/gi, "")
    .replace(/(বিকাশ|bkash|নগদ|nagad|রকেট|rocket|ব্যাংক|কার্ড|card|bank)/gi, "")
    .replace(/(গতকাল|আজকে|আজ|গত পরশু|কাল|আগামীকাল)/gi, "")
    .replace(/(দিয়েছি|দিলাম|পেয়েছি|পেলাম|হয়েছে|করলাম|নিলাম|কিনেছি|কিনলাম)/gi, "")
    .replace(/[।!?,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanNote || cleanNote.length < 2) {
    cleanNote = category;
  }

  return {
    amount,
    type,
    category,
    note: cleanNote,
    paymentMethod,
    date: dateStr,
    source: "bangla_nlp",
  };
}
