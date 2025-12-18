"use client";

import React, { useRef, useEffect, useState } from "react";
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

  // #region agent log
  useEffect(() => {
    const css = getWallpaperCss(background.wallpaper);
    // Runtime evidence: confirm what the app thinks the background should be
    console.info("[moodring][canvas][background]", {
      color: background.color,
      transparency: background.transparency,
      wallpaper: background.wallpaper,
      css,
    });
  }, [background.color, background.transparency, background.wallpaper]);
  // #endregion

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
      const stage = stageRef.current;
      if (!stage) return;

      const dt = e.clipboardData;
      const items = dt?.items;
      const files = dt?.files;
      if (!items && (!files || files.length === 0)) return;

      const pointerPos = stage.getPointerPosition() ?? {
        x: stage.width() / 2,
        y: stage.height() / 2,
      };

      // #region agent log
      const itemTypes = items ? Array.from(items).map((it) => it.type) : [];
      const fileTypes = files ? Array.from(files).map((f) => f.type) : [];
      fetch('http://127.0.0.1:7243/ingest/bf7a940b-ce5c-4f62-a6a1-89abf5ceb79b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'paste-run1',hypothesisId:'P1',location:'Canvas.tsx:paste',message:'paste event',data:{itemTypes,fileTypes,filesCount:files?.length||0,pointerPos},timestamp:Date.now()})}).catch(()=>{});
      console.info("[moodring][paste]", { itemTypes, fileTypes, filesCount: files?.length || 0, pointerPos });
      // #endregion

      // Check for image
      // Prefer DataTransfer.files first (more reliable across browsers)
      if (files && files.length > 0) {
        const imageFile = Array.from(files).find((f) => f.type.startsWith("image/"));
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          try {
            const response = await fetch("/api/images", {
              method: "POST",
              body: formData,
            });
            const data = await response.json().catch(() => ({}));
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/bf7a940b-ce5c-4f62-a6a1-89abf5ceb79b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'paste-run1',hypothesisId:'P2',location:'Canvas.tsx:pasteFiles',message:'upload response',data:{status:response.status,ok:response.ok,hasUrl:!!data?.url,fileType:imageFile.type,fileName:imageFile.name||''},timestamp:Date.now()})}).catch(()=>{});
            console.info("[moodring][paste][upload]", { status: response.status, ok: response.ok, hasUrl: !!data?.url, fileType: imageFile.type, fileName: imageFile.name || "" });
            // #endregion
            if (data.url) {
              onPasteImage(data.url, pointerPos.x, pointerPos.y);
            } else {
              console.error("[moodring][paste] upload succeeded but no url returned", data);
            }
          } catch (error) {
            console.error("Failed to upload image:", error);
          }
          return;
        }
      }

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
              const data = await response.json().catch(() => ({}));
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/bf7a940b-ce5c-4f62-a6a1-89abf5ceb79b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'paste-run1',hypothesisId:'P3',location:'Canvas.tsx:pasteItems',message:'upload response',data:{status:response.status,ok:response.ok,hasUrl:!!data?.url,fileType:file.type,fileName:file.name||''},timestamp:Date.now()})}).catch(()=>{});
              console.info("[moodring][paste][upload]", { status: response.status, ok: response.ok, hasUrl: !!data?.url, fileType: file.type, fileName: file.name || "" });
              // #endregion
              if (data.url) {
                onPasteImage(data.url, pointerPos.x, pointerPos.y);
              } else {
                console.error("[moodring][paste] upload succeeded but no url returned", data);
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
    const wallpaperCss = getWallpaperCss(background.wallpaper);
    return {
      backgroundColor: rgba,
      ...wallpaperCss,
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

function getWallpaperCss(pattern: string | null) {
  // CSS-only patterns so they work without additional assets.
  // Keep them subtle; canvas items should remain the focus.
  switch (pattern) {
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.10) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      };
    case "grid":
      return {
        backgroundImage:
          "linear-gradient(to right, rgba(15, 23, 42, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      };
    case "lines":
      return {
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.08) 1px, transparent 1px, transparent 18px)",
      };
    case "diagonal":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(15, 23, 42, 0.07) 0, rgba(15, 23, 42, 0.07) 1px, transparent 1px, transparent 14px)",
      };
    case "crosshatch":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(15, 23, 42, 0.06) 0, rgba(15, 23, 42, 0.06) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(-45deg, rgba(15, 23, 42, 0.06) 0, rgba(15, 23, 42, 0.06) 1px, transparent 1px, transparent 16px)",
      };
    case "squares":
      return {
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 0 0",
      };
    case "triangles":
      return {
        backgroundImage:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
      };
    case "hexagons":
      return {
        backgroundImage:
          "radial-gradient(circle farthest-side at 0% 50%, rgba(15,23,42,0.05) 23.5%, transparent 24%), radial-gradient(circle farthest-side at 100% 50%, rgba(15,23,42,0.05) 23.5%, transparent 24%), radial-gradient(circle farthest-side at 50% 0%, rgba(15,23,42,0.05) 23.5%, transparent 24%), radial-gradient(circle farthest-side at 50% 100%, rgba(15,23,42,0.05) 23.5%, transparent 24%)",
        backgroundSize: "28px 28px",
        backgroundPosition: "0 0, 0 0, 14px -14px, 14px -14px",
      };
    case "circles":
      return {
        backgroundImage:
          "radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      };
    case "waves":
      return {
        backgroundImage:
          "repeating-radial-gradient(circle at 0 0, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 2px, transparent 2px, transparent 12px)",
        backgroundSize: "24px 24px",
      };
    case "noise":
      // Cheap noise-like texture using multiple gradients (no external assets)
      return {
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(15,23,42,0.03) 0, rgba(15,23,42,0.03) 1px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(15,23,42,0.02) 0, rgba(15,23,42,0.02) 1px, transparent 1px, transparent 3px)",
      };
    default:
      return {};
  }
}

