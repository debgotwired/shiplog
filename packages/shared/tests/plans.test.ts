import { describe, expect, it } from "vitest";
import { getPlanLimits, resolveProviderKeySource } from "../src/plans";

describe("plan and key routing", () => {
  it("unlocks standard features for self-hosted orgs", () => {
    const limits = getPlanLimits({ plan: "starter", isHosted: false });
    expect(limits.fullTargeting).toBe(true);
    expect(limits.adoptionFlows).toBe(true);
  });

  it("applies hosted starter gates", () => {
    const limits = getPlanLimits({ plan: "starter", isHosted: true });
    expect(limits.projects).toBe(3);
    expect(limits.fullTargeting).toBe(false);
    expect(limits.customDomain).toBe(false);
  });

  it("routes hosted keys to environment and self-hosted to BYOK", () => {
    expect(resolveProviderKeySource({ isHosted: true }, "anthropic").source).toBe("hosted_env");
    expect(resolveProviderKeySource({ isHosted: false }, "resend", { orgId: "o", provider: "resend", encryptedKey: "abc", keyHint: "re_..." }).source).toBe("byok");
    expect(resolveProviderKeySource({ isHosted: false }, "github").source).toBe("missing");
  });
});
