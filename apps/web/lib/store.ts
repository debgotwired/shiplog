import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Entry, Org, Project } from "@shiplog/shared";
import { demoEntries, demoOrg, demoProject, slugify } from "./demo-data";

interface ShiplogState {
  org: Org;
  projects: Project[];
  entries: Entry[];
}

const seedState = (): ShiplogState => ({
  org: demoOrg,
  projects: [demoProject],
  entries: demoEntries
});

const statePath = path.join(process.cwd(), ".shiplog-data.json");
const memoryKey = "__shiplog_state__";

const hasSupabaseServer = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "false"
);

const supabase = hasSupabaseServer
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    })
  : null;

const globalStore = globalThis as typeof globalThis & { [memoryKey]?: ShiplogState };

const readLocalState = async (): Promise<ShiplogState> => {
  if (globalStore[memoryKey]) return globalStore[memoryKey]!;
  if (!process.env.VERCEL) {
    try {
      const parsed = JSON.parse(await fs.readFile(statePath, "utf8")) as ShiplogState;
      globalStore[memoryKey] = parsed;
      return parsed;
    } catch {
      // Seed below.
    }
  }
  const seeded = seedState();
  globalStore[memoryKey] = seeded;
  return seeded;
};

const writeLocalState = async (state: ShiplogState) => {
  globalStore[memoryKey] = state;
  if (!process.env.VERCEL) {
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }
};

const fromProjectRow = (row: any): Project => ({
  id: row.id,
  orgId: row.org_id,
  name: row.name,
  slug: row.slug,
  logoUrl: row.logo_url ?? undefined,
  brandColor: row.brand_color,
  theme: row.theme,
  widgetSettings: row.widget_settings,
  toneSettings: row.tone_settings,
  customDomain: row.custom_domain ?? undefined
});

const fromEntryRow = (row: any): Entry => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  slug: row.slug,
  summary: row.summary,
  content: row.content,
  type: row.type,
  categories: row.categories ?? [],
  status: row.status,
  sourceMetadata: row.source_metadata ?? {},
  ctaType: row.cta_type,
  ctaLabel: row.cta_label ?? undefined,
  ctaUrl: row.cta_url ?? undefined,
  mediaAttachments: row.media_attachments ?? [],
  scheduledAt: row.scheduled_at ?? undefined,
  publishedAt: row.published_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toOrgRow = (org: Org) => ({
  id: org.id,
  name: org.name,
  slug: org.slug,
  is_hosted: org.isHosted,
  plan: org.plan
});

const toProjectRow = (project: Project) => ({
  id: project.id,
  org_id: project.orgId,
  name: project.name,
  slug: project.slug,
  logo_url: project.logoUrl ?? null,
  brand_color: project.brandColor,
  theme: project.theme,
  widget_settings: project.widgetSettings,
  tone_settings: project.toneSettings,
  custom_domain: project.customDomain ?? null
});

const toEntryRow = (entry: Entry) => ({
  id: entry.id,
  project_id: entry.projectId,
  title: entry.title,
  slug: entry.slug,
  summary: entry.summary,
  content: entry.content,
  type: entry.type,
  categories: entry.categories,
  status: entry.status,
  source_metadata: entry.sourceMetadata,
  cta_type: entry.ctaType,
  cta_label: entry.ctaLabel ?? null,
  cta_url: entry.ctaUrl ?? null,
  media_attachments: entry.mediaAttachments,
  scheduled_at: entry.scheduledAt ?? null,
  published_at: entry.publishedAt ?? null,
  created_at: entry.createdAt,
  updated_at: entry.updatedAt
});

