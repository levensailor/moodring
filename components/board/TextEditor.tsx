"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
} from "lucide-react";
import { BoardItem, UpdateBoardItemInput } from "@/types";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  item: BoardItem;
  position: { x: number; y: number };
  onUpdate: (updates: UpdateBoardItemInput) => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
];

export function TextEditor({
  item,
  position,
  onUpdate,
  onClose,
}: TextEditorProps) {
  const content = item.content;
  const [text, setText] = useState(content.text || "");
  const [fontSize, setFontSize] = useState(content.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(
    content.fontFamily || "Arial"
  );
  const [color, setColor] = useState(content.color || "#000000");
  const [bold, setBold] = useState(content.bold || false);
  const [italic, setItalic] = useState(content.italic || false);
  const [underline, setUnderline] = useState(content.underline || false);
  const [strikethrough, setStrikethrough] = useState(
    content.strikethrough || false
  );

  useEffect(() => {
    const updates: UpdateBoardItemInput = {
      content: {
        ...content,
        text,
        fontSize,
        fontFamily,
        color,
        bold,
        italic,
        underline,
        strikethrough,
      },
    };
    onUpdate(updates);
  }, [
    text,
    fontSize,
    fontFamily,
    color,
    bold,
    italic,
    underline,
    strikethrough,
  ]);

  return (
    <div
      className="absolute z-50 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg p-4"
      style={{
        left: position.x,
        top: position.y + item.height + 10,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="bg-white/5"
        />

        <div className="flex items-center gap-2">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="flex-1 h-9 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} className="bg-gray-800">
                {font}
              </option>
            ))}
          </select>

          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 16)}
            min="8"
            max="200"
            className="w-20 bg-white/5"
          />

          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-9 bg-white/5"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={bold ? "default" : "ghost"}
            size="sm"
            onClick={() => setBold(!bold)}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={italic ? "default" : "ghost"}
            size="sm"
            onClick={() => setItalic(!italic)}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant={underline ? "default" : "ghost"}
            size="sm"
            onClick={() => setUnderline(!underline)}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          <Button
            variant={strikethrough ? "default" : "ghost"}
            size="sm"
            onClick={() => setStrikethrough(!strikethrough)}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

