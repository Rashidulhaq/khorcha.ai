import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumber(num: number | string): string {
  const str = num.toString();
  return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export function formatCurrency(amount: number, useBengaliDigits: boolean = true): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("en-IN").format(rounded);
  if (useBengaliDigits) {
    return `৳${toBengaliNumber(formatted)}`;
  }
  return `৳${formatted}`;
}

export function formatDateBangla(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const monthsBangla = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  const day = date.getDate();
  const month = monthsBangla[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
}

export type DatePeriodFilter = "all" | "today" | "week" | "month" | "custom";

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateInPeriod(
  dateStr: string,
  period: DatePeriodFilter,
  customRange?: { startDate?: string; endDate?: string }
): boolean {
  if (period === "all") return true;
  if (!dateStr) return false;

  if (period === "custom") {
    if (!customRange) return true;
    const { startDate, endDate } = customRange;
    if (startDate && endDate) {
      const start = startDate <= endDate ? startDate : endDate;
      const end = startDate <= endDate ? endDate : startDate;
      return dateStr >= start && dateStr <= end;
    }
    if (startDate) return dateStr >= startDate;
    if (endDate) return dateStr <= endDate;
    return true;
  }

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const parts = dateStr.split("-");
  let targetYear = today.getFullYear();
  let targetMonth = today.getMonth();
  let targetDay = today.getDate();

  if (parts.length === 3) {
    targetYear = parseInt(parts[0], 10);
    targetMonth = parseInt(parts[1], 10) - 1;
    targetDay = parseInt(parts[2], 10);
  } else {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return true;
    targetYear = parsed.getFullYear();
    targetMonth = parsed.getMonth();
    targetDay = parsed.getDate();
  }

  const targetDateOnly = new Date(targetYear, targetMonth, targetDay).getTime();
  const diffDays = Math.round((todayDateOnly - targetDateOnly) / (1000 * 60 * 60 * 24));

  if (period === "today") {
    return diffDays === 0;
  }
  if (period === "week") {
    // Within last 7 days (including today)
    return diffDays >= 0 && diffDays <= 7;
  }
  if (period === "month") {
    // Within last 30 days or same calendar month
    return (
      (diffDays >= 0 && diffDays <= 30) ||
      (targetYear === today.getFullYear() && targetMonth === today.getMonth())
    );
  }
  return true;
}
