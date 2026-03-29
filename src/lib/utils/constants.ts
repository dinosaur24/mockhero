/**
 * Tier-based rate limits.
 * Source: docs/prd.md § API Specification > Rate Limits
 */
export const TIER_LIMITS = {
  free: {
    dailyRecords: 1_000,
    perRequest: 100,
    perMinute: 10,
    promptsPerDay: 10,
  },
  pro: {
    dailyRecords: 100_000,
    perRequest: 10_000,
    perMinute: 60,
    promptsPerDay: 100,
  },
  scale: {
    dailyRecords: 1_000_000,
    perRequest: 50_000,
    perMinute: 120,
    promptsPerDay: 500,
  },
} as const;

/** API key prefix — all MockHero keys start with this */
export const API_KEY_PREFIX = "mh_";

export type Tier = keyof typeof TIER_LIMITS;

/**
 * Credit packs — one-time purchases via Polar.
 * 1 credit = 1 record generated.
 * Credits never expire; used before daily tier limits.
 */
export const CREDIT_PACKS = {
  starter: { credits: 5_000, price: 9, label: "Starter" },
  builder: { credits: 25_000, price: 29, label: "Builder" },
  scale: { credits: 100_000, price: 79, label: "Scale" },
} as const;

export type CreditPack = keyof typeof CREDIT_PACKS;
