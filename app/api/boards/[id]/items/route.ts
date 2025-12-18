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

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.position_x !== undefined) {
      updateFields.push(`position_x = $${values.length + 1}`);
      values.push(updates.position_x);
    }
    if (updates.position_y !== undefined) {
      updateFields.push(`position_y = $${values.length + 1}`);
      values.push(updates.position_y);
    }
    if (updates.width !== undefined) {
      updateFields.push(`width = $${values.length + 1}`);
      values.push(updates.width);
    }
    if (updates.height !== undefined) {
      updateFields.push(`height = $${values.length + 1}`);
      values.push(updates.height);
    }
    if (updates.rotation !== undefined) {
      updateFields.push(`rotation = $${values.length + 1}`);
      values.push(updates.rotation);
    }
    if (updates.z_index !== undefined) {
      updateFields.push(`z_index = $${values.length + 1}`);
      values.push(updates.z_index);
    }
    if (updates.content !== undefined) {
      updateFields.push(`content = $${values.length + 1}`);
      values.push(JSON.stringify(updates.content));
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    values.push(itemId);
    values.push(params.id);

    const query = `
      UPDATE board_items
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length - 1} AND board_id = $${values.length}
      RETURNING *
    `;

    const [item] = await sql.unsafe(query, values);

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

