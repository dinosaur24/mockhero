import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/playground(.*)",
  "/privacy-policy(.*)",
  "/terms-of-service(.*)",
  "/cookie-policy(.*)",
  "/refund-policy(.*)",
  "/llms.txt",
  "/sitemap.xml",
  "/robots.txt",
]);

export default clerkMiddleware(async (auth, req) => {
  // Maintenance mode — check env var or DB-backed flag
  if (process.env.MAINTENANCE_MODE === "true") {
    const path = req.nextUrl.pathname;
    // Allow admin, health checks, and webhooks through maintenance
    if (
      !path.startsWith("/admin") &&
      !path.startsWith("/api/admin") &&
      !path.startsWith("/api/v1/health") &&
      !path.startsWith("/api/webhooks")
    ) {
      return new NextResponse(
        '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#0a0a12;color:#fff;"><div style="text-align:center;"><h1 style="font-size:2rem;margin-bottom:0.5rem;">MockHero</h1><p style="color:#a1a1aa;">We\'re getting things ready. Back soon.</p></div></body></html>',
        { status: 503, headers: { "Content-Type": "text/html", "Retry-After": "3600" } }
      );
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
  ],
};
