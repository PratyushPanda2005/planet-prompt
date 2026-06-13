import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userId = "default-user";
    
    // Query logs to find all dates where query logs exist
    const logs = await db.queryLog.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" }
    });

    const monthsSet = new Set<string>();
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      monthsSet.add(`${year}-${month}`);
    });

    // Also look at generated reports
    const reports = await db.report.findMany({
      where: { userId },
      select: { month: true },
      orderBy: { month: "desc" }
    });
    reports.forEach(r => monthsSet.add(r.month));

    const months = Array.from(monthsSet).sort().reverse();

    // Fallback to current month if database is clean
    if (months.length === 0) {
      const now = new Date();
      months.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    }

    return NextResponse.json({ success: true, months });
  } catch (error) {
    console.error("Error in GET /api/report/months:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
