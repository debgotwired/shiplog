import type { FrequencyCap, FrequencyState, TargetingContext, TargetingGroup, TargetingRule } from "./types";

const isGroup = (candidate: TargetingRule | TargetingGroup): candidate is TargetingGroup => "rules" in candidate;

const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [value];

const getByPath = (source: Record<string, unknown> | undefined, path: string | undefined) => {
  if (!source || !path) return undefined;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
};

const matchesOperator = (actual: unknown, operator: TargetingRule["operator"] = "equals", expected?: TargetingRule["value"]) => {
  if (operator === "exists") return actual !== undefined && actual !== null && actual !== "";
  if (actual === undefined || actual === null) return false;
  const actualText = String(actual).toLowerCase();
  const expectedValues = asArray(expected).map((value) => String(value).toLowerCase());
  if (operator === "equals") return expectedValues.some((value) => actualText === value);
  if (operator === "contains") return expectedValues.some((value) => actualText.includes(value));
  if (operator === "matches") return expectedValues.some((value) => new RegExp(value, "i").test(String(actual)));
  if (operator === "in") return expectedValues.includes(actualText);
  if (operator === "not_in") return !expectedValues.includes(actualText);
  return false;
};

const recentVisits = (ctx: TargetingContext, rule: TargetingRule) => {
  const days = rule.days ?? 7;
  const minVisits = rule.minVisits ?? 1;
  const now = ctx.now ?? new Date();
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  const pattern = String(rule.value ?? rule.field ?? ctx.path);
  const visits = Object.entries(ctx.pageVisits ?? {})
    .filter(([url]) => url.includes(pattern))
    .flatMap(([, timestamps]) => timestamps)
    .filter((timestamp) => new Date(timestamp).getTime() >= cutoff);
  return visits.length >= minVisits;
};

export const evaluateRule = (rule: TargetingRule, ctx: TargetingContext): boolean => {
  if (rule.type === "all") return true;
  if (rule.type === "page_url") return matchesOperator(ctx.pageUrl, rule.operator, rule.value ?? rule.field);
  if (rule.type === "segment") return Boolean(rule.segmentId && ctx.segments?.[rule.segmentId]);
  if (rule.type === "recency") return recentVisits(ctx, rule);
  if (rule.type === "user_attribute") {
    const userRecord = { ...ctx.user, ...(ctx.user?.traits ?? {}) } as Record<string, unknown>;
    return matchesOperator(getByPath(userRecord, rule.field), rule.operator, rule.value);
  }
  return false;
};

export const evaluateTargeting = (group: TargetingGroup | undefined, ctx: TargetingContext): boolean => {
  if (!group || group.rules.length === 0) return true;
  const results = group.rules.map((item) => isGroup(item) ? evaluateTargeting(item, ctx) : evaluateRule(item, ctx));
  return group.combinator === "and" ? results.every(Boolean) : results.some(Boolean);
};

export const passesFrequencyCap = (entryId: string, cap: FrequencyCap | undefined, state: FrequencyState, now = new Date()) => {
  if (state.dismissedEntryIds.includes(entryId)) return false;
  if (cap?.oncePerSession && state.sessionShownEntryIds.includes(entryId)) return false;
  if (cap?.maxPerWeek !== undefined) {
    const record = state.weeklyCounts[entryId];
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    if (record && now.getTime() - new Date(record.since).getTime() < weekMs && record.count >= cap.maxPerWeek) return false;
  }
  return true;
};

export const shouldShowEntry = (entry: { id: string; targeting?: TargetingGroup }, ctx: TargetingContext, state: FrequencyState, cap?: FrequencyCap) => {
  return evaluateTargeting(entry.targeting, ctx) && passesFrequencyCap(entry.id, cap, state, ctx.now);
};
