"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardCard } from "./BoardCard";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Plus } from "lucide-react";
import { Board } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SortableBoardCardProps {
  board: Board;
}

function SortableBoardCard({ board }: SortableBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BoardCard board={board} />
    </div>
  );
}

interface BoardGridProps {
  onCreateClick: () => void;
}

export function BoardGrid({ onCreateClick }: BoardGridProps) {
  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: async () => {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to fetch boards");
      return response.json();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const queryClient = useQueryClient();

  const reorderMutation = useMutation({
    mutationFn: async (boardIds: string[]) => {
      const response = await fetch("/api/boards/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardIds }),
      });
      if (!response.ok) throw new Error("Failed to reorder boards");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = boards.findIndex((b) => b.id === active.id);
      const newIndex = boards.findIndex((b) => b.id === over.id);

      const newBoards = arrayMove(boards, oldIndex, newIndex);
      const boardIds = newBoards.map((b) => b.id);

      reorderMutation.mutate(boardIds);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">Loading boards...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={boards.map((b) => b.id)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
          {boards.map((board) => (
            <SortableBoardCard key={board.id} board={board} />
          ))}
          <LiquidGlassCard
            onClick={onCreateClick}
            className="h-48 flex items-center justify-center cursor-pointer border-dashed border-2 border-white/30 hover:border-white/50"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-12 h-12 text-white/60" />
              <span className="text-white/60 font-medium">New Board</span>
            </div>
          </LiquidGlassCard>
        </div>
      </SortableContext>
    </DndContext>
  );
}

