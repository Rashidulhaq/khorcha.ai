import React from "react";
import { PieChart, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { formatCurrency, toBengaliNumber } from "../lib/utils";
import { DEFAULT_CATEGORIES } from "../data/initialData";

interface AnalyticsSectionProps {
  totalIncome: number;
  totalExpense: number;
  categoryExpenses: Record<string, number>;
  useBengaliDigits: boolean;
}

export function AnalyticsSection({
  totalIncome,
  totalExpense,
  categoryExpenses,
  useBengaliDigits,
}: AnalyticsSectionProps) {
  // Sort expense categories by amount
  const sortedCategories = Object.entries(categoryExpenses)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Category color lookup
  const getCategoryColor = (name: string) => {
    const found = DEFAULT_CATEGORIES.find((c) => c.name === name);
    return found ? found.color : "#64748b";
  };

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900">খরচের খাতওয়ারি বিশ্লেষণ</h3>
          <Badge variant="secondary" className="text-[10px] sm:text-[11px]">
            ক্যাটাগরি
          </Badge>
        </div>
        {topCategory && (
          <span className="text-xs text-zinc-500 hidden sm:inline">
            সর্বোচ্চ খরচ: <span className="font-semibold text-zinc-800">{topCategory[0]}</span>
          </span>
        )}
      </div>

      {sortedCategories.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          কোনো খরচের হিসাব যোগ করা হয়নি
        </div>
      ) : (
        <div className="pt-4 space-y-3.5">
          {/* Stacked visually clean progress bar */}
          <div className="h-3 w-full rounded-full bg-zinc-100 flex overflow-hidden">
            {sortedCategories.map(([cat, amount], idx) => {
              const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
              return (
                <div
                  key={cat}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getCategoryColor(cat),
                  }}
                  className="h-full transition-all duration-300"
                  title={`${cat}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>

          {/* Individual Category Bars with Percentages */}
          <div className="space-y-2.5 pt-1">
            {sortedCategories.map(([cat, amount]) => {
              const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              const color = getCategoryColor(cat);

              return (
                <div key={cat} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-zinc-800">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-900">
                        {formatCurrency(amount, useBengaliDigits)}
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px] w-8 text-right">
                        {useBengaliDigits ? `${toBengaliNumber(pct)}%` : `${pct}%`}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Income vs Expense Ratio card */}
          <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="text-zinc-500 block text-[11px]">আয় অনুপাত</span>
              <span className="font-bold text-emerald-700 text-sm">
                {totalIncome > 0
                  ? formatCurrency(totalIncome, useBengaliDigits)
                  : "৳০"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100">
              <span className="text-zinc-500 block text-[11px]">ব্যয় অনুপাত</span>
              <span className="font-bold text-rose-700 text-sm">
                {totalExpense > 0
                  ? formatCurrency(totalExpense, useBengaliDigits)
                  : "৳০"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
