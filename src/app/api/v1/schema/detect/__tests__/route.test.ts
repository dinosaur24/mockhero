import { describe, expect, it } from "vitest";
import { POST } from "../route";

function request(body: unknown): Request {
  return new Request("https://mockhero.dev/api/v1/schema/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/schema/detect", () => {
  it("detects schema without an API key", async () => {
    const res = await POST(
      request({
        sql: "CREATE TABLE users (id uuid primary key, email text not null, created_at timestamp);",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.schema.tables[0].name).toBe("users");
    expect(body.schema.tables[0].fields.map((field: { name: string }) => field.name)).toContain(
      "email"
    );
  });
});
