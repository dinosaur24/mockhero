import { NextResponse } from "next/server";
import { buildAgentManifest } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildAgentManifest(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
