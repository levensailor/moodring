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
        "bg-white/10 backdrop-blur-md",
        "border border-white/20",
        "shadow-lg shadow-black/5",
        "transition-all duration-300",
        "hover:bg-white/15 hover:shadow-xl hover:shadow-black/10",
        "hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

