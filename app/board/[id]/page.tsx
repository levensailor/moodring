"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Canvas } from "@/components/board/Canvas";
import { Toolbar } from "@/components/board/Toolbar";
import { TextEditor } from "@/components/board/TextEditor";
import { Board, BoardItem, CreateBoardItemInput } from "@/types";
import { debounce } from "@/lib/utils";

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingTextItemId, setEditingTextItemId] = useState<string | null>(
    null
  );
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Fetch board
  const { data: board } = useQuery<Board>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const response = await fetch(`/api/boards/${boardId}`);
      if (!response.ok) throw new Error("Failed to fetch board");
      return response.json();
    },
  });

  // Fetch board items
  const { data: items = [] } = useQuery<BoardItem[]>({
    queryKey: ["board-items", boardId],
    queryFn: async () => {
      const response = await fetch(`/api/boards/${boardId}/items`);
      if (!response.ok) throw new Error("Failed to fetch board items");
      return response.json();
    },
  });

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 60, // Account for toolbar
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Debounced update mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: any;
    }) => {
      const response = await fetch(`/api/boards/${boardId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, updates }),
      });
      if (!response.ok) throw new Error("Failed to update item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-items", boardId] });
    },
  });

  const debouncedUpdate = useCallback(
    debounce((itemId: string, updates: any) => {
      updateItemMutation.mutate({ itemId, updates });
    }, 500),
    [boardId]
  );

  const handleUpdateItem = (itemId: string, updates: any) => {
    debouncedUpdate(itemId, updates);
  };

  const createItemMutation = useMutation({
    mutationFn: async (data: CreateBoardItemInput) => {
      const response = await fetch(`/api/boards/${boardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-items", boardId] });
    },
  });

  const handleAddText = (x: number, y: number) => {
    createItemMutation.mutate({
      board_id: boardId,
      type: "text",
      content: {
        text: "Double click to edit",
        fontSize: 16,
        fontFamily: "Arial",
        color: "#000000",
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
      },
      position_x: x,
      position_y: y,
      width: 200,
      height: 50,
    });
  };

  const handlePasteImage = async (url: string, x: number, y: number) => {
    createItemMutation.mutate({
      board_id: boardId,
      type: "photo",
      content: { url },
      position_x: x - 100,
      position_y: y - 100,
      width: 200,
      height: 200,
    });
  };

  const handlePasteLink = async (url: string, x: number, y: number) => {
    // Fetch link preview
    const response = await fetch("/api/link-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const preview = await response.json();

    createItemMutation.mutate({
      board_id: boardId,
      type: "link",
      content: {
        url,
        title: preview.title || url,
        description: preview.description,
        image: preview.image,
      },
      position_x: x - 150,
      position_y: y - 100,
      width: 300,
      height: 200,
    });
  };

  const handleAddPhoto = (url: string, x: number, y: number) => {
    handlePasteImage(url, x, y);
  };

  const handleAddLink = async (url: string) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    await handlePasteLink(url, centerX, centerY);
  };

  const handleAddIcon = (icon: string) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    createItemMutation.mutate({
      board_id: boardId,
      type: "icon",
      content: { icon, color: "#3b82f6" },
      position_x: centerX - 25,
      position_y: centerY - 25,
      width: 50,
      height: 50,
    });
  };

  const handleAddShape = (shapeType: string) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    createItemMutation.mutate({
      board_id: boardId,
      type: "shape",
      content: {
        shapeType,
        fill: "#3b82f6",
        stroke: "#000000",
        strokeWidth: 0,
      },
      position_x: centerX - 50,
      position_y: centerY - 50,
      width: 100,
      height: 100,
    });
  };

  const handleAddLine = () => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    createItemMutation.mutate({
      board_id: boardId,
      type: "line",
      content: {
        points: [0, 0, 200, 0],
        stroke: "#000000",
        strokeWidth: 2,
      },
      position_x: centerX - 100,
      position_y: centerY,
      width: 200,
      height: 2,
    });
  };

  const handleAddArrow = () => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    createItemMutation.mutate({
      board_id: boardId,
      type: "arrow",
      content: {
        points: [0, 0, 200, 0],
        stroke: "#000000",
        fill: "#000000",
        strokeWidth: 2,
        pointerLength: 10,
        pointerWidth: 10,
      },
      position_x: centerX - 100,
      position_y: centerY,
      width: 200,
      height: 2,
    });
  };

  const handleAddSubboard = (subBoardId: string) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    createItemMutation.mutate({
      board_id: boardId,
      type: "subboard",
      content: { boardId: subBoardId, title: "Sub-board" },
      position_x: centerX - 100,
      position_y: centerY - 75,
      width: 200,
      height: 150,
    });
  };

  const handleBackgroundChange = async (updates: any) => {
    const response = await fetch(`/api/boards/${boardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">Loading board...</div>
      </div>
    );
  }

  const editingItem = items.find((item) => item.id === editingTextItemId);
  const editingPosition = editingItem
    ? {
        x: editingItem.position_x,
        y: editingItem.position_y,
      }
    : { x: 0, y: 0 };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <Canvas
        width={canvasSize.width}
        height={canvasSize.height}
        items={items}
        selectedItemId={selectedItemId}
        onSelectItem={(id) => {
          setSelectedItemId(id);
          if (id && items.find((i) => i.id === id)?.type === "text") {
            setEditingTextItemId(id);
          } else {
            setEditingTextItemId(null);
          }
        }}
        onUpdateItem={handleUpdateItem}
        onAddText={handleAddText}
        onPasteImage={handlePasteImage}
        onPasteLink={handlePasteLink}
        background={{
          color: board.background_color,
          transparency: board.background_transparency,
          wallpaper: board.background_wallpaper,
        }}
      />

      {editingItem && (
        <TextEditor
          item={editingItem}
          position={editingPosition}
          onUpdate={(updates) => handleUpdateItem(editingItem.id, updates)}
          onClose={() => setEditingTextItemId(null)}
        />
      )}

      <Toolbar
        board={board}
        onAddPhoto={handleAddPhoto}
        onAddText={() => {
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          handleAddText(centerX, centerY);
        }}
        onAddLink={handleAddLink}
        onAddIcon={handleAddIcon}
        onAddShape={handleAddShape}
        onAddLine={handleAddLine}
        onAddArrow={handleAddArrow}
        onAddSubboard={handleAddSubboard}
        onBackgroundChange={handleBackgroundChange}
      />
    </div>
  );
}

