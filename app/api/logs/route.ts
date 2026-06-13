import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/auth-helpers";

// Hardcoded conversion factors (1000 tokens)
const CONVERSIONS = {
  carbonPer1k: 0.3,   // grams
  waterPer1k: 3.0,    // ml
  landPer1k: 0.5,     // cm2
};

export async function GET() {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = dbUser.id;
    
    // Fetch all logs for the default user to calculate cumulative totals
    const allLogs = await db.queryLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate cumulative statistics
    let totalCarbon = 0;
    let totalWaterMl = 0;
    let totalLand = 0;
    let totalTokens = 0;

    allLogs.forEach((log: any) => {
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

    const recentLogsForChart = allLogs.filter((log: any) => new Date(log.createdAt) >= thirtyDaysAgo);

    recentLogsForChart.forEach((log: any) => {
      const logDate = new Date(log.createdAt);
      const dateString = logDate.toISOString().split("T")[0];
      if (chartDataMap[dateString]) {
        chartDataMap[dateString].carbon += log.carbonGrams;
        // Chart displays water in Litres for ease of viewing
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

    // Recent queries table (limit to 10 logs)
    const recentQueries = allLogs.slice(0, 10);

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
      recentQueries,
    });
  } catch (error) {
    console.error("Error in GET /api/logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { promptText, modelUsed, tokenCount } = await req.json();

    if (!promptText || !modelUsed || tokenCount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = dbUser.id;

    // Look up dynamic conversion factors based on modelUsed
    const modelConfig = await db.modelConfig.findUnique({
      where: { name: modelUsed }
    });

    const rates = modelConfig
      ? {
          carbon: modelConfig.carbonPer1k,
          water: modelConfig.waterPer1k,
          land: modelConfig.landPer1k
        }
      : {
          carbon: CONVERSIONS.carbonPer1k,
          water: CONVERSIONS.waterPer1k,
          land: CONVERSIONS.landPer1k
        };

    // Standard conversions
    const carbonGrams = Number(((tokenCount / 1000) * rates.carbon).toFixed(4));
    const waterMl = Number(((tokenCount / 1000) * rates.water).toFixed(4));
    const landCm2 = Number(((tokenCount / 1000) * rates.land).toFixed(4));

    const newLog = await db.queryLog.create({
      data: {
        userId,
        promptText,
        modelUsed,
        tokenCount,
        carbonGrams,
        waterMl,
        landCm2,
      },
    });

    return NextResponse.json({ success: true, data: newLog });
  } catch (error) {
    console.error("Error in POST /api/logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
