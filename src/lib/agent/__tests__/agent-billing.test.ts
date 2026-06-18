import { describe, expect, it } from "vitest";
import { calculateAgentBillableRecords } from "../billing";

describe("agent metered billing", () => {
  it("does not bill records inside the daily free allowance", () => {
    expect(calculateAgentBillableRecords({ dailyUsedAfter: 500, requestedRecords: 500 })).toBe(0);
    expect(calculateAgentBillableRecords({ dailyUsedAfter: 475, requestedRecords: 25 })).toBe(0);
  });

  it("bills only the part of the request above the daily free allowance", () => {
    expect(calculateAgentBillableRecords({ dailyUsedAfter: 600, requestedRecords: 200 })).toBe(100);
  });

  it("bills the full request once the free allowance was already consumed", () => {
    expect(calculateAgentBillableRecords({ dailyUsedAfter: 1_000, requestedRecords: 100 })).toBe(100);
  });

  it("never returns a negative billable quantity", () => {
    expect(calculateAgentBillableRecords({ dailyUsedAfter: 0, requestedRecords: 100 })).toBe(0);
  });
});
