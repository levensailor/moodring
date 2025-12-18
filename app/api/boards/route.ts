import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CreateBoardInput } from "@/types";

export async function GET() {
  try {
    const boards = await sql`
      SELECT * FROM boards
      ORDER BY position ASC, created_at ASC
    `;
    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBoardInput = await request.json();
    const { title, description, icon } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the max position to append at the end
    const maxPositionResult = await sql`
      SELECT COALESCE(MAX(position), -1) as max_position FROM boards
    `;
    const maxPosition = Number(maxPositionResult[0]?.max_position || -1);

    const [board] = await sql`
      INSERT INTO boards (title, description, icon, position)
      VALUES (${title}, ${description || null}, ${icon || null}, ${maxPosition + 1})
      RETURNING *
    `;

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}

