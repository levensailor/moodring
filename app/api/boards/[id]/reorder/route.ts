import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: { boardIds: string[] } = await request.json();
    const { boardIds } = body;

    // Update positions for all boards
    const updates = boardIds.map((boardId, index) => {
      return sql`
        UPDATE boards
        SET position = ${index}
        WHERE id = ${boardId}
      `;
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering boards:", error);
    return NextResponse.json(
      { error: "Failed to reorder boards" },
      { status: 500 }
    );
  }
}

