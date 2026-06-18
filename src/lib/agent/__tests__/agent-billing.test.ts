import { describe, expect, it } from "vitest";
import { calculateAgentBillableRecords, estimateAgentMeteredUsage } from "../billing";

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

  it("estimates zero cost while the request stays inside the free daily allowance", () => {
    expect(estimateAgentMeteredUsage({ requestedRecords: 400, dailyUsedBefore: 0 })).toEqual({
      requested_records: 400,
      daily_used_before: 0,
      daily_used_after: 400,
      free_records_per_day: 500,
      free_records_remaining_before: 500,
      billable_records: 0,
      billable_units_100: 0,
      estimated_cost_usd: "0.000",
      price_usd_per_100_records: "0.001",
      billing: "monthly_usage",
    });
  });

  it("estimates only the records above the daily free allowance", () => {
    const estimate = estimateAgentMeteredUsage({
      requestedRecords: 200,
      dailyUsedBefore: 450,
    });

    expect(estimate.billable_records).toBe(150);
    expect(estimate.billable_units_100).toBe(2);
    expect(estimate.estimated_cost_usd).toBe("0.002");
  });
});
