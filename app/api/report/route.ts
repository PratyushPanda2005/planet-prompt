import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/auth-helpers";

// Helper to get start and end dates of a month string (YYYY-MM)
function getMonthRange(monthStr: string) {
  const [yearPart, monthPart] = monthStr.split("-");
  const year = parseInt(yearPart, 10);
  const monthIdx = parseInt(monthPart, 10) - 1; // 0-indexed in JS Date

  const start = new Date(year, monthIdx, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Generate high quality mock sustainability narrative based on actual numbers
function generateMockNarrative(stats: { carbonGrams: number; waterMl: number; landCm2: number; count: number }) {
  const waterLitres = Number((stats.waterMl / 1000).toFixed(2));
  const carbonGrams = Number(stats.carbonGrams.toFixed(1));
  const landCm2 = Number(stats.landCm2.toFixed(1));

  let carbonComparison = "";
  if (carbonGrams > 100) {
    carbonComparison = `which is equivalent to driving a mid-sized electric car for ${Math.round(carbonGrams * 0.006)} kilometers.`;
  } else {
    carbonComparison = `equivalent to keeping an LED light bulb running for ${Math.round(carbonGrams * 0.5)} hours.`;
  }

  const sentence1 = `During this billing cycle, your ${stats.count} logged queries generated ${carbonGrams}g of CO₂ emissions, consumed ${waterLitres}L of fresh water for data center cooling, and occupied ${landCm2}cm² of land.`;
  const sentence2 = `This resource footprint is ${carbonComparison}`;
  const sentence3 = `To improve your footprint next month, we highly recommend utilizing the PlanetPrompt Advisor to compress redundant adjectives in your system prompts, which could reduce your total token count by up to 35%.`;

  return `${sentence1} ${sentence2} ${sentence3}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = dbUser.id;
    
    // Default to current month if not specified
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const month = url.searchParams.get("month") || currentMonthStr;
    const forceRegenerate = url.searchParams.get("regenerate") === "true";

    // Calculate dates
    const { start, end } = getMonthRange(month);

    // Query logs for this month
    const logs = await db.queryLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (logs.length === 0) {
      return NextResponse.json({
        success: true,
        month,
        empty: true,
        stats: {
          totalCarbon: 0,
          totalWater: 0,
          totalWaterLitres: 0,
          totalLand: 0,
          queryCount: 0,
        },
        report: null,
      });
    }

    // Accumulate stats
    let totalCarbon = 0;
    let totalWater = 0; // ml
    let totalLand = 0;  // cm2
    logs.forEach((log) => {
      totalCarbon += log.carbonGrams;
      totalWater += log.waterMl;
      totalLand += log.landCm2;
    });

    totalCarbon = Number(totalCarbon.toFixed(4));
    totalWater = Number(totalWater.toFixed(4));
    totalLand = Number(totalLand.toFixed(4));
    const totalWaterLitres = Number((totalWater / 1000).toFixed(4));

    // Check if report already exists for this month
    const existingReport = await db.report.findFirst({
      where: {
        userId,
        month,
      },
    });

    // If report exists and regeneration is not forced, return it
    if (existingReport && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        month,
        empty: false,
        stats: {
          totalCarbon: Number(totalCarbon.toFixed(2)),
          totalWater: Number(totalWater.toFixed(2)),
          totalWaterLitres: Number(totalWaterLitres.toFixed(2)),
          totalLand: Number(totalLand.toFixed(2)),
          queryCount: logs.length,
        },
        report: existingReport,
      });
    }

    // Otherwise, generate a new AI narrative summary
    let aiNarrative = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a sustainability advisor for AI operations. Summarize the user's monthly footprint data.
- Total queries: ${logs.length}
- Total Carbon footprint: ${totalCarbon.toFixed(1)} grams
- Total Water footprint: ${totalWaterLitres.toFixed(2)} litres (from ${totalWater.toFixed(0)} ml)
- Total Land footprint: ${totalLand.toFixed(1)} cm²

Write a 3-sentence narrative summarizing their sustainability impact, acknowledging their usage, and offering one actionable tip to improve efficiency next month. Do not include markdown formatting or titles. Output plain text only.`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 256,
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (
            result.candidates &&
            result.candidates[0] &&
            result.candidates[0].content &&
            result.candidates[0].content.parts &&
            result.candidates[0].content.parts[0] &&
            result.candidates[0].content.parts[0].text
          ) {
            aiNarrative = result.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (err) {
        console.error("Error generating narrative via Gemini API:", err);
      }
    }

    // Fallback to mock generator if API key is not present or failed
    if (!aiNarrative) {
      aiNarrative = generateMockNarrative({
        carbonGrams: totalCarbon,
        waterMl: totalWater,
        landCm2: totalLand,
        count: logs.length,
      });
    }

    // Upsert the monthly report in the database
    let savedReport;
    if (existingReport) {
      savedReport = await db.report.update({
        where: { id: existingReport.id },
        data: {
          totalCarbon,
          totalWater,
          totalLand,
          aiNarrative,
        },
      });
    } else {
      savedReport = await db.report.create({
        data: {
          userId,
          month,
          totalCarbon,
          totalWater,
          totalLand,
          aiNarrative,
        },
      });
    }

    return NextResponse.json({
      success: true,
      month,
      empty: false,
      stats: {
        totalCarbon: Number(totalCarbon.toFixed(2)),
        totalWater: Number(totalWater.toFixed(2)),
        totalWaterLitres: Number(totalWaterLitres.toFixed(2)),
        totalLand: Number(totalLand.toFixed(2)),
        queryCount: logs.length,
      },
      report: savedReport,
    });
  } catch (error) {
    console.error("Error in GET /api/report:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
