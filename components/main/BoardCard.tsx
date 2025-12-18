"use client";

import { Icon } from "@iconify/react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Board } from "@/types";
import { useRouter } from "next/navigation";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();

  return (
    <LiquidGlassCard
      onClick={() => router.push(`/board/${board.id}`)}
      className="h-48 flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {board.icon && (
          <Icon icon={board.icon} className="w-12 h-12 text-white/80" />
        )}
        <h3 className="text-lg font-semibold text-white text-center">
          {board.title}
        </h3>
        {board.description && (
          <p className="text-sm text-white/60 text-center line-clamp-2">
            {board.description}
          </p>
        )}
      </div>
    </LiquidGlassCard>
  );
}

