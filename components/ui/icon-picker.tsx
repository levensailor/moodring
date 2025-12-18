"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (icon: string) => void;
}

const POPULAR_ICONS = [
  "mdi:heart",
  "mdi:star",
  "mdi:lightbulb",
  "mdi:rocket",
  "mdi:music",
  "mdi:palette",
  "mdi:book",
  "mdi:home",
  "mdi:briefcase",
  "mdi:car",
  "mdi:airplane",
  "mdi:camera",
  "mdi:code",
  "mdi:gamepad",
  "mdi:food",
  "mdi:coffee",
  "mdi:guitar",
  "mdi:movie",
  "mdi:beach",
  "mdi:mountain",
  "mdi:flower",
  "mdi:cat",
  "mdi:dog",
  "mdi:tree",
  "mdi:cloud",
  "mdi:fire",
  "mdi:water",
  "mdi:earth",
  "mdi:air",
  "mdi:yin-yang",
];

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return POPULAR_ICONS;
    }
    // Simple filter - in a real app, you'd search Iconify's API
    return POPULAR_ICONS.filter((icon) =>
      icon.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search icons..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {filteredIcons.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onSelect(icon)}
            className={cn(
              "p-2 rounded-lg border-2 transition-all",
              "hover:bg-white/10 hover:scale-110",
              selectedIcon === icon
                ? "border-blue-500 bg-blue-500/20"
                : "border-transparent"
            )}
          >
            <Icon icon={icon} className="w-6 h-6" />
          </button>
        ))}
      </div>
      {selectedIcon && (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          <span className="text-sm text-gray-400">Selected:</span>
          <Icon icon={selectedIcon} className="w-5 h-5" />
          <span className="text-sm text-gray-300">{selectedIcon}</span>
        </div>
      )}
    </div>
  );
}

