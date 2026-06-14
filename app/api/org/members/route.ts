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

    // Group query logs by userId for this organization
    const logsGrouped = await db.queryLog.groupBy({
      by: ["userId"],
      where: { organizationId: orgId },
      _sum: {
        carbonGrams: true,
        waterMl: true,
        landCm2: true,
      },
      _count: {
        id: true,
      },
    });

    // Join user details
    const memberList = await Promise.all(
      logsGrouped.map(async (group) => {
        const user = await db.user.findUnique({
          where: { id: group.userId },
          select: {
            name: true,
            email: true,
          },
        });

        const waterMl = group._sum.waterMl || 0;

        return {
          userId: group.userId,
          name: user?.name || "Unknown User",
          email: user?.email || "",
          totalCarbon: Number((group._sum.carbonGrams || 0).toFixed(2)),
          totalWater: Number(waterMl.toFixed(2)),
          totalWaterLitres: Number((waterMl / 1000).toFixed(2)),
          totalLand: Number((group._sum.landCm2 || 0).toFixed(2)),
          queryCount: group._count.id || 0,
        };
      })
    );

    // Sort by total carbon descending
    memberList.sort((a, b) => b.totalCarbon - a.totalCarbon);

    return NextResponse.json({
      success: true,
      members: memberList,
    });
  } catch (error) {
    console.error("Error in GET /api/org/members:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
