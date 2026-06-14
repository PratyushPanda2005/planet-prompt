import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getOrgContext() {
  const { userId, orgId, orgRole } = await auth();
  if (!orgId) return null;
  return { userId, orgId, orgRole };
}

export async function getOrCreateDbUser() {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) return null;

  // Sync/ensure active organization in DB if in org context
  if (orgId) {
    let dbOrg = await db.organization.findUnique({
      where: { id: orgId },
    });

    if (!dbOrg) {
      try {
        const client = await clerkClient();
        const clerkOrg = await client.organizations.getOrganization({ organizationId: orgId });
        await db.organization.upsert({
          where: { id: orgId },
          update: {
            name: clerkOrg.name,
            slug: clerkOrg.slug || clerkOrg.id,
          },
          create: {
            id: orgId,
            name: clerkOrg.name,
            slug: clerkOrg.slug || clerkOrg.id,
          },
        });
      } catch (err) {
        console.error("Error syncing organization in getOrCreateDbUser:", err);
      }
    }
  }

  let dbUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.com`;
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      
      dbUser = await db.user.create({
        data: {
          id: userId,
          email,
          name: name || null,
          organizationId: orgId || null,
          orgRole: orgRole || null,
        },
      });
    }
  } else {
    // Update user's active org context if it differs
    if (dbUser.organizationId !== (orgId || null) || dbUser.orgRole !== (orgRole || null)) {
      dbUser = await db.user.update({
        where: { id: userId },
        data: {
          organizationId: orgId || null,
          orgRole: orgRole || null,
        },
      });
    }
  }
  return dbUser;
}

