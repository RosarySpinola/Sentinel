import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (wallet connection)
const protectedRoutes = ["/projects", "/history", "/teams", "/settings"];

// Routes that are always public
const publicRoutes = [
  "/",
  "/simulator",
  "/debugger",
  "/gas",
  "/prover",
  "/api",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow public routes
  for (const route of publicRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return NextResponse.next();
    }
  }

  // For protected routes, we'll handle auth client-side with Privy
  // The middleware just passes through - actual auth check happens in components
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
