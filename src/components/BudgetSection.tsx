import React, { useState } from "react";
import { Sliders, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { BudgetConfig } from "../types";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { formatCurrency, toBengaliNumber } from "../lib/utils";
import { DEFAULT_CATEGORIES } from "../data/initialData";

interface BudgetSectionProps {
  budget: BudgetConfig;
  totalExpense: number;
  categoryExpenses: Record<string, number>;
  onUpdateBudget: (newBudget: BudgetConfig) => void;
  useBengaliDigits: boolean;
}

export function BudgetSection({
  budget,
  totalExpense,
  categoryExpenses,
  onUpdateBudget,
  useBengaliDigits,
}: BudgetSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(budget.monthlyLimit.toString());

  const percentageUsed =
    budget.monthlyLimit > 0 ? Math.min(100, Math.round((totalExpense / budget.monthlyLimit) * 100)) : 0;
  const isOverBudget = totalExpense > budget.monthlyLimit && budget.monthlyLimit > 0;
  const remaining = Math.max(0, budget.monthlyLimit - totalExpense);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(monthlyLimitInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateBudget({
        ...budget,
        monthlyLimit: parsed,
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900">মাসিক বাজেট ট্র্যাকার</h3>
          {budget.monthlyLimit <= 0 ? (
            <Badge variant="secondary" className="text-[10px] sm:text-[11px]">
              বাজেট নেই
            </Badge>
          ) : isOverBudget ? (
            <Badge variant="rose" className="text-[10px] sm:text-[11px]">
              <AlertTriangle className="h-3 w-3 mr-1" />
              বাজেট অতিক্রম!
            </Badge>
          ) : percentageUsed > 80 ? (
            <Badge variant="amber" className="text-[10px] sm:text-[11px]">
              <ShieldAlert className="h-3 w-3 mr-1" />
              সীমার কাছাকাছি
            </Badge>
          ) : (
            <Badge variant="emerald" className="text-[10px] sm:text-[11px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              নিয়ন্ত্রণে আছে
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMonthlyLimitInput(budget.monthlyLimit > 0 ? budget.monthlyLimit.toString() : "");
            setIsModalOpen(true);
          }}
          className="h-7 text-xs text-zinc-600 self-start xs:self-auto"
        >
          <Sliders className="h-3 w-3 mr-1" />
          {budget.monthlyLimit > 0 ? "বাজেট পরিবর্তন" : "বাজেট সেট করুন"}
        </Button>
      </div>

      {/* Main Budget Progress */}
      <div className="pt-3 sm:pt-4">
        <div className="flex items-baseline justify-between text-xs mb-1.5 flex-wrap gap-1">
          <div>
            <span className="font-semibold text-zinc-900">খরচ হয়েছে: </span>
            <span className="font-bold text-zinc-900">
              {formatCurrency(totalExpense, useBengaliDigits)}
            </span>
            <span className="text-zinc-400 text-[11px]">
              {budget.monthlyLimit > 0
                ? ` / ${formatCurrency(budget.monthlyLimit, useBengaliDigits)}`
                : " (বাজেট সেট করা হয়নি)"}
            </span>
          </div>
          <div className="font-bold font-mono text-xs sm:text-sm">
            <span className={isOverBudget ? "text-rose-600" : "text-zinc-700"}>
              {useBengaliDigits ? `${toBengaliNumber(percentageUsed)}%` : `${percentageUsed}%`}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? "bg-rose-500"
                : percentageUsed > 80
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
          <span>
            {isOverBudget
              ? `বাজেট ছাড়িয়েছে ৳${totalExpense - budget.monthlyLimit}`
              : `বাকি আছে: ${formatCurrency(remaining, useBengaliDigits)}`}
          </span>
          <span>লক্ষ্য: মাসিক আর্থিক নিয়ন্ত্রণ</span>
        </div>
      </div>

      {/* Category Budget Breakdown pills */}
      <div className="mt-4 pt-3 border-t border-zinc-100">
        <span className="text-xs font-semibold text-zinc-600 block mb-2">
          শীর্ষ ক্যাটাগরি খরচ:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_CATEGORIES.filter((c) => c.type === "expense")
            .slice(0, 4)
            .map((cat) => {
              const spent = categoryExpenses[cat.name] || 0;
              const limit = budget.categoryLimits[cat.name] || 5000;
              const catPercent = Math.min(100, Math.round((spent / limit) * 100));

              return (
                <div
                  key={cat.id}
                  className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-zinc-800">{cat.name}</span>
                    <span className="font-semibold text-zinc-900">
                      {formatCurrency(spent, useBengaliDigits)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        spent > limit ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="মাসিক বাজেট নির্ধারণ করুন"
        description="মাসিক খরচের সর্বোচ্চ সীমা নির্ধারণ করলে অতিরিক্ত খরচ এড়ানো সম্ভব হবে।"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              মাসিক খরচের সীমা (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                ৳
              </span>
              <Input
                type="number"
                min="100"
                step="500"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(e.target.value)}
                className="pl-8 text-base font-semibold"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="emerald">
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
