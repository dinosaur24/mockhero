import { NextResponse } from "next/server";
import { buildCapabilities } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildCapabilities(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
