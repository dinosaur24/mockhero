import { describe, it, expect } from "vitest";
import { createPRNG } from "../prng";

describe("PRNG", () => {
  it("produces deterministic output with same seed", () => {
    const a = createPRNG(42);
    const b = createPRNG(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it("produces different output with different seeds", () => {
    const a = createPRNG(42);
    const b = createPRNG(99);
    expect(a.next()).not.toBe(b.next());
  });

  it("next() returns values in [0, 1)", () => {
    const prng = createPRNG(1);
    for (let i = 0; i < 1000; i++) {
      const val = prng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("nextInt returns values in [min, max]", () => {
    const prng = createPRNG(1);
    for (let i = 0; i < 500; i++) {
      const val = prng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it("nextFloat respects precision", () => {
    const prng = createPRNG(1);
    for (let i = 0; i < 100; i++) {
      const val = prng.nextFloat(0, 100, 2);
      const decimalPlaces = (val.toString().split(".")[1] || "").length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    }
  });

  it("pick returns element from array", () => {
    const prng = createPRNG(1);
    const arr = ["a", "b", "c", "d"];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(prng.pick(arr));
    }
  });

  it("pick throws on empty array", () => {
    const prng = createPRNG(1);
    expect(() => prng.pick([])).toThrow("Cannot pick from empty array");
  });

  it("weightedPick respects weights", () => {
    const prng = createPRNG(1);
    const items = ["rare", "common"];
    const weights = [1, 99];
    const counts = { rare: 0, common: 0 };

    for (let i = 0; i < 10000; i++) {
      const pick = prng.weightedPick(items, weights);
      counts[pick as keyof typeof counts]++;
    }

    // "common" should appear much more often than "rare"
    expect(counts.common).toBeGreaterThan(counts.rare * 5);
  });

  it("shuffle returns all elements", () => {
    const prng = createPRNG(42);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = prng.shuffle(arr);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("chance returns boolean with approximate probability", () => {
    const prng = createPRNG(1);
    let trueCount = 0;
    const total = 10000;

    for (let i = 0; i < total; i++) {
      if (prng.chance(0.7)) trueCount++;
    }

    const ratio = trueCount / total;
    expect(ratio).toBeGreaterThan(0.65);
    expect(ratio).toBeLessThan(0.75);
  });

  it("stores the seed", () => {
    const prng = createPRNG(12345);
    expect(prng.seed).toBe(12345);
  });
});
