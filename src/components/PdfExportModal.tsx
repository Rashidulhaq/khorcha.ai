import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  Loader2,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Transaction, BudgetConfig } from "../types";
import {
  formatCurrency,
  formatDateBangla,
  toBengaliNumber,
  DatePeriodFilter,
  isDateInPeriod,
  getLocalDateString,
} from "../lib/utils";
import { generateStatementPDF } from "../lib/pdfGenerator";

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budget: BudgetConfig;
  categoryExpenses: Record<string, number>;
  useBengaliDigits: boolean;
  initialPeriod?: DatePeriodFilter;
  initialCustomRange?: { startDate: string; endDate: string };
}

export function PdfExportModal({
  isOpen,
  onClose,
  transactions,
  totalIncome,
  totalExpense,
  balance,
  budget,
  categoryExpenses,
  useBengaliDigits,
  initialPeriod = "all",
  initialCustomRange,
}: PdfExportModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriodFilter>(initialPeriod);
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    if (initialCustomRange?.startDate) return initialCustomRange.startDate;
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    if (initialCustomRange?.endDate) return initialCustomRange.endDate;
    return getLocalDateString();
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPeriod(initialPeriod || "all");
      if (initialCustomRange?.startDate) {
        setCustomStartDate(initialCustomRange.startDate);
      }
      if (initialCustomRange?.endDate) {
        setCustomEndDate(initialCustomRange.endDate);
      }
    }
  }, [isOpen, initialPeriod, initialCustomRange]);

  // Filter transactions according to selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) =>
      isDateInPeriod(t.date, selectedPeriod, {
        startDate: customStartDate,
        endDate: customEndDate,
      })
    );
  }, [transactions, selectedPeriod, customStartDate, customEndDate]);

  // Recalculate metrics for the selected period
  const periodMetrics = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const catExp: Record<string, number> = {};
    for (const tx of filteredTransactions) {
      if (tx.type === "income") {
        inc += tx.amount;
      } else {
        exp += tx.amount;
        catExp[tx.category] = (catExp[tx.category] || 0) + tx.amount;
      }
    }
    return {
      income: inc,
      expense: exp,
      balance: inc - exp,
      categoryExpenses: catExp,
    };
  }, [filteredTransactions]);

  const getCustomPeriodLabel = () => {
    if (customStartDate && customEndDate) {
      if (customStartDate === customEndDate) {
        return `${formatDateBangla(customStartDate)}-এর লেনদেন`;
      }
      return `${formatDateBangla(customStartDate)} হতে ${formatDateBangla(customEndDate)}`;
    }
    if (customStartDate) return `${formatDateBangla(customStartDate)} হতে পরবর্তী লেনদেন`;
    if (customEndDate) return `${formatDateBangla(customEndDate)} পর্যন্ত লেনদেন`;
    return "কাস্টম তারিখের লেনদেন";
  };

  const periodTitleMap: Record<DatePeriodFilter, string> = {
    all: "সকল লেনদেন",
    today: "আজকের লেনদেন",
    week: "১ সপ্তাহের লেনদেন (৭ দিন)",
    month: "১ মাসের লেনদেন (৩০ দিন)",
    custom: getCustomPeriodLabel(),
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      await generateStatementPDF({
        transactions: filteredTransactions,
        totalIncome: periodMetrics.income,
        totalExpense: periodMetrics.expense,
        balance: periodMetrics.balance,
        budget,
        categoryExpenses: periodMetrics.categoryExpenses,
        useBengaliDigits,
        periodTitle: periodTitleMap[selectedPeriod],
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setErrorMessage("PDF তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsGenerating(false);
    }
  };

  const todayBengali = new Date().toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="আর্থিক হিসাবের PDF রিপোর্ট ডাউনলোড"
      description="আপনার নির্বাচিত সময়কালের আয়, ব্যয় ও স্টেটমেন্টের প্রিন্ট-রেডি PDF"
    >
      <div className="space-y-4 pt-1">
        {/* Period Selector Tabs */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>কোন সময়কালের রিপোর্ট ডাউনলোড করবেন?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
            {(
              [
                { id: "all", label: "সব সময়" },
                { id: "today", label: "আজকের লেনদেন" },
                { id: "week", label: "১ সপ্তাহ (৭ দিন)" },
                { id: "month", label: "১ মাস (৩০ দিন)" },
                { id: "custom", label: "কাস্টম তারিখ" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  selectedPeriod === p.id
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs font-semibold"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker when selected */}
          {selectedPeriod === "custom" && (
            <div className="mt-2.5 rounded-lg border border-indigo-200/90 bg-indigo-50/40 p-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-950">
                  <CalendarRange className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>রিপোর্টের তারিখ নির্বাচন করুন:</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      const t = getLocalDateString();
                      setCustomStartDate(t);
                      setCustomEndDate(t);
                    }}
                    className="px-1.5 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                  >
                    আজ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 6);
                      setCustomStartDate(getLocalDateString(d));
                      setCustomEndDate(getLocalDateString());
                    }}
                    className="px-1.5 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                  >
                    বিগত ৭ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                      setCustomStartDate(getLocalDateString(firstDay));
                      setCustomEndDate(getLocalDateString());
                    }}
                    className="px-1.5 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                  >
                    চলতি মাস
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-zinc-600 block mb-0.5">
                    শুরুর তারিখ (হতে):
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-600 block mb-0.5">
                    শেষ তারিখ (পর্যন্ত):
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Summary Box */}
        <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/80">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-zinc-900 block">
                  Khorcha.ai ({periodTitleMap[selectedPeriod]})
                </span>
                <span className="text-[11px] text-zinc-500">{todayBengali}</span>
              </div>
            </div>
            <Badge variant="emerald" className="text-[10px]">
              A4 সাইজ রেডি
            </Badge>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-zinc-200/80">
              <span className="text-[10px] text-zinc-500 block">মোট লেনদেন</span>
              <span className="font-bold text-xs text-zinc-900 font-mono">
                {useBengaliDigits
                  ? toBengaliNumber(filteredTransactions.length)
                  : filteredTransactions.length}{" "}
                টি
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200/80">
              <span className="text-[10px] text-emerald-600 block">মোট আয়</span>
              <span className="font-bold text-xs text-emerald-700 font-mono truncate block">
                {formatCurrency(periodMetrics.income, useBengaliDigits)}
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200/80">
              <span className="text-[10px] text-rose-600 block">মোট ব্যয়</span>
              <span className="font-bold text-xs text-rose-700 font-mono truncate block">
                {formatCurrency(periodMetrics.expense, useBengaliDigits)}
              </span>
            </div>
          </div>
        </div>

        {/* What will be in the PDF */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-800 block">
            পিডিএফ রিপোর্টে যা যা অন্তর্ভুক্ত থাকবে:
          </span>
          <ul className="text-xs text-zinc-600 space-y-1.5 pl-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                {selectedPeriod === "all"
                  ? "বর্তমান মোট ব্যালেন্স ও সঞ্চয়ের শতকরা হার"
                  : `${periodTitleMap[selectedPeriod]}-এর মোট আয়, ব্যয় ও নেট ব্যালেন্স`}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>খাতভিত্তিক (বাজার, ভাড়া, খাবার ইত্যাদি) খরচের পূর্ণাঙ্গ বিশ্লেষণ</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>নির্বাচিত সময়কালের তারিখ, বিবরণ, পেমেন্ট মাধ্যমসহ সকল লেনদেনের টেবিল</span>
            </li>
          </ul>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            {errorMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 flex-col-reverse xs:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="w-full xs:w-auto"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={handleDownload}
            disabled={isGenerating || isSuccess}
            className="w-full xs:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                পিডিএফ তৈরি হচ্ছে...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-white" />
                ডাউনলোড সম্পন্ন হয়েছে!
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {selectedPeriod === "today"
                  ? "আজকের PDF ডাউনলোড"
                  : selectedPeriod === "week"
                  ? "১ সপ্তাহের PDF ডাউনলোড"
                  : selectedPeriod === "month"
                  ? "১ মাসের PDF ডাউনলোড"
                  : selectedPeriod === "custom"
                  ? "কাস্টম তারিখের PDF ডাউনলোড"
                  : "PDF ডাউনলোড করুন"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
