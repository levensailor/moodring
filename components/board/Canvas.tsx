"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import { BoardItem } from "@/types";
import { CanvasObject } from "./CanvasObject";
import Konva from "konva";

interface CanvasProps {
  width: number;
  height: number;
  items: BoardItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: any) => void;
  onAddText: (x: number, y: number) => void;
  onPasteImage: (url: string, x: number, y: number) => void;
  onPasteLink: (url: string, x: number, y: number) => void;
  background: {
    color: string;
    transparency: number;
    wallpaper: string | null;
  };
}

export function Canvas({
  width,
  height,
  items,
  selectedItemId,
  onSelectItem,
  onUpdateItem,
  onAddText,
  onPasteImage,
  onPasteLink,
  background,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Attach transformer to selected item
  useEffect(() => {
    if (selectedItemId && transformerRef.current) {
      const selectedItem = items.find((item) => item.id === selectedItemId);
      if (selectedItem) {
        const stage = stageRef.current;
        if (stage) {
          const node = stage.findOne(`#item-${selectedItemId}`);
          if (node) {
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer()?.batchDraw();
          }
        }
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedItemId, items]);

  // Handle paste events
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const stage = stageRef.current;
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      // Check for image
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
              const response = await fetch("/api/images", {
                method: "POST",
                body: formData,
              });
              const data = await response.json();
              if (data.url) {
                onPasteImage(data.url, pointerPos.x, pointerPos.y);
              }
            } catch (error) {
              console.error("Failed to upload image:", error);
            }
          }
          return;
        }
      }

      // Check for text (URL)
      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          onPasteLink(text, pointerPos.x, pointerPos.y);
        }
      } catch (error) {
        // Clipboard API might not be available
        console.error("Failed to read clipboard:", error);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onPasteImage, onPasteLink]);

  // Handle double click for text
  const handleStageDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Only add text if clicking on stage background
    if (e.target === stage) {
      const pointerPos = stage.getPointerPosition();
      if (pointerPos) {
        onAddText(pointerPos.x, pointerPos.y);
      }
    }
  };

  // Handle stage click to deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.target === stage) {
      onSelectItem(null);
    }
  };

  // Get background style
  const getBackgroundStyle = () => {
    const rgba = hexToRgba(background.color, background.transparency);
    return {
      backgroundColor: rgba,
    };
  };

  return (
    <div
      className="canvas-container"
      style={{
        width,
        height,
        ...getBackgroundStyle(),
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onDblClick={handleStageDoubleClick}
        onClick={handleStageClick}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        <Layer>
          {items.map((item) => (
            <CanvasObject
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItem(item.id)}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
            />
          ))}
          {selectedItemId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit minimum size
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

