import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Match routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/advisor(.*)",
  "/report(.*)",
  "/api/logs(.*)",
  "/api/report(.*)",
  "/api/optimize(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all routing paths except static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
