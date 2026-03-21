/**
 * Seeded PRNG using mulberry32 algorithm.
 * Pure, deterministic, fast. Same seed = same sequence every time.
 *
 * CRITICAL: All randomness in the engine MUST flow through this PRNG.
 * Never use Math.random() in any engine code.
 */

export interface PRNG {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number;
  /** Returns a float in [min, max) with given decimal precision */
  nextFloat(min: number, max: number, precision?: number): number;
  /** Pick a random element from an array */
  pick<T>(array: readonly T[]): T;
  /** Pick from items with weighted probability. Weights don't need to sum to 1. */
  weightedPick<T>(items: readonly T[], weights: readonly number[]): T;
  /** Shuffle an array (Fisher-Yates). Returns a new array. */
  shuffle<T>(array: readonly T[]): T[];
  /** Returns true with the given probability (0-1) */
  chance(probability: number): boolean;
  /** The seed used to create this PRNG */
  seed: number;
}

/**
 * Create a seeded PRNG instance.
 * If no seed is provided, a random one is generated (non-reproducible).
 */
export function createPRNG(seed?: number): PRNG {
  let state = seed ?? Math.floor(Math.random() * 2 ** 32);
  const originalSeed = state;

  // mulberry32 core — produces a 32-bit integer, normalized to [0, 1)
  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextFloat(min: number, max: number, precision = 2): number {
    const value = next() * (max - min) + min;
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }

  function pick<T>(array: readonly T[]): T {
    if (array.length === 0) throw new Error("Cannot pick from empty array");
    return array[Math.floor(next() * array.length)];
  }

  function weightedPick<T>(
    items: readonly T[],
    weights: readonly number[]
  ): T {
    if (items.length === 0) throw new Error("Cannot pick from empty array");
    if (items.length !== weights.length) {
      throw new Error("Items and weights must have same length");
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }

    // Fallback (shouldn't happen with valid weights)
    return items[items.length - 1];
  }

  function shuffle<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function chance(probability: number): boolean {
    return next() < probability;
  }

  return {
    next,
    nextInt,
    nextFloat,
    pick,
    weightedPick,
    shuffle,
    chance,
    seed: originalSeed,
  };
}
