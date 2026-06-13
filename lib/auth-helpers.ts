import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getOrCreateDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

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
        },
      });
    }
  }
  return dbUser;
}
