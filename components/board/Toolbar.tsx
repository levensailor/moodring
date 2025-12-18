"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Shapes,
  Minus,
  ArrowRight,
  Folder,
  Palette,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPicker } from "@/components/ui/icon-picker";
import { Modal } from "@/components/ui/modal";
import { Board } from "@/types";

interface ToolbarProps {
  board: Board;
  onAddPhoto: (url: string, x: number, y: number) => void;
  onAddText: () => void;
  onAddLink: (url: string) => void;
  onAddIcon: (icon: string) => void;
  onAddShape: (shapeType: string) => void;
  onAddLine: () => void;
  onAddArrow: () => void;
  onAddSubboard: (boardId: string) => void;
  onBackgroundChange: (updates: {
    color?: string;
    transparency?: number;
    wallpaper?: string | null;
  }) => void;
}

const WALLPAPER_PATTERNS = [
  null,
  "dots",
  "grid",
  "lines",
  "waves",
  "circles",
  "squares",
  "triangles",
  "hexagons",
  "diagonal",
  "crosshatch",
  "noise",
];

export function Toolbar({
  board,
  onAddPhoto,
  onAddText,
  onAddLink,
  onAddIcon,
  onAddShape,
  onAddLine,
  onAddArrow,
  onAddSubboard,
  onBackgroundChange,
}: ToolbarProps) {
  const router = useRouter();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showShapeModal, setShowShapeModal] = useState(false);
  const [showSubboardModal, setShowSubboardModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        // Add photo to canvas at center
        const centerX = window.innerWidth / 2;
        const centerY = (window.innerHeight - 60) / 2;
        onAddPhoto(data.url, centerX, centerY);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      onAddLink(linkUrl.trim());
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddPhoto}
              title="Add Photo"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onAddText}
              title="Add Text"
            >
              <Type className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkModal(true)}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIconModal(true)}
              title="Add Icon"
            >
              <Shapes className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShapeModal(true)}
              title="Add Shape"
            >
              <Shapes className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onAddLine}
              title="Add Line"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onAddArrow}
              title="Add Arrow"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSubboardModal(true)}
              title="Add Sub-board"
            >
              <Folder className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBackgroundModal(true)}
              title="Background Settings"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Add Link"
      >
        <div className="space-y-4">
          <Input
            type="url"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddLink();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLinkModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddLink}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Icon Modal */}
      <Modal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        title="Add Icon"
      >
        <IconPicker
          onSelect={(icon) => {
            onAddIcon(icon);
            setShowIconModal(false);
          }}
        />
      </Modal>

      {/* Shape Modal */}
      <Modal
        isOpen={showShapeModal}
        onClose={() => setShowShapeModal(false)}
        title="Add Shape"
      >
        <div className="grid grid-cols-2 gap-3">
          {["rect", "circle"].map((shape) => (
            <Button
              key={shape}
              variant="outline"
              onClick={() => {
                onAddShape(shape);
                setShowShapeModal(false);
              }}
            >
              {shape === "rect" ? "Rectangle" : "Circle"}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Sub-board Modal */}
      <Modal
        isOpen={showSubboardModal}
        onClose={() => setShowSubboardModal(false)}
        title="Add Sub-board"
      >
        <SubboardSelector
          currentBoardId={board.id}
          onSelect={(boardId) => {
            onAddSubboard(boardId);
            setShowSubboardModal(false);
          }}
        />
      </Modal>

      {/* Background Modal */}
      <Modal
        isOpen={showBackgroundModal}
        onClose={() => setShowBackgroundModal(false)}
        title="Background Settings"
      >
        <BackgroundSettings
          board={board}
          onUpdate={onBackgroundChange}
        />
      </Modal>
    </>
  );
}

function SubboardSelector({
  currentBoardId,
  onSelect,
}: {
  currentBoardId: string;
  onSelect: (boardId: string) => void;
}) {
  const { data: boards = [] } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to fetch boards");
      return response.json();
    },
  });

  const filteredBoards = boards.filter(
    (b: Board) => b.id !== currentBoardId
  );

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {filteredBoards.length === 0 ? (
        <p className="text-sm text-gray-400">No other boards available</p>
      ) : (
        filteredBoards.map((board: Board) => (
          <button
            key={board.id}
            onClick={() => onSelect(board.id)}
            className="w-full text-left p-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            <div className="font-medium text-white">{board.title}</div>
            {board.description && (
              <div className="text-sm text-gray-400">{board.description}</div>
            )}
          </button>
        ))
      )}
    </div>
  );
}

function BackgroundSettings({
  board,
  onUpdate,
}: {
  board: Board;
  onUpdate: (updates: any) => void;
}) {
  const [color, setColor] = useState(board.background_color);
  const [transparency, setTransparency] = useState(
    board.background_transparency
  );
  const [wallpaper, setWallpaper] = useState(board.background_wallpaper);

  const handleSave = () => {
    onUpdate({
      color,
      transparency,
      wallpaper,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background Color
        </label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Transparency: {Math.round(transparency * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={transparency}
          onChange={(e) => setTransparency(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Wallpaper Pattern
        </label>
        <div className="grid grid-cols-4 gap-2">
          {WALLPAPER_PATTERNS.map((pattern, index) => (
            <button
              key={index}
              onClick={() => setWallpaper(pattern)}
              className={`p-3 rounded-lg border-2 transition-all ${
                wallpaper === pattern
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <div className="text-xs text-white">
                {pattern || "None"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

