import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-xl border border-zinc-200 z-10 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-zinc-100">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 truncate">{title}</h2>
            {description ? <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">বন্ধ করুন</span>
          </button>
        </div>

        <div className="pt-3 sm:pt-4">{children}</div>
      </div>
    </div>
  );
}
