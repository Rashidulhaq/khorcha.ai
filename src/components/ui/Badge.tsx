import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "emerald" | "amber" | "rose" | "blue";
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-900 text-white",
    secondary: "bg-zinc-100 text-zinc-800",
    outline: "border border-zinc-200 text-zinc-700 bg-white",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/60",
    blue: "bg-sky-50 text-sky-700 border border-sky-200/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
