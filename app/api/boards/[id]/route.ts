import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { UpdateBoardInput } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [board] = await sql`
      SELECT * FROM boards WHERE id = ${params.id}
    `;

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateBoardInput = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(body.description);
    }
    if (body.icon !== undefined) {
      updates.push(`icon = $${values.length + 1}`);
      values.push(body.icon);
    }
    if (body.background_color !== undefined) {
      updates.push(`background_color = $${values.length + 1}`);
      values.push(body.background_color);
    }
    if (body.background_transparency !== undefined) {
      updates.push(`background_transparency = $${values.length + 1}`);
      values.push(body.background_transparency);
    }
    if (body.background_wallpaper !== undefined) {
      updates.push(`background_wallpaper = $${values.length + 1}`);
      values.push(body.background_wallpaper);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    values.push(params.id);

    const query = `
      UPDATE boards
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `;

    const [board] = await sql.unsafe(query, values);

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [board] = await sql`
      DELETE FROM boards WHERE id = ${params.id}
      RETURNING *
    `;

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}

