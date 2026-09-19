import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-lg text-sm";

    const variants = {
      default: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm",
      emerald: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm font-semibold",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
      outline: "border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-zinc-900 shadow-xs",
      ghost: "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900",
      destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 py-2 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
