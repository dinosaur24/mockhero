import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MockHero — Synthetic Test Data API";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Re-use the same OG image for Twitter
export { default } from "./opengraph-image";
