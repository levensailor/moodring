"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LiquidGlassCard({
  children,
  className,
  onClick,
}: LiquidGlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group rounded-2xl p-6",
        "bg-white/70 backdrop-blur-md",
        "border border-slate-200/80",
        "shadow-lg shadow-black/5",
        "transition-all duration-300",
        "hover:bg-white/85 hover:shadow-xl hover:shadow-black/10",
        "hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/70 via-white/30 to-transparent opacity-60" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

