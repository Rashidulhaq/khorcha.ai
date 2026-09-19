import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Plus,
  FileDown,
  RotateCcw,
  Wallet,
  BrainCircuit,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenAiAdvice: () => void;
  onOpenPdfModal: () => void;
  useBengaliDigits: boolean;
  onToggleDigits: () => void;
  onExportData?: () => void;
  onResetAllData: () => void;
}

export function Header({
  onOpenAddModal,
  onOpenAiAdvice,
  onOpenPdfModal,
  useBengaliDigits,
  onToggleDigits,
  onExportData,
  onResetAllData,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-emerald-400 shadow-xs border border-zinc-800">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 font-mono">
                Khorcha<span className="text-emerald-600">.ai</span>
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 font-sans truncate">
                (খরচা AI)
              </span>
              <Badge variant="emerald" className="hidden md:inline-flex text-[10px] py-0">
                <Sparkles className="h-3 w-3 mr-1 text-emerald-500" />
                স্মার্ট হিসাব
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-500 hidden md:block">
              সহজ বাংলা মানি ম্যানেজমেন্ট ও বাজেট ট্র্যাকার
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Digit toggle - visible on mobile too as compact badge button */}
          <button
            type="button"
            onClick={onToggleDigits}
            title={useBengaliDigits ? "ইংরেজি সংখ্যায় পরিবর্তন করুন" : "বাংলা সংখ্যায় পরিবর্তন করুন"}
            className="flex items-center gap-1 h-8 px-2 sm:px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] sm:text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <span className="text-zinc-400 text-[10px] hidden sm:inline">সংখ্যা:</span>
            <span className="font-semibold font-mono">{useBengaliDigits ? "১২৩" : "123"}</span>
          </button>

          {/* PDF Download Button (desktop/tablet) */}
          <button
            type="button"
            onClick={onOpenPdfModal}
            title="আর্থিক স্টেটমেন্ট PDF ডাউনলোড"
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 transition-colors text-xs font-medium cursor-pointer"
          >
            <FileDown className="h-3.5 w-3.5 text-emerald-700" />
            <span>PDF ডাউনলোড</span>
          </button>

          {/* Reset All Data (desktop & tablet) */}
          <button
            id="reset-all-btn"
            type="button"
            onClick={onResetAllData}
            title="সব হিসাব মুছে ০ করুন (রিসেট)"
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-rose-200/80 bg-rose-50/50 text-rose-700 hover:text-rose-800 hover:bg-rose-100/70 transition-colors text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>হিসাব রিসেট</span>
          </button>

          {/* AI Financial Advice button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAiAdvice}
            className="h-8 px-2 sm:px-3 border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-xs"
          >
            <BrainCircuit className="h-3.5 w-3.5 sm:mr-1 text-emerald-600" />
            <span className="hidden sm:inline">AI পরামর্শ</span>
          </Button>

          {/* Add Transaction Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="h-8 px-2.5 sm:px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden xs:inline sm:inline">নতুন হিসাব</span>
          </Button>

          {/* Mobile More Options Dropdown */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="অতিরিক্ত অপশন"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-100 mb-1">
                  অতিরিক্ত অপশন
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPdfModal();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5 text-emerald-600" />
                  <span>PDF রিপোর্ট ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onResetAllData();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>সব হিসাব মুছে ০ করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
