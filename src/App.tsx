import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { StatCards } from "./components/StatCards";
import { AiExpenseBar } from "./components/AiExpenseBar";
import { TransactionList } from "./components/TransactionList";
import { BudgetSection } from "./components/BudgetSection";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { TransactionModal } from "./components/TransactionModal";
import { AiAdviceModal } from "./components/AiAdviceModal";
import { PdfExportModal } from "./components/PdfExportModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Modal } from "./components/ui/Modal";
import { Button } from "./components/ui/Button";
import { AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";
import { Transaction, BudgetConfig } from "./types";
import { INITIAL_TRANSACTIONS, INITIAL_BUDGET } from "./data/initialData";
import { DatePeriodFilter } from "./lib/utils";

const STORAGE_KEYS = {
  TRANSACTIONS: "khorcha_ai_v4_tx",
  BUDGET: "khorcha_ai_v4_budget",
  DIGITS: "khorcha_ai_bengali_digits",
};

export default function App() {
  // Load state from localStorage with fallback (clean 0 starting amounts)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      // Clean legacy keys from older revisions
      localStorage.removeItem("khorcha_ai_transactions");
      localStorage.removeItem("khorcha_ai_budget");
      localStorage.removeItem("khorcha_ai_amounts_reset_v2");

      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to read transactions from localStorage", e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to read budget from localStorage", e);
    }
    return INITIAL_BUDGET;
  });

  const [useBengaliDigits, setUseBengaliDigits] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIGITS);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return true; // Default to Bengali digits
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiAdviceOpen, setIsAiAdviceOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfInitialPeriod, setPdfInitialPeriod] = useState<DatePeriodFilter>("all");
  const [pdfInitialCustomRange, setPdfInitialCustomRange] = useState<{ startDate: string; endDate: string } | undefined>(undefined);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error("Failed to save transactions", e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
    } catch (e) {
      console.error("Failed to save budget", e);
    }
  }, [budget]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIGITS, JSON.stringify(useBengaliDigits));
    } catch (e) {
      console.error("Failed to save digits preference", e);
    }
  }, [useBengaliDigits]);

  // Financial calculations
  const { totalIncome, totalExpense, balance, categoryExpenses } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catExpenses: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expense += tx.amount;
        catExpenses[tx.category] = (catExpenses[tx.category] || 0) + tx.amount;
      }
    }

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryExpenses: catExpenses,
    };
  }, [transactions]);

  // Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, "id" | "createdAt">,
    id?: string
  ) => {
    if (id) {
      // Edit
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...txData } : item
        )
      );
    } else {
      // Add new
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleExportData = () => {
    const dataToExport = {
      app: "Khorcha ai",
      exportDate: new Date().toISOString(),
      transactions,
      budget,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khorcha-ai-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenResetDialog = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetAll = () => {
    setTransactions([]);
    setBudget({ monthlyLimit: 0, categoryLimits: {} });
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.BUDGET);
      localStorage.removeItem("khorcha_ai_transactions");
      localStorage.removeItem("khorcha_ai_budget");
      localStorage.removeItem("khorcha_ai_amounts_reset_v2");
    } catch (e) {
      console.error(e);
    }
    setIsResetConfirmOpen(false);
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenAiAdvice={() => setIsAiAdviceOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        useBengaliDigits={useBengaliDigits}
        onToggleDigits={() => setUseBengaliDigits((prev) => !prev)}
        onExportData={handleExportData}
        onResetAllData={handleOpenResetDialog}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
        {/* Top Stat Cards */}
        <StatCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          useBengaliDigits={useBengaliDigits}
        />

        {/* Khorcha AI Natural Language Input */}
        <AiExpenseBar
          onAddTransaction={(txData) => handleSaveTransaction(txData)}
          useBengaliDigits={useBengaliDigits}
        />

        {/* Content Layout: 2 Columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Main Column: Transaction History (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <TransactionList
              transactions={transactions}
              onEdit={handleEditClick}
              onDelete={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              onResetAll={handleOpenResetDialog}
              onDownloadPdf={(period = "all", customRange) => {
                setPdfInitialPeriod(period);
                setPdfInitialCustomRange(customRange);
                setIsPdfModalOpen(true);
              }}
              useBengaliDigits={useBengaliDigits}
            />
          </div>

          {/* Sidebar Column: Budget & Analytics (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <BudgetSection
              budget={budget}
              totalExpense={totalExpense}
              categoryExpenses={categoryExpenses}
              onUpdateBudget={(newBudget) => setBudget(newBudget)}
              useBengaliDigits={useBengaliDigits}
            />

            <AnalyticsSection
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              categoryExpenses={categoryExpenses}
              useBengaliDigits={useBengaliDigits}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-5 sm:py-6 mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-zinc-800 font-mono">Khorcha.ai</span>
            <span>—</span>
            <span>বাংলা মানি ম্যানেজমেন্ট ও বাজেট ট্র্যাকার</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>কোনো লগইন ছাড়াই নিরাপদ</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="hover:text-emerald-700 underline cursor-pointer text-emerald-600 font-medium"
            >
              PDF রিপোর্ট
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenAiAdvice={() => setIsAiAdviceOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenResetDialog={handleOpenResetDialog}
      />

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* AI Advice Modal */}
      <AiAdviceModal
        isOpen={isAiAdviceOpen}
        onClose={() => setIsAiAdviceOpen(false)}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        monthlyBudget={budget.monthlyLimit}
        categoryExpenses={categoryExpenses}
        useBengaliDigits={useBengaliDigits}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        transactions={transactions}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        budget={budget}
        categoryExpenses={categoryExpenses}
        useBengaliDigits={useBengaliDigits}
        initialPeriod={pdfInitialPeriod}
      />

      {/* In-App Reset Confirmation Dialog */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="সব হিসাব মুছে শূন্য (০) করতে চান?"
        description="এই কাজটি সম্পন্ন হলে আপনার পূর্বের সকল লেনদেন ও বাজেটের রেকর্ড সাথে সাথে মুছে যাবে।"
      >
        <div className="pt-2 space-y-4">
          <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 sm:p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <strong className="font-semibold block mb-0.5 text-rose-950">
                সতর্কতা: এটি সম্পূর্ণ অপরিবর্তনীয়!
              </strong>
              আপনার বর্তমান মোট ব্যালেন্স, আয়ের হিসাব এবং খরচের ইতিহাস মুছে ফেলা হবে এবং সংখ্যাগুলো{" "}
              <strong className="underline">০ টাকা</strong> হয়ে যাবে।
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 flex-col-reverse xs:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetConfirmOpen(false)}
              className="w-full xs:w-auto"
            >
              বাতিল করুন
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full xs:w-auto bg-rose-600 hover:bg-rose-700 text-white font-medium"
              onClick={handleConfirmResetAll}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              হ্যাঁ, সব মুছে ০ করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification after Reset */}
      {showResetSuccess && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-3 shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[90vw] whitespace-nowrap">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">সব লেনদেন ও হিসাব মুছে ০ করা হয়েছে</span>
        </div>
      )}
    </div>
  );
}
