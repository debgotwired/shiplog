export type Plan = "free" | "starter" | "pro";
export type EntryStatus = "draft" | "scheduled" | "published";
export type EntryType = "feature" | "improvement" | "fix" | "security" | "announcement";
export type WidgetMode = "bell" | "toast" | "modal" | "sidebar" | "banner";
export type CtaType = "take_me_there" | "start_tour" | "watch_video" | "try_now";

export interface Org {
  id: string;
  name: string;
  slug: string;
  isHosted: boolean;
  plan: Plan;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  brandColor: string;
  theme: { mode: "light" | "dark"; accent?: string; removeBranding?: boolean };
  widgetSettings: { mode: WidgetMode; position: "bottom-right" | "bottom-left" | "top"; launcherLabel?: string };
  toneSettings: { voice: string; bannedWords: string[]; example?: string };
  customDomain?: string;
}

export interface Entry {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: EntryType;
  categories: string[];
  status: EntryStatus;
  sourceMetadata: Record<string, unknown>;
  ctaType: CtaType;
  ctaLabel?: string;
  ctaUrl?: string;
  mediaAttachments: { url: string; alt?: string; type: "image" | "video" }[];
  targeting?: TargetingGroup;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type RuleType = "all" | "page_url" | "user_attribute" | "segment" | "recency";
export type RuleOperator = "equals" | "contains" | "matches" | "in" | "not_in" | "exists";

export interface TargetingRule {
  id: string;
  type: RuleType;
  operator?: RuleOperator;
  field?: string;
  value?: string | number | boolean | string[];
  segmentId?: string;
  days?: number;
  minVisits?: number;
}

export interface TargetingGroup {
  id: string;
  combinator: "and" | "or";
  rules: Array<TargetingRule | TargetingGroup>;
}

export interface TargetingContext {
  pageUrl: string;
  path: string;
  user?: { id?: string; email?: string; plan?: string; role?: string; traits?: Record<string, unknown> };
  segments?: Record<string, boolean>;
  pageVisits?: Record<string, string[]>;
  now?: Date;
}

export interface FrequencyState {
  sessionShownEntryIds: string[];
  weeklyCounts: Record<string, { count: number; since: string }>;
  dismissedEntryIds: string[];
}

export interface FrequencyCap {
  oncePerSession?: boolean;
  maxPerWeek?: number;
}
