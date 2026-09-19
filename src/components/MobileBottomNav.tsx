import React from "react";
import { LayoutDashboard, Plus, BrainCircuit, RotateCcw, FileDown } from "lucide-react";

interface MobileBottomNavProps {
  onOpenAddModal: () => void;
  onOpenAiAdvice: () => void;
  onOpenPdfModal: () => void;
  onOpenResetDialog: () => void;
}

export function MobileBottomNav({
  onOpenAddModal,
  onOpenAiAdvice,
  onOpenPdfModal,
  onOpenResetDialog,
}: MobileBottomNavProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] sm:hidden shadow-lg"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {/* Dashboard / Summary tab */}
        <button
          type="button"
          onClick={scrollToTop}
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 hover:text-zinc-900 active:scale-95 transition-transform"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">ড্যাশবোর্ড</span>
        </button>

        {/* PDF Download tab */}
        <button
          type="button"
          onClick={onOpenPdfModal}
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 hover:text-emerald-700 active:scale-95 transition-transform"
        >
          <FileDown className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] font-medium">PDF রিপোর্ট</span>
        </button>

        {/* Primary Action Button: Add Transaction */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-2 border-white hover:bg-emerald-700 active:scale-90 transition-all cursor-pointer"
          aria-label="নতুন হিসাব যোগ করুন"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* AI Financial Advice */}
        <button
          type="button"
          onClick={onOpenAiAdvice}
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 hover:text-emerald-700 active:scale-95 transition-transform"
        >
          <BrainCircuit className="h-5 w-5 text-emerald-600" />
          <span className="text-[10px] font-medium">AI পরামর্শ</span>
        </button>

        {/* Quick Reset Option */}
        <button
          type="button"
          onClick={onOpenResetDialog}
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 hover:text-rose-600 active:scale-95 transition-transform"
        >
          <RotateCcw className="h-5 w-5 text-zinc-500 hover:text-rose-600" />
          <span className="text-[10px] font-medium">রিসেট</span>
        </button>
      </div>
    </nav>
  );
}
