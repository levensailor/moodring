"use client";

import React, { useState, useRef } from "react";
import { Group, Image, Text, Rect, Circle, Line, Arrow, Transformer } from "react-konva";
import { BoardItem, UpdateBoardItemInput } from "@/types";
import useImage from "use-image";
import Konva from "konva";

interface CanvasObjectProps {
  item: BoardItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: UpdateBoardItemInput) => void;
}

export function CanvasObject({
  item,
  isSelected,
  onSelect,
  onUpdate,
}: CanvasObjectProps) {
  const groupRef = useRef<Konva.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = () => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    onUpdate({
      position_x: node.x(),
      position_y: node.y(),
    });
    setIsDragging(false);
  };

  const handleTransformEnd = () => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onUpdate({
      position_x: node.x(),
      position_y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const renderContent = () => {
    switch (item.type) {
      case "photo":
        return <PhotoObject item={item} />;
      case "text":
        return <TextObject item={item} />;
      case "link":
        return <LinkObject item={item} />;
      case "icon":
        return <IconObject item={item} />;
      case "shape":
        return <ShapeObject item={item} />;
      case "line":
        return <LineObject item={item} />;
      case "arrow":
        return <ArrowObject item={item} />;
      case "subboard":
        return <SubboardObject item={item} />;
      default:
        return null;
    }
  };

  return (
    <Group
      id={`item-${item.id}`}
      ref={groupRef}
      x={item.position_x}
      y={item.position_y}
      width={item.width}
      height={item.height}
      rotation={item.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {renderContent()}
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={item.width + 10}
          height={item.height + 10}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      )}
    </Group>
  );
}

function PhotoObject({ item }: { item: BoardItem }) {
  const url = item.content.url || "";
  const [image] = useImage(url, "anonymous");
  const isUploading = !!item.content.isUploading;
  const isError = !!item.content.error;

  return (
    <Group>
      {image ? (
        <Image
          image={image}
          width={item.width}
          height={item.height}
          cornerRadius={item.content.cornerRadius || 0}
        />
      ) : (
        <Rect
          width={item.width}
          height={item.height}
          fill="#e2e8f0"
          cornerRadius={item.content.cornerRadius || 0}
        />
      )}

      {isUploading && (
        <Group>
          <Rect
            width={item.width}
            height={item.height}
            fill="rgba(15,23,42,0.12)"
            cornerRadius={item.content.cornerRadius || 0}
          />
          <Text
            text="Uploading…"
            width={item.width}
            height={item.height}
            align="center"
            verticalAlign="middle"
            fontSize={14}
            fill="#0f172a"
          />
        </Group>
      )}

      {isError && (
        <Group>
          <Rect
            width={item.width}
            height={item.height}
            fill="rgba(239,68,68,0.10)"
            cornerRadius={item.content.cornerRadius || 0}
          />
          <Text
            text="Upload failed"
            width={item.width}
            height={item.height}
            align="center"
            verticalAlign="middle"
            fontSize={14}
            fill="#b91c1c"
          />
        </Group>
      )}
    </Group>
  );
}

