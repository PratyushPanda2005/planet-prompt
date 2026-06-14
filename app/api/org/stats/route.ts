import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const context = await getOrgContext();
    if (!context) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (context.orgRole !== "org:admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const orgId = context.orgId;

    // Fetch all logs for this organization
    const allLogs = await db.queryLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate cumulative statistics
    let totalCarbon = 0;
    let totalWaterMl = 0;
    let totalLand = 0;
    let totalTokens = 0;

    allLogs.forEach((log) => {
      totalCarbon += log.carbonGrams;
      totalWaterMl += log.waterMl;
      totalLand += log.landCm2;
      totalTokens += log.tokenCount;
    });

    const totalWaterLitres = Number((totalWaterMl / 1000).toFixed(4));
    totalCarbon = Number(totalCarbon.toFixed(2));
    totalLand = Number(totalLand.toFixed(2));

    // Get chart data for the last 30 days
    const chartDataMap: { [date: string]: { date: string; carbon: number; water: number; land: number; count: number } } = {};
    const now = new Date();
    
    // Initialize last 30 days with 0s
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
      chartDataMap[dateString] = {
        date: dateString,
        carbon: 0,
        water: 0,
        land: 0,
        count: 0,
      };
    }

    // Populate chart data from actual query logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentLogsForChart = allLogs.filter((log) => new Date(log.createdAt) >= thirtyDaysAgo);

    recentLogsForChart.forEach((log) => {
      const logDate = new Date(log.createdAt);
      const dateString = logDate.toISOString().split("T")[0];
      if (chartDataMap[dateString]) {
        chartDataMap[dateString].carbon += log.carbonGrams;
        chartDataMap[dateString].water += log.waterMl / 1000;
        chartDataMap[dateString].land += log.landCm2;
        chartDataMap[dateString].count += 1;
      }
    });

    const chartData = Object.values(chartDataMap).map(d => ({
      ...d,
      carbon: Number(d.carbon.toFixed(3)),
      water: Number(d.water.toFixed(4)),
      land: Number(d.land.toFixed(3)),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalCarbon,
        totalWaterLitres,
        totalLand,
        totalTokens,
        queryCount: allLogs.length,
      },
      chartData,
    });
  } catch (error) {
    console.error("Error in GET /api/org/stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
