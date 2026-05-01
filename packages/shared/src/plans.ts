import type { Org, Plan } from "./types";

export interface PlanLimit {
  projects: number | "unlimited";
  aiGenerationsPerMonth: number | "unlimited";
  subscribers: number;
  fullTargeting: boolean;
  pageTargeting: boolean;
  adoptionFlows: boolean;
  customDomain: boolean;
  removeBranding: boolean;
  channels: string[];
}

export const PLAN_LIMITS: Record<Plan, PlanLimit> = {
  free: {
    projects: "unlimited",
    aiGenerationsPerMonth: "unlimited",
    subscribers: 100000,
    fullTargeting: true,
    pageTargeting: true,
    adoptionFlows: true,
    customDomain: true,
    removeBranding: false,
    channels: ["email", "x", "linkedin", "slack", "webhook"]
  },
  starter: {
    projects: 3,
    aiGenerationsPerMonth: 100,
    subscribers: 1000,
    fullTargeting: false,
    pageTargeting: true,
    adoptionFlows: false,
    customDomain: false,
    removeBranding: false,
    channels: ["email", "x", "slack"]
  },
  pro: {
    projects: "unlimited",
    aiGenerationsPerMonth: "unlimited",
    subscribers: 10000,
    fullTargeting: true,
    pageTargeting: true,
    adoptionFlows: true,
    customDomain: true,
    removeBranding: true,
    channels: ["email", "x", "linkedin", "slack", "webhook"]
  }
};

export const getPlanLimits = (org: Pick<Org, "plan" | "isHosted">): PlanLimit => {
  if (!org.isHosted) return PLAN_LIMITS.free;
  return PLAN_LIMITS[org.plan];
};

export type Provider = "anthropic" | "resend" | "ses" | "github" | "linear" | "slack" | "x" | "linkedin" | "webhook";

export interface ProviderKeyConfig {
  orgId: string;
  provider: Provider;
  encryptedKey?: string;
  keyHint?: string;
}

export const resolveProviderKeySource = (org: Pick<Org, "isHosted">, provider: Provider, byok?: ProviderKeyConfig) => {
  if (org.isHosted) return { source: "hosted_env" as const, envName: provider.toUpperCase() + "_API_KEY" };
  if (byok?.encryptedKey) return { source: "byok" as const, encryptedKey: byok.encryptedKey, keyHint: byok.keyHint };
  return { source: "missing" as const, message: "Configure a BYOK key for " + provider };
};

export const canUseFeature = (org: Pick<Org, "plan" | "isHosted">, feature: keyof PlanLimit) => {
  const value = getPlanLimits(org)[feature];
  return typeof value === "boolean" ? value : Boolean(value);
};
