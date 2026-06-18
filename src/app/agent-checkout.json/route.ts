import { NextResponse } from "next/server";
import { buildAgentCheckout } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildAgentCheckout(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
