import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Plus,
  RotateCcw,
  Utensils,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  User,
  MoreHorizontal,
  Briefcase,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  FileDown,
  Clock,
  CalendarDays,
  CalendarRange,
  X,
} from "lucide-react";
import { Transaction, TransactionType } from "../types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import {
  formatCurrency,
  formatDateBangla,
  toBengaliNumber,
  DatePeriodFilter,
  isDateInPeriod,
  getLocalDateString,
} from "../lib/utils";
import { DEFAULT_CATEGORIES } from "../data/initialData";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  onResetAll?: () => void;
  onDownloadPdf?: (period?: DatePeriodFilter, customRange?: { startDate: string; endDate: string }) => void;
  useBengaliDigits: boolean;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
  onResetAll,
  onDownloadPdf,
  useBengaliDigits,
}: TransactionListProps) {
  const [periodFilter, setPeriodFilter] = useState<DatePeriodFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => getLocalDateString());
  const [activeTab, setActiveTab] = useState<"all" | TransactionType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Calculate transaction count across each period
  const periodCounts = useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    let custom = 0;
    const customRange = { startDate: customStartDate, endDate: customEndDate };
    for (const tx of transactions) {
      if (isDateInPeriod(tx.date, "today")) today++;
      if (isDateInPeriod(tx.date, "week")) week++;
      if (isDateInPeriod(tx.date, "month")) month++;
      if (isDateInPeriod(tx.date, "custom", customRange)) custom++;
    }
    return {
      all: transactions.length,
      today,
      week,
      month,
      custom,
    };
  }, [transactions, customStartDate, customEndDate]);

  const getCategoryIcon = (categoryName: string, type: TransactionType) => {
    const found = DEFAULT_CATEGORIES.find((c) => c.name === categoryName);
    const iconName = found ? found.iconName : type === "income" ? "TrendingUp" : "MoreHorizontal";

    const props = { className: "h-4 w-4" };
    switch (iconName) {
      case "Utensils":
        return <Utensils {...props} />;
      case "Car":
        return <Car {...props} />;
      case "Home":
        return <Home {...props} />;
      case "ShoppingBag":
        return <ShoppingBag {...props} />;
      case "HeartPulse":
        return <HeartPulse {...props} />;
      case "Film":
        return <Film {...props} />;
      case "GraduationCap":
        return <GraduationCap {...props} />;
      case "User":
        return <User {...props} />;
      case "Briefcase":
        return <Briefcase {...props} />;
      case "Store":
        return <Store {...props} />;
      case "Laptop":
        return <Laptop {...props} />;
      case "TrendingUp":
        return <TrendingUp {...props} />;
      case "Gift":
        return <Gift {...props} />;
      case "Coins":
        return <Coins {...props} />;
      default:
        return <MoreHorizontal {...props} />;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Time period filter
      if (
        !isDateInPeriod(tx.date, periodFilter, {
          startDate: customStartDate,
          endDate: customEndDate,
        })
      ) {
        return false;
      }
      // Type filter
      if (activeTab !== "all" && tx.type !== activeTab) return false;
      // Category filter
      if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchMethod = tx.paymentMethod.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchNote && !matchCategory && !matchMethod && !matchAmount) return false;
      }
      return true;
    });
  }, [
    transactions,
    periodFilter,
    customStartDate,
    customEndDate,
    activeTab,
    categoryFilter,
    searchQuery,
  ]);

  // Financial summary for the currently active filter/period
  const activePeriodSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
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

  const periodLabelMap: Record<DatePeriodFilter, string> = {
    all: "সব সময়",
    today: "আজকের লেনদেন",
    week: "১ সপ্তাহের লেনদেন (৭ দিন)",
    month: "১ মাসের লেনদেন (৩০ দিন)",
    custom: getCustomPeriodLabel(),
  };

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">লেনদেনের ইতিহাস</h3>
            <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">
              {useBengaliDigits
                ? `${toBengaliNumber(filteredTransactions.length)} টি`
                : `${filteredTransactions.length} records`}
            </Badge>
            {onDownloadPdf && transactions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onDownloadPdf(periodFilter, {
                    startDate: customStartDate,
                    endDate: customEndDate,
                  })
                }
                title={
                  periodFilter === "all"
                    ? "সম্পূর্ণ স্টেটমেন্ট PDF ডাউনলোড"
                    : `${periodLabelMap[periodFilter]} PDF রিপোর্ট`
                }
                className="text-[11px] sm:text-xs text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer ml-1"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>
                  {periodFilter === "today"
                    ? "আজকের PDF"
                    : periodFilter === "week"
                    ? "১ সপ্তাহের PDF"
                    : periodFilter === "month"
                    ? "১ মাসের PDF"
                    : periodFilter === "custom"
                    ? "কাস্টম PDF"
                    : "PDF রিপোর্ট"}
                </span>
              </button>
            )}
            {onResetAll && transactions.length > 0 && (
              <button
                type="button"
                onClick={onResetAll}
                title="সব হিসাব মুছে ০ করুন"
                className="text-[11px] sm:text-xs text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer ml-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>সব মুছে ০ করুন</span>
              </button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
            {periodFilter === "all"
              ? "সকল আয় ও ব্যয়ের বিস্তারিত রেকর্ড"
              : `${periodLabelMap[periodFilter]}-এর ফিল্টারকৃত হিসাব`}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="বিবরণ বা ক্যাটাগরি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/70 py-2 sm:py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Time Period Quick Filters: All, Today, 1 Week, 1 Month */}
      <div className="pt-3 pb-2 border-b border-zinc-100">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span>সময়কালের ফিল্টার:</span>
          </span>
          {periodFilter !== "all" && (
            <button
              type="button"
              onClick={() => setPeriodFilter("all")}
              className="text-[10px] text-zinc-500 hover:text-zinc-800 underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <X className="h-2.5 w-2.5" />
              <span>রিসেট (সব সময়)</span>
            </button>
          )}
        </div>

        {/* Horizontal scrollable / wrap button group */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {/* All */}
          <button
            type="button"
            onClick={() => setPeriodFilter("all")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              periodFilter === "all"
                ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs font-semibold"
                : "bg-zinc-50/80 text-zinc-700 border-zinc-200/70 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>সব সময়</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                periodFilter === "all"
                  ? "bg-zinc-800 text-emerald-400"
                  : "bg-zinc-200/80 text-zinc-600"
              }`}
            >
              {useBengaliDigits ? toBengaliNumber(periodCounts.all) : periodCounts.all}
            </span>
          </button>

          {/* Today */}
          <button
            type="button"
            onClick={() => setPeriodFilter("today")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              periodFilter === "today"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                : "bg-zinc-50/80 text-zinc-700 border-zinc-200/70 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>আজকের লেনদেন</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                periodFilter === "today"
                  ? "bg-emerald-700 text-white font-bold"
                  : periodCounts.today > 0
                  ? "bg-emerald-100 text-emerald-800 font-semibold"
                  : "bg-zinc-200/80 text-zinc-600"
              }`}
            >
              {useBengaliDigits ? toBengaliNumber(periodCounts.today) : periodCounts.today}
            </span>
          </button>

          {/* 1 Week */}
          <button
            type="button"
            onClick={() => setPeriodFilter("week")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              periodFilter === "week"
                ? "bg-teal-700 text-white border-teal-700 shadow-2xs font-semibold"
                : "bg-zinc-50/80 text-zinc-700 border-zinc-200/70 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>১ সপ্তাহ (৭ দিন)</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                periodFilter === "week"
                  ? "bg-teal-800 text-white font-bold"
                  : periodCounts.week > 0
                  ? "bg-teal-100 text-teal-800 font-semibold"
                  : "bg-zinc-200/80 text-zinc-600"
              }`}
            >
              {useBengaliDigits ? toBengaliNumber(periodCounts.week) : periodCounts.week}
            </span>
          </button>

          {/* 1 Month */}
          <button
            type="button"
            onClick={() => setPeriodFilter("month")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              periodFilter === "month"
                ? "bg-cyan-800 text-white border-cyan-800 shadow-2xs font-semibold"
                : "bg-zinc-50/80 text-zinc-700 border-zinc-200/70 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>১ মাস (৩০ দিন)</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                periodFilter === "month"
                  ? "bg-cyan-900 text-white font-bold"
                  : periodCounts.month > 0
                  ? "bg-cyan-100 text-cyan-800 font-semibold"
                  : "bg-zinc-200/80 text-zinc-600"
              }`}
            >
              {useBengaliDigits ? toBengaliNumber(periodCounts.month) : periodCounts.month}
            </span>
          </button>

          {/* Custom Date */}
          <button
            type="button"
            onClick={() => setPeriodFilter("custom")}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              periodFilter === "custom"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold"
                : "bg-zinc-50/80 text-zinc-700 border-zinc-200/70 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <CalendarRange className="h-3 w-3" />
              <span>কাস্টম তারিখ</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                periodFilter === "custom"
                  ? "bg-indigo-700 text-white font-bold"
                  : periodCounts.custom > 0
                  ? "bg-indigo-100 text-indigo-800 font-semibold"
                  : "bg-zinc-200/80 text-zinc-600"
              }`}
            >
              {useBengaliDigits ? toBengaliNumber(periodCounts.custom) : periodCounts.custom}
            </span>
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {periodFilter === "custom" && (
          <div className="mt-2.5 rounded-lg border border-indigo-200/90 bg-indigo-50/40 p-2.5 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950">
                <CalendarRange className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>তারিখ বা সময়সীমা নির্বাচন করুন:</span>
              </div>

              {/* Quick shortcuts */}
              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const t = getLocalDateString();
                    setCustomStartDate(t);
                    setCustomEndDate(t);
                  }}
                  className="px-2 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                >
                  আজ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    const str = getLocalDateString(y);
                    setCustomStartDate(str);
                    setCustomEndDate(str);
                  }}
                  className="px-2 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                >
                  গতকাল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 6);
                    setCustomStartDate(getLocalDateString(d));
                    setCustomEndDate(getLocalDateString());
                  }}
                  className="px-2 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
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
                  className="px-2 py-0.5 rounded border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 cursor-pointer font-medium"
                >
                  চলতি মাস
                </button>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">
                  শুরুর তারিখ (হতে):
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">
                  শেষ তারিখ (পর্যন্ত):
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected Period Financial Summary Bar */}
        {periodFilter !== "all" && (
          <div className="mt-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 p-2.5 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900">
                  {periodFilter === "today" && "আজকের হিসাব সারসংক্ষেপ"}
                  {periodFilter === "week" && "বিগত ১ সপ্তাহের হিসাব সারসংক্ষেপ"}
                  {periodFilter === "month" && "বিগত ১ মাসের হিসাব সারসংক্ষেপ"}
                  {periodFilter === "custom" && `${getCustomPeriodLabel()}-এর হিসাব সারসংক্ষেপ`}
                </div>
                <div className="text-[10px] text-zinc-500">
                  মোট লেনদেন:{" "}
                  {useBengaliDigits
                    ? toBengaliNumber(activePeriodSummary.count)
                    : activePeriodSummary.count}{" "}
                  টি
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono shrink-0 self-end xs:self-auto">
              <div className="text-right">
                <span className="text-[9px] text-zinc-500 block font-sans">আয়</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(activePeriodSummary.income, useBengaliDigits)}
                </span>
              </div>
              <div className="h-5 w-px bg-zinc-200" />
              <div className="text-right">
                <span className="text-[9px] text-zinc-500 block font-sans">ব্যয়</span>
                <span className="font-bold text-rose-600">
                  -{formatCurrency(activePeriodSummary.expense, useBengaliDigits)}
                </span>
              </div>
              <div className="h-5 w-px bg-zinc-200" />
              <div className="text-right">
                <span className="text-[9px] text-zinc-500 block font-sans">নিট স্থিতি</span>
                <span
                  className={`font-bold ${
                    activePeriodSummary.balance >= 0 ? "text-zinc-900" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(activePeriodSummary.balance, useBengaliDigits)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (All / Expense / Income) & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 pb-2">
        {/* Type tabs */}
        <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 text-xs font-medium w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-initial rounded-md px-3 py-1.5 text-center transition-all ${
              activeTab === "all"
                ? "bg-white text-zinc-900 font-semibold shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            সব
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`flex-1 sm:flex-initial rounded-md px-3 py-1.5 text-center transition-all ${
              activeTab === "expense"
                ? "bg-white text-rose-600 font-semibold shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span>খরচ</span>
            <span className="hidden sm:inline"> (Expense)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`flex-1 sm:flex-initial rounded-md px-3 py-1.5 text-center transition-all ${
              activeTab === "income"
                ? "bg-white text-emerald-600 font-semibold shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <span>আয়</span>
            <span className="hidden sm:inline"> (Income)</span>
          </button>
        </div>

        {/* Category dropdown filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white py-1.5 px-2.5 text-xs text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Table / Cards */}
      <div className="divide-y divide-zinc-100 mt-1">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 mt-3">
              {periodFilter === "today"
                ? "আজকের কোনো লেনদেন পাওয়া যায়নি"
                : periodFilter === "week"
                ? "বিগত ১ সপ্তাহে (৭ দিনে) কোনো লেনদেন পাওয়া যায়নি"
                : periodFilter === "month"
                ? "বিগত ১ মাসে (৩০ দিনে) কোনো লেনদেন পাওয়া যায়নি"
                : periodFilter === "custom"
                ? "নির্বাচিত কাস্টম তারিখে কোনো লেনদেন পাওয়া যায়নি"
                : "কোনো লেনদেন পাওয়া যায়নি"}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {periodFilter !== "all"
                ? "সব লেনদেন দেখতে 'সব সময়' নির্বাচন করুন অথবা নতুন লেনদেন যোগ করুন"
                : "নতুন লেনদেন যোগ করতে উপরের ইনপুট বা নিচের বাটন ব্যবহার করুন"}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {periodFilter !== "all" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPeriodFilter("all")}
                  className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  সব সময় দেখুন
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenAddModal}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                নতুন হিসাব যোগ করুন
              </Button>
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between py-2.5 sm:py-3 px-1.5 sm:px-2 rounded-lg hover:bg-zinc-50/80 transition-colors"
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${
                    tx.type === "income"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200/60"
                  }`}
                >
                  {getCategoryIcon(tx.category, tx.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs">
                      {tx.note}
                    </span>
                    <Badge
                      variant={tx.type === "income" ? "emerald" : "secondary"}
                      className="text-[9px] sm:text-[10px] py-0 px-1 sm:px-1.5"
                    >
                      {tx.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateBangla(tx.date)}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500 font-medium">
                      {tx.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-1.5 sm:ml-2">
                <div className="text-right">
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono tracking-tight flex items-center justify-end gap-0.5 ${
                      tx.type === "income" ? "text-emerald-600" : "text-zinc-900"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline text-rose-500" />
                    )}
                    <span>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, useBengaliDigits)}
                    </span>
                  </div>
                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(tx)}
                    title="সম্পাদনা করুন"
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 active:text-zinc-900 hover:bg-zinc-200/60 rounded-md transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tx.id)}
                    title="মুছে ফেলুন"
                    className="p-1.5 text-zinc-400 hover:text-rose-600 active:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
