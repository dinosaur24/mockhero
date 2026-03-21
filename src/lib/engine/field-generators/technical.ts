/**
 * Technical field generators: uuid, id, ip_address, mac_address, url, domain, user_agent, color_hex
 */

import type { FieldGenerator } from "../types";

/** Generate a v4-format UUID from PRNG (not crypto, but looks right) */
export const uuidGenerator: FieldGenerator = (_params, ctx) => {
  const hex = (n: number) =>
    Array.from({ length: n }, () =>
      ctx.prng.nextInt(0, 15).toString(16)
    ).join("");

  return `${hex(8)}-${hex(4)}-4${hex(3)}-${["8", "9", "a", "b"][ctx.prng.nextInt(0, 3)]}${hex(3)}-${hex(12)}`;
};

/** Auto-incrementing ID. Uses rowIndex from context. */
export const idGenerator: FieldGenerator = (params, ctx) => {
  const start = (params.start as number) ?? 1;
  const step = (params.step as number) ?? 1;
  return start + ctx.rowIndex * step;
};

export const ipAddressGenerator: FieldGenerator = (params, ctx) => {
  const version = (params.version as string) ?? "v4";

  if (version === "v6") {
    const groups = Array.from({ length: 8 }, () =>
      ctx.prng.nextInt(0, 65535).toString(16).padStart(4, "0")
    );
    return groups.join(":");
  }

  // v4 — avoid reserved ranges
  const first = ctx.prng.nextInt(1, 223);
  return `${first}.${ctx.prng.nextInt(0, 255)}.${ctx.prng.nextInt(0, 255)}.${ctx.prng.nextInt(1, 254)}`;
};

export const macAddressGenerator: FieldGenerator = (_params, ctx) => {
  const pairs = Array.from({ length: 6 }, () =>
    ctx.prng.nextInt(0, 255).toString(16).padStart(2, "0")
  );
  return pairs.join(":").toUpperCase();
};

const URL_DOMAINS = [
  "example.com", "test.io", "demo.dev", "sample.org", "myapp.co",
  "techblog.dev", "startup.io", "devtools.app", "api.services",
];

const URL_PATHS = [
  "/about", "/blog", "/pricing", "/contact", "/docs", "/api",
  "/products", "/features", "/team", "/careers", "/support",
  "/blog/getting-started", "/docs/api-reference", "/blog/release-notes",
];

export const urlGenerator: FieldGenerator = (_params, ctx) => {
  const domain = ctx.prng.pick(URL_DOMAINS);
  const path = ctx.prng.pick(URL_PATHS);
  return `https://${domain}${path}`;
};

export const domainGenerator: FieldGenerator = (_params, ctx) => {
  const prefixes = [
    "app", "dev", "api", "cloud", "data", "labs", "hub", "core",
    "tech", "web", "smart", "fast", "next", "pro", "go", "my",
  ];
  const tlds = [".com", ".io", ".dev", ".co", ".app", ".org", ".net"];
  return `${ctx.prng.pick(prefixes)}${ctx.prng.pick(tlds)}`;
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

export const userAgentGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(USER_AGENTS);
};

export const colorHexGenerator: FieldGenerator = (_params, ctx) => {
  const hex = ctx.prng.nextInt(0, 16777215).toString(16).padStart(6, "0");
  return `#${hex}`;
};
