import type { Entry, Org, Project, TargetingGroup } from "@shiplog/shared";

export const demoOrg: Org = { id: "org_demo", name: "Acme Cloud", slug: "acme", isHosted: true, plan: "pro" };

export const demoProject: Project = {
  id: "demo-project",
  orgId: demoOrg.id,
  name: "Acme Cloud",
  slug: "acme-cloud",
  brandColor: "#17483f",
  theme: { mode: "light", accent: "#b65f45", removeBranding: false },
  widgetSettings: { mode: "bell", position: "bottom-right", launcherLabel: "Updates" },
  toneSettings: { voice: "Clear, specific, operator-friendly", bannedWords: ["revolutionary", "seamless"] }
};

export const adminTargeting: TargetingGroup = {
  id: "admins-billing",
  combinator: "and",
  rules: [
    { id: "page", type: "page_url", operator: "contains", value: "/settings" },
    { id: "role", type: "user_attribute", field: "role", operator: "equals", value: "admin" }
  ]
};

export const demoEntries: Entry[] = [
  {
    id: "entry_analytics",
    projectId: demoProject.id,
    title: "Adoption funnels now connect announcements to feature usage",
    slug: "adoption-funnels",
    summary: "See who saw an announcement, opened it, clicked the CTA, completed the tour, and used the shipped feature.",
    content: "## What changed\n\nAdoption analytics now connect every announcement to the user journey that follows. Teams can track saw announcement, opened, clicked CTA, started tour, completed tour, and feature used events.\n\n## Why it matters\n\nRelease notes now answer whether shipped work actually landed with the right users.",
    type: "feature",
    categories: ["Analytics", "Adoption"],
    status: "published",
    sourceMetadata: { github: { pr: 428, repo: "acme/app" } },
    ctaType: "start_tour",
    ctaLabel: "Start tour",
    ctaUrl: "/analytics/adoption",
    mediaAttachments: [],
    targeting: adminTargeting,
    publishedAt: "2026-04-25T10:00:00.000Z",
    createdAt: "2026-04-24T10:00:00.000Z",
    updatedAt: "2026-04-25T10:00:00.000Z"
  },
  {
    id: "entry_rules",
    projectId: demoProject.id,
    title: "Visual targeting rules for page, plan, role, and segments",
    slug: "visual-targeting-rules",
    summary: "Build AND/OR groups that decide which users see each update inside your product.",
    content: "## Target precisely\n\nShiplog supports page URL matching, identified user attributes, saved segments, and recency rules. Dismissed announcements stay dismissed, and frequency caps keep updates respectful.",
    type: "improvement",
    categories: ["Targeting"],
    status: "published",
    sourceMetadata: { linear: { issue: "SL-128" } },
    ctaType: "take_me_there",
    ctaLabel: "Open rule builder",
    ctaUrl: "/targeting",
    mediaAttachments: [],
    publishedAt: "2026-04-18T09:00:00.000Z",
    createdAt: "2026-04-17T09:00:00.000Z",
    updatedAt: "2026-04-18T09:00:00.000Z"
  },
  {
    id: "entry_digest",
    projectId: demoProject.id,
    title: "Monthly editions can now be drafted with AI",
    slug: "monthly-editions-ai",
    summary: "Generate a concise monthly intro, choose categories, and send a polished edition from the email workspace.",
    content: "Monthly editions are available from the Email tab. In demo mode Shiplog generates a sample intro and simulates sends, opens, clicks, and unsubscribes.",
    type: "announcement",
    categories: ["Email", "AI"],
    status: "scheduled",
    sourceMetadata: {},
    ctaType: "try_now",
    ctaLabel: "Create edition",
    ctaUrl: "/email",
    mediaAttachments: [],
    scheduledAt: "2026-05-07T09:00:00.000Z",
    createdAt: "2026-04-29T09:00:00.000Z",
    updatedAt: "2026-04-29T09:00:00.000Z"
  }
];

export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
export const getPublicEntries = () => demoEntries.filter((entry) => entry.status === "published");