function TextObject({ item }: { item: BoardItem }) {
  const content = item.content;
  return (
    <Text
      text={content.text || ""}
      width={item.width}
      height={item.height}
      fontSize={content.fontSize || 16}
      fontFamily={content.fontFamily || "Arial"}
      fontStyle={[
        content.bold ? "bold" : "",
        content.italic ? "italic" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      textDecoration={[
        content.underline ? "underline" : "",
        content.strikethrough ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      fill={content.color || "#000000"}
      align={content.align || "left"}
      verticalAlign={content.verticalAlign || "top"}
      padding={content.padding || 0}
    />
  );
}

function LinkObject({ item }: { item: BoardItem }) {
  const content = item.content;
  const [image] = useImage(content.image || "");

  const handleClick = () => {
    if (content.url) {
      window.open(content.url, "_blank");
    }
  };

  return (
    <Group onClick={handleClick} onTap={handleClick}>
      <Rect
        width={item.width}
        height={item.height}
        fill="#ffffff"
        cornerRadius={8}
        shadowBlur={5}
        shadowOpacity={0.3}
      />
      {image && (
        <Image
          image={image}
          width={item.width}
          height={item.height * 0.6}
          cornerRadius={[8, 8, 0, 0]}
        />
      )}
      <Rect
        y={item.height * 0.6}
        width={item.width}
        height={item.height * 0.4}
        fill="#ffffff"
        cornerRadius={[0, 0, 8, 8]}
      />
      <Text
        y={item.height * 0.6 + 10}
        x={10}
        width={item.width - 20}
        text={content.title || content.url || ""}
        fontSize={14}
        fontStyle="bold"
        fill="#000000"
      />
      {content.description && (
        <Text
          y={item.height * 0.6 + 30}
          x={10}
          width={item.width - 20}
          text={content.description}
          fontSize={12}
          fill="#666666"
        />
      )}
    </Group>
  );
}

function IconObject({ item }: { item: BoardItem }) {
  const content = item.content;
  const icon = typeof content.icon === "string" ? content.icon : "";
  const color = typeof content.color === "string" ? content.color : "#0f172a";

  const url = getIconifySvgUrl(icon, color);
  const [image] = useImage(url, "anonymous");

  if (!icon) {
    return (
      <Rect
        width={item.width}
        height={item.height}
        fill="#e2e8f0"
        cornerRadius={8}
      />
    );
  }

  return (
    <Group>
      {!image ? (
        <Rect
          width={item.width}
          height={item.height}
          fill="#e2e8f0"
          cornerRadius={8}
        />
      ) : (
        <Image image={image} width={item.width} height={item.height} />
      )}
    </Group>
  );
}

function ShapeObject({ item }: { item: BoardItem }) {
  const content = item.content;
  const shapeType = content.shapeType || "rect";

  if (shapeType === "circle") {
    return (
      <Circle
        radius={Math.min(item.width, item.height) / 2}
        fill={content.fill || "#3b82f6"}
        stroke={content.stroke || "#000000"}
        strokeWidth={content.strokeWidth || 0}
      />
    );
  }

  return (
    <Rect
      width={item.width}
      height={item.height}
      fill={content.fill || "#3b82f6"}
      stroke={content.stroke || "#000000"}
      strokeWidth={content.strokeWidth || 0}
      cornerRadius={content.cornerRadius || 0}
    />
  );
}

function LineObject({ item }: { item: BoardItem }) {
  const content = item.content;
  return (
    <Line
      points={content.points || [0, 0, item.width, item.height]}
      stroke={content.stroke || "#000000"}
      strokeWidth={content.strokeWidth || 2}
      lineCap="round"
    />
  );
}

function ArrowObject({ item }: { item: BoardItem }) {
  const content = item.content;
  return (
    <Arrow
      points={content.points || [0, 0, item.width, item.height]}
      stroke={content.stroke || "#000000"}
      strokeWidth={content.strokeWidth || 2}
      fill={content.fill || content.stroke || "#000000"}
      pointerLength={content.pointerLength || 10}
      pointerWidth={content.pointerWidth || 10}
    />
  );
}

function SubboardObject({ item }: { item: BoardItem }) {
  const content = item.content;
  return (
    <Group>
      <Rect
        width={item.width}
        height={item.height}
        fill="#f3f4f6"
        stroke="#9ca3af"
        strokeWidth={2}
        cornerRadius={8}
      />
      <Text
        x={10}
        y={item.height / 2 - 10}
        width={item.width - 20}
        text={content.title || "Sub-board"}
        fontSize={16}
        fontStyle="bold"
        fill="#000000"
        align="center"
      />
    </Group>
  );
}

function getIconifySvgUrl(icon: string, color: string) {
  // Iconify CDN format: https://api.iconify.design/{prefix}/{name}.svg?color=%23RRGGBB
  // Example icon: "mdi:heart" => "mdi/heart"
  const [prefix, name] = icon.includes(":") ? icon.split(":", 2) : ["", icon];
  const safePrefix = encodeURIComponent(prefix);
  const safeName = encodeURIComponent(name);
  const safeColor = encodeURIComponent(color);

  if (!safePrefix || !safeName) return "";

  return `https://api.iconify.design/${safePrefix}/${safeName}.svg?color=${safeColor}`;
}

