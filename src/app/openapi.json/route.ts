import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/agent/openapi";

export function GET() {
  return NextResponse.json(buildOpenApiSpec(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