export const getState = async (): Promise<ShiplogState> => {
  if (!supabase) return readLocalState();
  const [{ data: orgs, error: orgError }, { data: projects, error: projectError }, { data: entries, error: entryError }] = await Promise.all([
    supabase.from("orgs").select("*").limit(1),
    supabase.from("projects").select("*").order("created_at"),
    supabase.from("entries").select("*").order("created_at", { ascending: false })
  ]);
  if (orgError || projectError || entryError) throw new Error(orgError?.message ?? projectError?.message ?? entryError?.message);
  if (!orgs?.[0]) {
    const org: Org = { ...demoOrg, id: crypto.randomUUID() };
    const project: Project = { ...demoProject, id: crypto.randomUUID(), orgId: org.id };
    const entries: Entry[] = demoEntries.map((entry) => ({ ...entry, id: crypto.randomUUID(), projectId: project.id }));
    const orgInsert = await supabase.from("orgs").insert(toOrgRow(org));
    if (orgInsert.error) throw new Error(orgInsert.error.message);
    const projectInsert = await supabase.from("projects").insert(toProjectRow(project));
    if (projectInsert.error) throw new Error(projectInsert.error.message);
    const entryInsert = await supabase.from("entries").insert(entries.map(toEntryRow));
    if (entryInsert.error) throw new Error(entryInsert.error.message);
    return { org, projects: [project], entries };
  }
  return {
    org: { id: orgs[0].id, name: orgs[0].name, slug: orgs[0].slug, isHosted: orgs[0].is_hosted, plan: orgs[0].plan },
    projects: (projects ?? []).map(fromProjectRow),
    entries: (entries ?? []).map(fromEntryRow)
  };
};

export const createProject = async (input: { name: string; orgId?: string }) => {
  const state = await getState();
  const nowName = input.name.trim() || "Untitled project";
  const project: Project = {
    ...demoProject,
    id: crypto.randomUUID(),
    orgId: input.orgId ?? state.org.id,
    name: nowName,
    slug: slugify(nowName)
  };
  if (supabase) {
    const { data, error } = await supabase.from("projects").insert(toProjectRow(project)).select("*").single();
    if (error) throw new Error(error.message);
    return fromProjectRow(data);
  }
  const next = { ...state, projects: [...state.projects, project] };
  await writeLocalState(next);
  return project;
};

export const updateProject = async (id: string, patch: Partial<Project>) => {
  const state = await getState();
  const current = state.projects.find((project) => project.id === id);
  if (!current) throw new Error("Project not found");
  const project = { ...current, ...patch };
  if (supabase) {
    const { data, error } = await supabase.from("projects").update(toProjectRow(project)).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return fromProjectRow(data);
  }
  await writeLocalState({ ...state, projects: state.projects.map((item) => item.id === id ? project : item) });
  return project;
};

export const upsertEntry = async (entry: Entry) => {
  const state = await getState();
  const now = new Date().toISOString();
  const nextEntry: Entry = {
    ...entry,
    id: entry.id || crypto.randomUUID(),
    slug: entry.slug || slugify(entry.title),
    createdAt: entry.createdAt || now,
    updatedAt: now,
    publishedAt: entry.status === "published" ? (entry.publishedAt ?? now) : entry.publishedAt
  };
  if (supabase) {
    const { data, error } = await supabase.from("entries").upsert(toEntryRow(nextEntry), { onConflict: "id" }).select("*").single();
    if (error) throw new Error(error.message);
    return fromEntryRow(data);
  }
  await writeLocalState({ ...state, entries: [nextEntry, ...state.entries.filter((item) => item.id !== nextEntry.id)] });
  return nextEntry;
};

export const patchEntry = async (id: string, patch: Partial<Entry>) => {
  const state = await getState();
  const current = state.entries.find((entry) => entry.id === id);
  if (!current) throw new Error("Entry not found");
  return upsertEntry({ ...current, ...patch, updatedAt: new Date().toISOString() });
};

export const getProjectBySlug = async (slug: string) => {
  const state = await getState();
  return state.projects.find((project) => project.slug === slug);
};

export const getPublicEntriesForProject = async (projectId: string) => {
  const state = await getState();
  const now = Date.now();
  return state.entries.filter((entry) => {
    if (entry.projectId !== projectId) return false;
    if (entry.status === "published") return true;
    if (entry.status === "scheduled" && entry.scheduledAt) return new Date(entry.scheduledAt).getTime() <= now;
    return false;
  });
};

export const getProjectWithPublicEntries = async (slug: string) => {
  const project = await getProjectBySlug(slug);
  if (!project) return null;
  return { project, entries: await getPublicEntriesForProject(project.id) };
};
