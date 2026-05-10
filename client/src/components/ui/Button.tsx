import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950",
    secondary: "bg-white/80 text-slate-900 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  };
  return <button className={twMerge("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50", variants[variant], className)} {...props} />;
}
