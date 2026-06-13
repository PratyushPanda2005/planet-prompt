import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const models = await db.modelConfig.findMany({
      orderBy: { displayName: "asc" }
    });
    return NextResponse.json({ success: true, models });
  } catch (error) {
    console.error("Error in GET /api/models:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
