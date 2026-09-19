import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, CheckCircle2, TrendingUp, RefreshCw, Lightbulb } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { AIAdviceResult } from "../types";
import { toBengaliNumber } from "../lib/utils";
import { generateSmartFinancialAdvice } from "../lib/financialAdvisor";

interface AiAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBudget: number;
  categoryExpenses: Record<string, number>;
  useBengaliDigits: boolean;
}

export function AiAdviceModal({
  isOpen,
  onClose,
  totalIncome,
  totalExpense,
  balance,
  monthlyBudget,
  categoryExpenses,
  useBengaliDigits,
}: AiAdviceModalProps) {
  const [adviceData, setAdviceData] = useState<AIAdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdvice = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/financial-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalIncome,
          totalExpense,
          balance,
          monthlyBudget,
          categoryBreakdown: categoryExpenses,
        }),
      });

      if (response.ok) {
        const data: AIAdviceResult = await response.json();
        setAdviceData(data);
        return;
      }
      
      // Fallback
      const fallback = generateSmartFinancialAdvice({
        totalIncome,
        totalExpense,
        balance,
        monthlyBudget,
        categoryBreakdown: categoryExpenses,
      });
      setAdviceData(fallback);
    } catch {
      // Network/offline fallback
      const fallback = generateSmartFinancialAdvice({
        totalIncome,
        totalExpense,
        balance,
        monthlyBudget,
        categoryBreakdown: categoryExpenses,
      });
      setAdviceData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !adviceData) {
      fetchAdvice();
    }
  }, [isOpen]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khorcha AI আর্থিক পরামর্শ ও বিশ্লেষণ"
      description="আপনার সার্বিক আয়-ব্যয়ের ডাটা বিশ্লেষণ করে ব্যক্তিগত পরামর্শ"
    >
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-pulse">
            <BrainCircuit className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-zinc-800 mt-3">
            Khorcha AI আপনার খরচের হিসাব বিশ্লেষণ করছে...
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            সঞ্চয় ও বাজেটের ভারসাম্য পর্যালোচনা চলছে
          </p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-3">
            {error}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAdvice}
            className="mt-3"
          >
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      ) : adviceData ? (
        <div className="space-y-4 pt-1">
          {/* Health Score Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/50">
            <div>
              <span className="text-xs text-zinc-500 font-medium block">
                আর্থিক সুস্থতা স্কোর (Health Score)
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-zinc-900">
                  {useBengaliDigits ? toBengaliNumber(adviceData.healthScore) : adviceData.healthScore}
                  <span className="text-zinc-400 text-sm font-normal"> / ১০০</span>
                </span>
                <Badge variant="emerald" className="font-semibold text-xs">
                  {adviceData.healthStatus}
                </Badge>
              </div>
            </div>
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center border-2 font-bold font-mono text-sm ${getScoreColor(
                adviceData.healthScore
              )}`}
            >
              {useBengaliDigits ? `${toBengaliNumber(adviceData.healthScore)}%` : `${adviceData.healthScore}%`}
            </div>
          </div>

          {/* AI Summary Assessment */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>AI পর্যালোচনা:</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              {adviceData.summary}
            </p>
          </div>

          {/* Tips Checklist */}
          <div>
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              ব্যয় নিয়ন্ত্রণ ও সঞ্চয়ের উপায়:
            </span>
            <div className="space-y-2">
              {adviceData.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-100 bg-white text-xs text-zinc-700 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchAdvice}
              className="text-xs text-zinc-500 hover:text-zinc-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              পুনরায় বিশ্লেষণ
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-zinc-900 hover:bg-zinc-800 text-xs px-4"
            >
              ঠিক আছে
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
