import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headersList = await headers();
    
    // Verify signature if CLERK_WEBHOOK_SECRET is set
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (webhookSecret) {
      const svixId = headersList.get("svix-id");
      const svixTimestamp = headersList.get("svix-timestamp");
      const svixSignature = headersList.get("svix-signature");
      
      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
      }
      
      const secretBytes = Buffer.from(webhookSecret.split("_")[1] || webhookSecret, "base64");
      const toSign = `${svixId}.${svixTimestamp}.${payload}`;
      const signatures = svixSignature.split(" ");
      let verified = false;
      
      for (const sig of signatures) {
        const parts = sig.split(",");
        if (parts.length === 2 && parts[0] === "v1") {
          const expectedSignature = parts[1];
          const hmac = crypto.createHmac("sha256", secretBytes);
          hmac.update(toSign);
          const computedSignature = hmac.digest("base64");
          if (computedSignature === expectedSignature) {
            verified = true;
            break;
          }
        }
      }
      
      if (!verified) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(payload);
    const { type, data } = event;

    if (type === "organization.created" || type === "organization.updated") {
      const { id, name, slug } = data;
      await db.organization.upsert({
        where: { id },
        update: {
          name,
          slug: slug || id,
        },
        create: {
          id,
          name,
          slug: slug || id,
        },
      });
    } else if (type === "organizationMembership.created" || type === "organizationMembership.updated") {
      const { organization, public_user_data, role } = data;
      const orgId = organization?.id;
      const orgName = organization?.name;
      const orgSlug = organization?.slug || orgId;
      const userId = public_user_data?.user_id;
      
      if (orgId && userId) {
        // Upsert organization first
        await db.organization.upsert({
          where: { id: orgId },
          update: {
            name: orgName,
            slug: orgSlug,
          },
          create: {
            id: orgId,
            name: orgName,
            slug: orgSlug,
          },
        });

        const email = public_user_data.identifier || `${userId}@clerk.com`;
        const name = `${public_user_data.first_name || ""} ${public_user_data.last_name || ""}`.trim();

        // Upsert User
        await db.user.upsert({
          where: { id: userId },
          update: {
            organizationId: orgId,
            orgRole: role,
          },
          create: {
            id: userId,
            email,
            name: name || null,
            organizationId: orgId,
            orgRole: role,
          },
        });
      }
    } else if (type === "organizationMembership.deleted") {
      const { organization, public_user_data } = data;
      const orgId = organization?.id;
      const userId = public_user_data?.user_id;

      if (userId && orgId) {
        const dbUser = await db.user.findUnique({
          where: { id: userId },
        });

        if (dbUser && dbUser.organizationId === orgId) {
          await db.user.update({
            where: { id: userId },
            data: {
              organizationId: null,
              orgRole: null,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
