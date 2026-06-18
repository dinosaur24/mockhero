import { renderLlmsFullTxt } from "@/lib/agent/markdown";

export function GET() {
  return new Response(renderLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
