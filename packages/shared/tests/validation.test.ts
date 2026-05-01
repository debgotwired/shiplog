import { describe, expect, it } from "vitest";
import { widgetEventSchema } from "../src/validation";

describe("widget event validation", () => {
  it("accepts valid widget events", () => {
    const parsed = widgetEventSchema.parse({ event: "cta_click", projectId: "p1", entryId: "e1", visitorId: "v1", pageUrl: "https://example.com", payload: { mode: "bell" } });
    expect(parsed.event).toBe("cta_click");
  });

  it("rejects unknown events", () => {
    expect(() => widgetEventSchema.parse({ event: "bad", projectId: "p1", visitorId: "v1" })).toThrow();
  });
});
