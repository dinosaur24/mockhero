import { NextResponse } from "next/server";
import { buildChatGptAppReadiness } from "@/lib/agent/surfaces";

export function GET() {
  return NextResponse.json(buildChatGptAppReadiness(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
