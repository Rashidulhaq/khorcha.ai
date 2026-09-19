import { AIAdviceResult } from "../types";

export interface FinancialAdviceInput {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBudget: number;
  categoryBreakdown?: Record<string, number>;
}

export function generateSmartFinancialAdvice({
  totalIncome,
  totalExpense,
  balance,
  monthlyBudget,
  categoryBreakdown = {},
}: FinancialAdviceInput): AIAdviceResult {
  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  
  const budgetUtilization =
    monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  // Find top expense category
  let topCategory = "";
  let topCategoryAmount = 0;
  for (const [cat, amt] of Object.entries(categoryBreakdown)) {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  }

  let healthScore = 70;
  let healthStatus = "ভারসাম্যপূর্ণ";
  let summary = "";
  const tips: string[] = [];

  if (totalIncome === 0 && totalExpense === 0) {
    healthScore = 50;
    healthStatus = "শুরু করুন";
    summary = "আপনার আয়ের তথ্য ও দৈনন্দিন ব্যয়ের হিসাব যুক্ত করুন। নিয়মিত হিসাব রাখলে খরচের স্পষ্ট চিত্র দেখতে পাবেন।";
    tips.push("নিয়মিত প্রতি দিনের ছোট-বড় সকল খরচ অ্যাপে লিখুন।");
    tips.push("মাসিক একটি আনুমানিক বাজেট নির্ধারণ করুন।");
    tips.push("মাস শেষে অন্তত ২০% সঞ্চয়ের লক্ষ্য নির্ধারণ করুন।");
  } else if (totalExpense > totalIncome && totalIncome > 0) {
    healthScore = Math.max(25, 45 - Math.round(((totalExpense - totalIncome) / totalIncome) * 20));
    healthStatus = "সতর্কতা প্রয়োজন";
    summary = `আপনার বর্তমান ব্যয় আয়ের চেয়ে বেশি হয়ে গেছে। ইতিমধ্যে আয়ের চেয়ে ৳${Math.round(totalExpense - totalIncome)} বেশি খরচ হয়েছে। অপ্রয়োজনীয় কেনাকাটা অবিলম্বে নিয়ন্ত্রণ করা জরুরি।`;
    tips.push("অপ্রয়োজনীয় শপিং ও বাইরের খাবারের খরচ সাময়িকভাবে বন্ধ রাখুন।");
    tips.push("শুধু অতি-প্রয়োজনীয় ইউটিলিটি ও খাবারের খরচে অগ্রাধিকার দিন।");
    tips.push("ঋণ এড়িয়ে চলার জন্য অবিলম্বে একটি বাজেট নিয়ন্ত্রণ প্ল্যান তৈরি করুন।");
  } else if (savingsRate >= 30) {
    healthScore = 95;
    healthStatus = "অসাধারণ";
    summary = `চমৎকার অর্থ ব্যবস্থাপনা! আপনি প্রায় ${savingsRate}% সঞ্চয় বজায় রাখছেন। আপনার আর্থিক শৃঙ্খলা ভবিষ্যৎ সুরক্ষার জন্য অত্যন্ত ইতিবাচক।`;
    tips.push("এই উদ্বৃত্ত অর্থ কোনো লাভজনক ডিপোজিট স্কিম বা সঞ্চয়পত্রে বিনিয়োগ করতে পারেন।");
    tips.push("কমপক্ষে ৩ থেকে ৬ মাসের খরচের সমান অর্থ একটি জরুরি ফান্ডে (Emergency Fund) সংরক্ষণ করুন।");
    tips.push("ধারাবাহিকতা বজায় রাখতে প্রতি মাসের শুরুতেই বাজেট রিভিউ করুন।");
  } else if (savingsRate >= 15) {
    healthScore = 80;
    healthStatus = "ভালো ও ভারসাম্যপূর্ণ";
    summary = `আপনার সঞ্চয়ের হার ${savingsRate}%। আপনি স্বাস্থ্যকর আর্থিক সীমার মধ্যে আছেন। কিছু অপ্রয়োজনীয় খরচ কমিয়ে এটিকে ২৫%-এ উন্নীত করা সম্ভব।`;
    tips.push("৫০/৩০/২০ নিয়ম মেনে চলুন (৫০% প্রয়োজন, ৩০% ইচ্ছা, ২০% সঞ্চয়)।");
    tips.push("মাসিক সাবস্ক্রিপশন ও বিলগুলো পর্যালোচনা করুন।");
    tips.push("নগদ খরচের পাশাপাশি ডিজিটাল ওয়ালেটের ট্রানজ্যাকশনগুলোও নোট রাখুন।");
  } else {
    healthScore = 55;
    healthStatus = "মনোযোগ প্রয়োজন";
    summary = `আপনার সঞ্চয়ের হার কম (${savingsRate}%)। খরচের প্রবাহ নিয়ন্ত্রণে না রাখলে জরুরি মুহূর্তে আর্থিক সংকটের ঝুঁকি তৈরি হতে পারে।`;
    tips.push("বাইরে খাওয়া এবং ইম্পালসিভ কেনাকাটা কিছুটা নিয়ন্ত্রণ করার চেষ্টা করুন।");
    tips.push("বাজেটের নির্ধারিত সীমার বেশি খরচ না করার জন্য খরচের পূর্বে ভাবুন।");
    tips.push("মাসিক আয়ের অন্তত ১০% পে-চেক পাওয়ার দিনেই আলাদা সেভিংস অ্যাকাউন্টে সরিয়ে ফেলুন।");
  }

  // Add specific tip based on top category
  if (topCategory === "খাবার" && topCategoryAmount > 0) {
    tips[1] = `খাবার খাতে সবচেয়ে বেশি খরচ (৳${Math.round(topCategoryAmount)}) হয়েছে। ঘরে রান্না করা খাবার গ্রহণ করলে খরচ অনেক কমে আসবে।`;
  } else if (topCategory === "কেনাকাটা" && topCategoryAmount > 0) {
    tips[1] = `কেনাকাটায় সবচেয়ে বেশি ব্যয় হয়েছে। কোনো কিছু কেনার আগে অন্তত ২৪ ঘণ্টা সময় নিয়ে ভাবুন যে এটি সত্যিই প্রয়োজন কিনা।`;
  } else if (topCategory === "যাতায়াত" && topCategoryAmount > 0) {
    tips[1] = `যাতায়াত খরচ নিয়ন্ত্রণে রাখতে সম্ভব হলে গণপরিবহন বা শেয়ার্ড রাইড ব্যবহার বিবেচনা করুন।`;
  }

  // Budget warning
  if (monthlyBudget > 0 && budgetUtilization > 85) {
    tips[2] = `সতর্কতা: আপনি মাসিক বাজেটের ${budgetUtilization}% খরচ করে ফেলেছেন! মাসের বাকি দিনগুলো সতর্ক থাকুন।`;
  }

  return {
    healthScore,
    healthStatus,
    summary,
    tips: tips.slice(0, 3),
    source: "smart_rules",
  };
}
