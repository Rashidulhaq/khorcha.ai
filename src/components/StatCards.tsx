import React from "react";
import { ArrowDownRight, ArrowUpRight, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { formatCurrency, toBengaliNumber } from "../lib/utils";

interface StatCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  useBengaliDigits: boolean;
}

export function StatCards({ totalIncome, totalExpense, balance, useBengaliDigits }: StatCardsProps) {
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const savingsAmount = Math.max(0, totalIncome - totalExpense);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Total Balance */}
      <Card className="border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 truncate">মোট ব্যালেন্স</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className={`text-base sm:text-2xl font-bold tracking-tight truncate ${balance < 0 ? "text-rose-600" : "text-zinc-900"}`}>
              {formatCurrency(balance, useBengaliDigits)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 sm:mt-1 truncate">
              বর্তমান জমাকৃত মোট অর্থ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Income */}
      <Card className="border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-emerald-700 truncate">মোট আয়</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className="text-base sm:text-2xl font-bold tracking-tight text-emerald-600 truncate">
              {formatCurrency(totalIncome, useBengaliDigits)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 sm:mt-1 truncate">
              বেতন, ব্যবসা ও প্রাপ্তি
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Expense */}
      <Card className="border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-rose-700 truncate">মোট খরচ</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600">
              <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className="text-base sm:text-2xl font-bold tracking-tight text-rose-600 truncate">
              {formatCurrency(totalExpense, useBengaliDigits)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 sm:mt-1 truncate">
              মাসিক সামগ্রিক ব্যয়
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Savings & Rate */}
      <Card className="border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition-all">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 truncate">মোট সঞ্চয়</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600">
              <PiggyBank className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <div className="text-base sm:text-2xl font-bold tracking-tight text-zinc-900 truncate">
              {formatCurrency(savingsAmount, useBengaliDigits)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
              <span className="text-[10px] sm:text-[11px] text-zinc-500">হার:</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                {useBengaliDigits ? `${toBengaliNumber(savingsRate)}%` : `${savingsRate}%`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
