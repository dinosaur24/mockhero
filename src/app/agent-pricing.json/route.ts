import { NextResponse } from "next/server";
import { buildAgentPricing } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildAgentPricing(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
