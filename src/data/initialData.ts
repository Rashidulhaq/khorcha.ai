import { CategoryInfo, Transaction, BudgetConfig } from "../types";

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  // Expense categories
  { id: "food", name: "খাবার", type: "expense", iconName: "Utensils", color: "#f97316", bgLight: "#fff7ed" },
  { id: "transport", name: "যাতায়াত", type: "expense", iconName: "Car", color: "#0ea5e9", bgLight: "#f0f9ff" },
  { id: "bills", name: "বাড়ি ভাড়া ও বিল", type: "expense", iconName: "Home", color: "#8b5cf6", bgLight: "#f5f3ff" },
  { id: "shopping", name: "কেনাকাটা", type: "expense", iconName: "ShoppingBag", color: "#ec4899", bgLight: "#fdf2f8" },
  { id: "health", name: "স্বাস্থ্য", type: "expense", iconName: "HeartPulse", color: "#ef4444", bgLight: "#fef2f2" },
  { id: "entertainment", name: "বিনোদন", type: "expense", iconName: "Film", color: "#f59e0b", bgLight: "#fffbeb" },
  { id: "education", name: "শিক্ষা", type: "expense", iconName: "GraduationCap", color: "#06b6d4", bgLight: "#ecfeff" },
  { id: "personal", name: "ব্যক্তিগত", type: "expense", iconName: "User", color: "#64748b", bgLight: "#f8fafc" },
  { id: "other_expense", name: "অন্যান্য", type: "expense", iconName: "MoreHorizontal", color: "#71717a", bgLight: "#fafafa" },

  // Income categories
  { id: "salary", name: "বেতন", type: "income", iconName: "Briefcase", color: "#10b981", bgLight: "#ecfdf5" },
  { id: "business", name: "ব্যবসা", type: "income", iconName: "Store", color: "#059669", bgLight: "#ecfdf5" },
  { id: "freelance", name: "ফ্রিল্যান্সিং", type: "income", iconName: "Laptop", color: "#14b8a6", bgLight: "#f0fdfa" },
  { id: "investment", name: "বিনিয়োগ", type: "income", iconName: "TrendingUp", color: "#3b82f6", bgLight: "#eff6ff" },
  { id: "gift", name: "উপহার", type: "income", iconName: "Gift", color: "#a855f7", bgLight: "#faf5ff" },
  { id: "other_income", name: "অন্যান্য আয়", type: "income", iconName: "Coins", color: "#10b981", bgLight: "#f0fdf4" },
];

export const PAYMENT_METHODS = [
  "নগদ",
  "বিকাশ",
  "নগদ (Nagad)",
  "রকেট",
  "ব্যাংক / কার্ড",
  "অন্যান্য"
] as const;

// Clean starting state (all amounts reset to 0)
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGET: BudgetConfig = {
  monthlyLimit: 0,
  categoryLimits: {}
};

export const QUICK_AI_PROMPTS = [
  "আজকে দুপুরের খাবার ১২০ টাকা নগদ",
  "অফিসে যাওয়ার রিকশাভাড়া ৫০ টাকা",
  "সুপারশপ থেকে কেনাকাটা ৮৫০ টাকা বিকাশ",
  "টিউশন ফি পেলাম ৫০০০ টাকা",
  "ফার্মেসি থেকে ওষুধ নিলাম ৩৪০ টাকা নগদ",
  "বাসার বিদ্যুৎ বিল ৯২০ টাকা কার্ড"
];
