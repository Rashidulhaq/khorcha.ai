export type TransactionType = "expense" | "income";

export type PaymentMethod =
  | "নগদ"
  | "বিকাশ"
  | "নগদ (Nagad)"
  | "রকেট"
  | "ব্যাংক / কার্ড"
  | "অন্যান্য";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType | "both";
  iconName: string;
  color: string;
  bgLight: string;
}

export interface BudgetConfig {
  monthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface AIAdviceResult {
  healthScore: number;
  healthStatus: string;
  summary: string;
  tips: string[];
  source?: string;
}

export interface ParsedExpenseAI {
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  paymentMethod: PaymentMethod;
  date: string;
  source?: string;
}
