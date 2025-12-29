import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/simulator(.*)",
  "/debugger(.*)",
  "/gas(.*)",
  "/prover(.*)",
  "/projects(.*)",
  "/history(.*)",
  "/teams(.*)",
  "/settings(.*)",
]);

// Routes that are always public
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/sync(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
