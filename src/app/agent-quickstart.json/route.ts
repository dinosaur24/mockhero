import { NextResponse } from "next/server";
import { buildAgentQuickstart } from "@/lib/agent/surfaces";

export async function GET() {
  return NextResponse.json(buildAgentQuickstart(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
