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
    const hasAnyUpdate =
      body.title !== undefined ||
      body.description !== undefined ||
      body.icon !== undefined ||
      body.background_color !== undefined ||
      body.background_transparency !== undefined ||
      body.background_wallpaper !== undefined;

    if (!hasAnyUpdate) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const title = body.title ?? null;
    const description = body.description ?? null;
    const icon = body.icon ?? null;
    const backgroundColor = body.background_color ?? null;
    const backgroundTransparency = body.background_transparency ?? null;
    const backgroundWallpaper =
      body.background_wallpaper !== undefined ? body.background_wallpaper : null;

    const [board] = await sql`
      UPDATE boards
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        icon = COALESCE(${icon}, icon),
        background_color = COALESCE(${backgroundColor}, background_color),
        background_transparency = COALESCE(${backgroundTransparency}, background_transparency),
        background_wallpaper = COALESCE(${backgroundWallpaper}, background_wallpaper),
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

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

