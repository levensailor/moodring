"use client";

import { useState } from "react";
import { RetroGrid } from "@/components/ui/retro-grid";
import { BoardGrid } from "@/components/main/BoardGrid";
import { CreateBoardModal } from "@/components/main/CreateBoardModal";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <RetroGrid />
      
      <div className="relative z-10 container mx-auto py-12">
        <div className="mb-8 px-8">
          <h1 className="text-4xl font-bold text-white mb-2">MoodRing</h1>
          <p className="text-white/60">Organize your life with mood boards</p>
        </div>

        <BoardGrid onCreateClick={() => setIsCreateModalOpen(true)} />
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
  );
}

