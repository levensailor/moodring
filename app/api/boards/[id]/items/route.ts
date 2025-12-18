import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CreateBoardItemInput, UpdateBoardItemInput } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await sql`
      SELECT * FROM board_items
      WHERE board_id = ${params.id}
      ORDER BY z_index ASC, created_at ASC
    `;
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching board items:", error);
    return NextResponse.json(
      { error: "Failed to fetch board items" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: CreateBoardItemInput = await request.json();
    const {
      type,
      content,
      position_x,
      position_y,
      width,
      height,
      rotation = 0,
      z_index = 0,
    } = body;

    const [item] = await sql`
      INSERT INTO board_items (
        board_id, type, content, position_x, position_y,
        width, height, rotation, z_index
      )
      VALUES (
        ${params.id}, ${type}, ${JSON.stringify(content)}, ${position_x},
        ${position_y}, ${width}, ${height}, ${rotation}, ${z_index}
      )
      RETURNING *
    `;

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating board item:", error);
    return NextResponse.json(
      { error: "Failed to create board item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: { itemId: string; updates: UpdateBoardItemInput } =
      await request.json();
    const { itemId, updates } = body;

    const hasAnyUpdate =
      updates.position_x !== undefined ||
      updates.position_y !== undefined ||
      updates.width !== undefined ||
      updates.height !== undefined ||
      updates.rotation !== undefined ||
      updates.z_index !== undefined ||
      updates.content !== undefined;

    if (!hasAnyUpdate) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const positionX = updates.position_x ?? null;
    const positionY = updates.position_y ?? null;
    const width = updates.width ?? null;
    const height = updates.height ?? null;
    const rotation = updates.rotation ?? null;
    const zIndex = updates.z_index ?? null;
    const contentJson = updates.content !== undefined ? JSON.stringify(updates.content) : null;

    const [item] = await sql`
      UPDATE board_items
      SET
        position_x = COALESCE(${positionX}, position_x),
        position_y = COALESCE(${positionY}, position_y),
        width = COALESCE(${width}, width),
        height = COALESCE(${height}, height),
        rotation = COALESCE(${rotation}, rotation),
        z_index = COALESCE(${zIndex}, z_index),
        content = COALESCE(${contentJson}::jsonb, content),
        updated_at = NOW()
      WHERE id = ${itemId} AND board_id = ${params.id}
      RETURNING *
    `;

    if (!item) {
      return NextResponse.json(
        { error: "Board item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating board item:", error);
    return NextResponse.json(
      { error: "Failed to update board item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: { itemId?: string } = await request.json().catch(() => ({}));
    const itemId = body.itemId;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const [deleted] = await sql`
      DELETE FROM board_items
      WHERE id = ${itemId} AND board_id = ${params.id}
      RETURNING *
    `;

    if (!deleted) {
      return NextResponse.json({ error: "Board item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting board item:", error);
    return NextResponse.json(
      { error: "Failed to delete board item" },
      { status: 500 }
    );
  }
}

