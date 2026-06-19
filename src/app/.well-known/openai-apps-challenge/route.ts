const OPENAI_APPS_CHALLENGE_TOKEN =
  "llwaoOqBgiuXlOKqQqVV8zDmF4oxDQFj-rzpmXcETGw";

export const dynamic = "force-static";

export function GET() {
  return new Response(OPENAI_APPS_CHALLENGE_TOKEN, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
