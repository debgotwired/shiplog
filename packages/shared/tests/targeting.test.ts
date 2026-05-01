import { describe, expect, it } from "vitest";
import { evaluateTargeting, passesFrequencyCap, shouldShowEntry } from "../src/targeting";
import type { TargetingGroup } from "../src/types";

const ctx = {
  pageUrl: "https://app.example.com/settings/billing?tab=invoices",
  path: "/settings/billing",
  user: { id: "u1", plan: "pro", role: "admin", traits: { account: { seats: 42 }, beta: true } },
  segments: { admins: true },
  now: new Date("2026-05-01T00:00:00Z"),
  pageVisits: { "/settings": ["2026-04-30T00:00:00Z", "2026-04-29T00:00:00Z"] }
};

describe("targeting evaluator", () => {
  it("matches page, attributes, segment, and recency in AND groups", () => {
    const group: TargetingGroup = { id: "g", combinator: "and", rules: [
      { id: "r1", type: "page_url", operator: "contains", value: "/settings" },
      { id: "r2", type: "user_attribute", field: "role", operator: "equals", value: "admin" },
      { id: "r3", type: "user_attribute", field: "account.seats", operator: "equals", value: 42 },
      { id: "r4", type: "segment", segmentId: "admins" },
      { id: "r5", type: "recency", value: "/settings", days: 7, minVisits: 2 }
    ]};
    expect(evaluateTargeting(group, ctx)).toBe(true);
  });

  it("supports OR groups", () => {
    expect(evaluateTargeting({ id: "g", combinator: "or", rules: [
      { id: "r1", type: "user_attribute", field: "plan", operator: "equals", value: "free" },
      { id: "r2", type: "page_url", operator: "contains", value: "billing" }
    ]}, ctx)).toBe(true);
  });

  it("blocks dismissed and over-frequency entries", () => {
    const state = { dismissedEntryIds: ["e1"], sessionShownEntryIds: ["e2"], weeklyCounts: { e3: { count: 2, since: "2026-04-30T00:00:00Z" } } };
    expect(passesFrequencyCap("e1", {}, state, ctx.now)).toBe(false);
    expect(passesFrequencyCap("e2", { oncePerSession: true }, state, ctx.now)).toBe(false);
    expect(passesFrequencyCap("e3", { maxPerWeek: 2 }, state, ctx.now)).toBe(false);
    expect(shouldShowEntry({ id: "e4" }, ctx, state, { maxPerWeek: 2 })).toBe(true);
  });
});
