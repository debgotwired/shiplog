"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Activity, Bell, Bot, CalendarClock, Check, ChevronDown, Code2, ExternalLink, Eye, FileText, Globe2,
  KeyRound, LayoutDashboard, Mail, Megaphone, MousePointerClick, Plus, Rocket, Route, Rss, Search,
  Send, Settings, ShieldCheck, Sparkles, Split, Wand2, Webhook
} from "lucide-react";
import { demoEntries, demoOrg, demoProject, slugify } from "@/lib/demo-data";
import { getPlanLimits, type Entry, type Org, type Project, type TargetingGroup, type WidgetMode } from "@shiplog/shared";

type Tab = "overview" | "entries" | "editor" | "targeting" | "widget" | "analytics" | "email" | "social" | "integrations" | "settings" | "admin" | "adoption";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "entries", label: "Entries", icon: FileText },
  { id: "editor", label: "Editor", icon: Wand2 },
  { id: "targeting", label: "Targeting", icon: Split },
  { id: "widget", label: "Widget", icon: Bell },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "email", label: "Email", icon: Mail },
  { id: "social", label: "Social", icon: Megaphone },
  { id: "integrations", label: "Integrations", icon: Webhook },
  { id: "adoption", label: "Adoption", icon: Route },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "admin", label: "Admin", icon: ShieldCheck }
];

const defaultDraft: Entry = {
  id: "",
  projectId: demoProject.id,
  title: "",
  slug: "",
  summary: "",
  content: "## What changed\n\nDescribe the shipped work.\n\n## Who should care\n\nName the audience and adoption path.",
  type: "feature",
  categories: ["Product"],
  status: "draft",
  sourceMetadata: {},
  ctaType: "take_me_there",
  ctaLabel: "Take me there",
  ctaUrl: "/",
  mediaAttachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const pageTargeting: TargetingGroup = { id: "target-demo", combinator: "and", rules: [
  { id: "page", type: "page_url", operator: "contains", value: "/settings" },
  { id: "role", type: "user_attribute", field: "role", operator: "equals", value: "admin" },
  { id: "segment", type: "segment", segmentId: "admins" },
  { id: "recency", type: "recency", value: "/settings", days: 7, minVisits: 2 }
] };

function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) setValue(JSON.parse(stored) as T);
  }, [key]);
  useEffect(() => window.localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const colors = {
    neutral: "border-line bg-paper text-ink",
    green: "border-pine/20 bg-pine/10 text-pine",
    amber: "border-brass/25 bg-brass/10 text-brass",
    red: "border-clay/25 bg-clay/10 text-clay",
    blue: "border-sky-300 bg-sky-50 text-sky-800"
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", colors[tone])}>{children}</span>;
}

function Panel({ title, icon: Icon, action, children }: { title: string; icon?: React.ComponentType<{ size?: number }>; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-[#fffdf8]/90 p-4 shadow-quiet">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">{Icon ? <Icon size={16} /> : null}{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-xs font-medium text-neutral-600"><span>{label}</span>{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-9 border border-line bg-white px-3 text-sm outline-none focus:border-pine", props.className)} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-9 border border-line bg-white px-3 text-sm outline-none focus:border-pine", props.className)} />;
}

function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button {...props} className={cn("inline-flex h-9 items-center justify-center gap-2 px-3 text-sm font-medium transition disabled:opacity-50", variant === "primary" && "bg-ink text-paper hover:bg-pine", variant === "secondary" && "border border-line bg-white hover:border-pine", variant === "ghost" && "hover:bg-black/5", props.className)}>{children}</button>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="border-l border-line pl-4"><div className="text-2xl font-semibold tracking-tight">{value}</div><div className="text-xs font-medium text-neutral-500">{label}</div><div className="mt-1 text-xs text-neutral-500">{detail}</div></div>;
}

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [org, setOrg] = usePersistedState<Org>("shiplog:org", demoOrg);
  const [projects, setProjects] = usePersistedState<Project[]>("shiplog:projects", [demoProject]);
  const [activeProjectId, setActiveProjectId] = usePersistedState("shiplog:active-project", demoProject.id);
  const [entries, setEntries] = usePersistedState<Entry[]>("shiplog:entries", demoEntries);
  const [draft, setDraft] = useState<Entry>(defaultDraft);
  const [query, setQuery] = useState("");
  const [emailStatus, setEmailStatus] = useState("Ready to mock instant, weekly, and monthly sends.");
  const [socialCopy, setSocialCopy] = useState("New in Acme Cloud: adoption funnels show whether announcements turn into real feature usage. Built for teams who ship and measure.");
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const limits = getPlanLimits(org);

  const filteredEntries = useMemo(() => entries.filter((entry) => entry.projectId === activeProject.id && [entry.title, entry.summary, entry.categories.join(" "), entry.status].join(" ").toLowerCase().includes(query.toLowerCase())), [activeProject.id, entries, query]);
  const published = entries.filter((entry) => entry.status === "published").length;
  const widgetUrl = typeof window === "undefined" ? "/widget/shiplog.js" : window.location.origin + "/widget/shiplog.js";
  const snippet = `<script src="${widgetUrl}" data-project-id="${activeProject.id}" data-mode="${activeProject.widgetSettings.mode}" async></script>`;

  function saveDraft(status: Entry["status"] = draft.status) {
    const now = new Date().toISOString();
    const id = draft.id || "entry_" + crypto.randomUUID();
    const nextEntry: Entry = { ...draft, id, projectId: activeProject.id, slug: draft.slug || slugify(draft.title), status, publishedAt: status === "published" ? now : draft.publishedAt, updatedAt: now, createdAt: draft.createdAt || now };
    setEntries((current) => [nextEntry, ...current.filter((entry) => entry.id !== id)]);
    setQuery("");
    setDraft({ ...defaultDraft, projectId: activeProject.id });
    setTab("entries");
  }

  function updateProject(patch: Partial<Project>) {
    setProjects((current) => current.map((project) => project.id === activeProject.id ? { ...project, ...patch } : project));
  }

  function generateAiDraft(source: "GitHub" | "Linear") {
    const now = new Date().toISOString();
    setDraft({ ...defaultDraft, id: "", projectId: activeProject.id, title: source + " generated draft: faster adoption review", slug: "", summary: "Mock AI converted shipped source metadata into a user-facing changelog draft for review.", content: "## Draft from " + source + "\n\nAI summarized the merged work, rewrote it for product users, and prepared short social and email versions.\n\n## Review notes\n\nThis stays in draft until a human publishes it.", sourceMetadata: { provider: source.toLowerCase(), mock: true }, categories: ["AI", "Review queue"], createdAt: now, updatedAt: now });
    setTab("editor");
  }

  function addProject() {
    const name = "Workspace " + (projects.length + 1);
    const project: Project = { ...demoProject, id: "project_" + crypto.randomUUID(), name, slug: slugify(name), orgId: org.id };
    setProjects((current) => [...current, project]);
    setActiveProjectId(project.id);
  }

  return (
    <main className="min-h-screen p-3 text-ink md:p-5">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border border-line bg-[#fffdf8] p-3 shadow-quiet lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
            <div className="grid size-9 place-items-center bg-ink text-paper"><Rocket size={18} /></div>
            <div><div className="font-semibold leading-tight">Shiplog</div><div className="text-xs text-neutral-500">surface, not destination</div></div>
          </div>
          <div className="mb-4 grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Project</div>
            <div className="flex items-center gap-2 border border-line bg-white px-2 py-2 text-sm"><Globe2 size={15} /><select className="min-w-0 flex-1 bg-transparent outline-none" value={activeProject.id} onChange={(event) => setActiveProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><ChevronDown size={14} /></div>
            <Button variant="secondary" onClick={addProject}><Plus size={15} /> New project</Button>
          </div>
          <nav className="grid gap-1">
            {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={cn("flex items-center gap-2 px-2 py-2 text-left text-sm", tab === item.id ? "bg-ink text-paper" : "hover:bg-black/5")}><item.icon size={16} />{item.label}</button>)}
          </nav>
          <div className="mt-5 border-t border-line pt-4 text-xs text-neutral-600"><Badge tone={org.isHosted ? "green" : "amber"}>{org.isHosted ? "Hosted" : "Self-hosted"} {org.plan}</Badge><p className="mt-2">Demo mode persists changes in localStorage until Supabase is configured.</p></div>
        </aside>

        <section className="min-w-0">
          <header className="mb-4 flex flex-col gap-3 border border-line bg-[#fffdf8] p-4 shadow-quiet md:flex-row md:items-center md:justify-between">
            <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{activeProject.name}</div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Changelog operations console</h1></div>
            <div className="flex flex-wrap gap-2"><a className="inline-flex h-9 items-center gap-2 border border-line bg-white px-3 text-sm" href={`/changelog/${activeProject.slug}`} target="_blank"><ExternalLink size={15} /> Public page</a><a className="inline-flex h-9 items-center gap-2 border border-line bg-white px-3 text-sm" href={`/changelog/${activeProject.slug}/rss.xml`} target="_blank"><Rss size={15} /> RSS</a></div>
          </header>

          {tab === "overview" && <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <Panel title="Release surface health" icon={Activity}><div className="grid gap-4 md:grid-cols-4"><Stat label="Published" value={String(published)} detail="Live on page and widget" /><Stat label="Widget impressions" value="8,421" detail="Mock last 30 days" /><Stat label="Subscribers" value="1,248" detail="All, weekly, monthly" /><Stat label="Adoption rate" value="38%" detail="CTA to feature used" /></div></Panel>
            <Panel title="Review queue" icon={Bot}><div className="grid gap-2"><Button onClick={() => generateAiDraft("GitHub")}><Sparkles size={15} /> Mock GitHub PR draft</Button><Button variant="secondary" onClick={() => generateAiDraft("Linear")}><Sparkles size={15} /> Mock Linear issue draft</Button><p className="text-xs text-neutral-500">AI never auto-publishes. Drafts land in the editor for review.</p></div></Panel>
            <Panel title="Recent entries" icon={FileText}><EntryTable entries={filteredEntries.slice(0, 5)} onEdit={(entry) => { setDraft(entry); setTab("editor"); }} /></Panel>
            <Panel title="Distribution checklist" icon={Check}><Checklist items={["Publish entry", "Target matching users", "Send instant email", "Queue weekly digest", "Generate social copy", "Post Slack/webhook", "Attach adoption tour"]} /></Panel>
          </div>}

          {tab === "entries" && <Panel title="Entries" icon={Search} action={<Button onClick={() => { setDraft(defaultDraft); setTab("editor"); }}><Plus size={15} /> New entry</Button>}><div className="mb-3 flex flex-col gap-2 md:flex-row"><TextInput placeholder="Search entries, status, categories" value={query} onChange={(event) => setQuery(event.target.value)} className="md:w-80" /><Select defaultValue="all"><option value="all">All statuses</option><option>draft</option><option>scheduled</option><option>published</option></Select></div><EntryTable entries={filteredEntries} onEdit={(entry) => { setDraft(entry); setTab("editor"); }} onPublish={(entry) => setEntries((current) => current.map((item) => item.id === entry.id ? { ...item, status: "published", publishedAt: new Date().toISOString() } : item))} /></Panel>}

          {tab === "editor" && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
            <Panel title="Entry editor" icon={Wand2} action={<div className="flex gap-2"><Button variant="secondary" onClick={() => saveDraft("scheduled")}><CalendarClock size={15} /> Schedule</Button><Button onClick={() => saveDraft("published")}><Send size={15} /> Publish</Button></div>}>
              <div className="grid gap-3 md:grid-cols-2"><Field label="Title"><TextInput value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value) })} /></Field><Field label="Slug"><TextInput value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></Field><Field label="Type"><Select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as Entry["type"] })}><option>feature</option><option>improvement</option><option>fix</option><option>security</option><option>announcement</option></Select></Field><Field label="Categories"><TextInput value={draft.categories.join(", ")} onChange={(event) => setDraft({ ...draft, categories: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></Field><Field label="CTA type"><Select value={draft.ctaType} onChange={(event) => setDraft({ ...draft, ctaType: event.target.value as Entry["ctaType"] })}><option>take_me_there</option><option>start_tour</option><option>watch_video</option><option>try_now</option></Select></Field><Field label="CTA URL"><TextInput value={draft.ctaUrl} onChange={(event) => setDraft({ ...draft, ctaUrl: event.target.value })} /></Field></div>
              <Field label="Summary"><textarea className="min-h-20 border border-line bg-white p-3 text-sm outline-none focus:border-pine" value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></Field>
              <Field label="Markdown content"><textarea className="min-h-72 border border-line bg-white p-3 font-mono text-sm outline-none focus:border-pine" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} /></Field>
              <div className="mt-3 flex gap-2"><Button variant="secondary" onClick={() => saveDraft("draft")}>Save draft</Button><Button variant="ghost" onClick={() => setDraft({ ...draft, targeting: pageTargeting })}><Split size={15} /> Apply targeting demo</Button></div>
            </Panel>
            <Panel title="Live preview" icon={Eye}><article className="prose prose-sm max-w-none"><h2>{draft.title || "Untitled changelog entry"}</h2><p>{draft.summary}</p><ReactMarkdown>{draft.content}</ReactMarkdown></article></Panel>
          </div>}

          {tab === "targeting" && <Panel title="Visual rule builder" icon={Split}><div className="grid gap-4 lg:grid-cols-2"><div className="grid gap-3"><RuleLine label="Page URL" value="contains /settings" /><RuleLine label="User attribute" value="role equals admin" /><RuleLine label="Segment" value="admins" /><RuleLine label="Recency" value="visited /settings at least 2 times in 7 days" /><div className="border border-line bg-white p-3 text-sm"><div className="font-medium">Frequency caps</div><label className="mt-2 flex gap-2 text-sm"><input type="checkbox" defaultChecked /> Max once per session</label><label className="mt-2 flex items-center gap-2 text-sm">Max per week <input className="h-8 w-16 border border-line px-2" defaultValue="2" /></label><p className="mt-2 text-xs text-neutral-500">Dismissed entries do not show again.</p></div></div><div className="border border-line bg-white p-4"><h3 className="font-semibold">Segment builder</h3><p className="mt-1 text-sm text-neutral-600">Create reusable audiences from plan, role, account traits, and page behavior.</p><div className="mt-3 grid gap-2 text-sm"><Badge tone="green">admins</Badge><Badge tone="blue">pro accounts</Badge><Badge tone="amber">visited billing this week</Badge></div></div></div></Panel>}

          {tab === "widget" && <Panel title="Widget setup" icon={Code2}><div className="grid gap-4 xl:grid-cols-[360px_1fr]"><div className="grid gap-3"><Field label="Mode"><Select value={activeProject.widgetSettings.mode} onChange={(event) => updateProject({ widgetSettings: { ...activeProject.widgetSettings, mode: event.target.value as WidgetMode } })}><option>bell</option><option>toast</option><option>modal</option><option>sidebar</option><option>banner</option></Select></Field><Field label="Launcher label"><TextInput value={activeProject.widgetSettings.launcherLabel ?? "Updates"} onChange={(event) => updateProject({ widgetSettings: { ...activeProject.widgetSettings, launcherLabel: event.target.value } })} /></Field><Field label="Brand color"><TextInput type="color" value={activeProject.brandColor} onChange={(event) => updateProject({ brandColor: event.target.value })} /></Field><div className="border border-line bg-white p-3"><div className="text-xs font-semibold text-neutral-500">Install snippet</div><pre className="mt-2 overflow-auto bg-ink p-3 text-xs text-paper"><code>{snippet}</code></pre></div></div><WidgetPreview mode={activeProject.widgetSettings.mode} /></div></Panel>}

          {tab === "analytics" && <Panel title="Widget analytics" icon={Activity}><div className="grid gap-4 md:grid-cols-5"><Stat label="Views" value="8,421" detail="view" /><Stat label="Opens" value="2,904" detail="open" /><Stat label="CTA clicks" value="812" detail="cta_click" /><Stat label="Dismissals" value="391" detail="dismiss" /><Stat label="Tours complete" value="226" detail="tour_complete" /></div><div className="mt-5 grid gap-2 text-sm"><Funnel label="Saw announcement" value="8,421" width="100%" /><Funnel label="Opened" value="2,904" width="72%" /><Funnel label="Clicked CTA" value="812" width="44%" /><Funnel label="Used feature" value="318" width="31%" /></div></Panel>}

          {tab === "email" && <Panel title="Email distribution" icon={Mail} action={<Button onClick={() => setEmailStatus("Mock send complete: instant email, weekly digest, and monthly edition queued with demo analytics.")}><Send size={15} /> Mock send</Button>}><div className="grid gap-4 lg:grid-cols-3"><EmailCard title="Instant on publish" stat="1,248 recipients" /><EmailCard title="Weekly digest" stat="Fridays 09:00" /><EmailCard title="Monthly edition" stat="AI intro ready" /></div><div className="mt-4 border border-line bg-white p-3 text-sm">{emailStatus}</div><div className="mt-4 grid gap-2 md:grid-cols-4"><Badge>all updates</Badge><Badge>weekly</Badge><Badge>monthly</Badge><Badge>categories only</Badge><Badge tone="red">unsubscribe</Badge></div></Panel>}

          {tab === "social" && <Panel title="Social and distribution" icon={Megaphone} action={<Button onClick={() => setSocialCopy("Shipped: targeted in-product announcements that connect release notes to adoption. Product teams can now announce, guide, and measure from one surface.")}><Sparkles size={15} /> Generate copy</Button>}><div className="grid gap-4 lg:grid-cols-[1fr_320px]"><textarea className="min-h-44 border border-line bg-white p-3 text-sm" value={socialCopy} onChange={(event) => setSocialCopy(event.target.value)} /><div className="grid gap-2"><Button variant="secondary"><Send size={15} /> Schedule X post</Button><Button variant="secondary"><Send size={15} /> Schedule LinkedIn post</Button><Button variant="secondary"><Webhook size={15} /> Send Slack/webhook mock</Button><div className="border border-line bg-white p-3 text-sm">OG image generation placeholder is wired for entry-level social previews.</div></div></div></Panel>}

          {tab === "integrations" && <Panel title="Integrations" icon={Webhook}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Integration name="GitHub App" status="mock connected" action={() => generateAiDraft("GitHub")} /><Integration name="Linear" status="mock connected" action={() => generateAiDraft("Linear")} /><Integration name="Resend" status="demo mode" /><Integration name="Slack webhook" status="demo mode" /><Integration name="X" status="key optional" /><Integration name="LinkedIn" status="pro gated" /><Integration name="Generic webhook" status="pro gated" /><Integration name="Anthropic" status="mock generation" /></div></Panel>}

          {tab === "adoption" && <Panel title="Adoption flows" icon={Route}><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><div className="grid gap-3"><TourStep n="1" selector="#billing-tab" title="Open billing settings" /><TourStep n="2" selector="[data-plan-card]" title="Compare plan usage" /><TourStep n="3" selector="#invite" title="Invite an admin" /><Button><MousePointerClick size={15} /> Save 3-step tour</Button></div><div className="border border-line bg-white p-4 text-sm"><h3 className="font-semibold">Follow-up rule</h3><p className="mt-1 text-neutral-600">Email users who saw the announcement but did not adopt after 72 hours.</p><div className="mt-3 grid gap-2"><Badge>saw announcement</Badge><Badge>opened</Badge><Badge>clicked CTA</Badge><Badge>started tour</Badge><Badge>completed tour</Badge><Badge tone="green">feature_used</Badge></div></div></div></Panel>}

          {tab === "settings" && <Panel title="Settings and BYOK" icon={KeyRound}><div className="grid gap-4 lg:grid-cols-2"><div className="grid gap-3"><Field label="Project name"><TextInput value={activeProject.name} onChange={(event) => updateProject({ name: event.target.value })} /></Field><Field label="Public slug"><TextInput value={activeProject.slug} onChange={(event) => updateProject({ slug: event.target.value })} /></Field><Field label="Tone"><textarea className="min-h-24 border border-line bg-white p-3 text-sm" value={activeProject.toneSettings.voice} onChange={(event) => updateProject({ toneSettings: { ...activeProject.toneSettings, voice: event.target.value } })} /></Field></div><div className="grid gap-2"><KeyBox provider="Anthropic" /><KeyBox provider="Resend" /><KeyBox provider="SES" /><KeyBox provider="GitHub" /><KeyBox provider="Linear" /></div></div></Panel>}

          {tab === "admin" && <Panel title="Internal admin controls" icon={ShieldCheck}><div className="grid gap-4 lg:grid-cols-[360px_1fr]"><div className="grid gap-3 border border-line bg-white p-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={org.isHosted} onChange={(event) => setOrg({ ...org, isHosted: event.target.checked })} /> Hosted org</label><Field label="Plan"><Select value={org.plan} onChange={(event) => setOrg({ ...org, plan: event.target.value as Org["plan"] })}><option>free</option><option>starter</option><option>pro</option></Select></Field><div className="text-xs text-neutral-500">Manual invoicing only. No Stripe code is present.</div></div><div className="grid gap-3 md:grid-cols-3"><AdminLimit label="Projects" value={String(limits.projects)} /><AdminLimit label="AI generations" value={String(limits.aiGenerationsPerMonth)} /><AdminLimit label="Subscribers" value={String(limits.subscribers)} /><AdminLimit label="Full targeting" value={String(limits.fullTargeting)} /><AdminLimit label="Adoption flows" value={String(limits.adoptionFlows)} /><AdminLimit label="Custom domain" value={String(limits.customDomain)} /></div></div></Panel>}
        </section>
      </div>
    </main>
  );
}

function EntryTable({ entries, onEdit, onPublish }: { entries: Entry[]; onEdit: (entry: Entry) => void; onPublish?: (entry: Entry) => void }) {
  return <div className="overflow-auto"><table className="w-full min-w-[760px] border-collapse text-sm"><thead><tr className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-neutral-500"><th className="py-2 pr-3">Entry</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Categories</th><th className="py-2 pr-3">CTA</th><th className="py-2 text-right">Actions</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-line/70"><td className="py-3 pr-3"><div className="font-medium">{entry.title}</div><div className="text-xs text-neutral-500">/{entry.slug}</div></td><td className="py-3 pr-3">{entry.type}</td><td className="py-3 pr-3"><Badge tone={entry.status === "published" ? "green" : entry.status === "scheduled" ? "amber" : "neutral"}>{entry.status}</Badge></td><td className="py-3 pr-3"><div className="flex flex-wrap gap-1">{entry.categories.map((category) => <Badge key={category}>{category}</Badge>)}</div></td><td className="py-3 pr-3">{entry.ctaLabel}</td><td className="py-3 text-right"><Button variant="ghost" onClick={() => onEdit(entry)}>Edit</Button>{onPublish && entry.status !== "published" ? <Button variant="secondary" onClick={() => onPublish(entry)}>Publish</Button> : null}</td></tr>)}</tbody></table></div>;
}

function Checklist({ items }: { items: string[] }) { return <div className="grid gap-2">{items.map((item, index) => <div key={item} className="flex items-center gap-2 text-sm"><span className={cn("grid size-5 place-items-center border", index < 3 ? "border-pine bg-pine text-white" : "border-line bg-white")}><Check size={12} /></span>{item}</div>)}</div>; }
function RuleLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 border border-line bg-white p-3 text-sm"><span className="font-medium">{label}</span><span className="text-neutral-600">{value}</span></div>; }
function Funnel({ label, value, width }: { label: string; value: string; width: string }) { return <div><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{value}</span></div><div className="h-8 bg-white"><div className="h-full bg-pine/85" style={{ width }} /></div></div>; }
function EmailCard({ title, stat }: { title: string; stat: string }) { return <div className="border border-line bg-white p-4"><div className="font-medium">{title}</div><div className="mt-2 text-2xl font-semibold">{stat}</div><div className="mt-2 text-xs text-neutral-500">Category preferences and unsubscribe respected.</div></div>; }
function Integration({ name, status, action }: { name: string; status: string; action?: () => void }) { return <div className="border border-line bg-white p-4"><div className="font-semibold">{name}</div><div className="mt-2"><Badge tone="blue">{status}</Badge></div>{action ? <Button className="mt-3" variant="secondary" onClick={action}>Generate draft</Button> : null}</div>; }
function TourStep({ n, selector, title }: { n: string; selector: string; title: string }) { return <div className="grid grid-cols-[32px_1fr] gap-3 border border-line bg-white p-3"><div className="grid size-8 place-items-center bg-ink text-paper text-sm font-semibold">{n}</div><div><TextInput defaultValue={selector} /><TextInput className="mt-2" defaultValue={title} /><textarea className="mt-2 min-h-16 w-full border border-line p-2 text-sm" defaultValue="Short tooltip body for this step." /></div></div>; }
function KeyBox({ provider }: { provider: string }) { return <div className="flex items-center justify-between gap-3 border border-line bg-white p-3"><div><div className="font-medium">{provider}</div><div className="text-xs text-neutral-500">BYOK encrypted config</div></div><TextInput placeholder="sk-..." className="w-36" /></div>; }
function AdminLimit({ label, value }: { label: string; value: string }) { return <div className="border border-line bg-white p-4"><div className="text-xs font-medium text-neutral-500">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>; }
function WidgetPreview({ mode }: { mode: WidgetMode }) { return <div className="relative min-h-[420px] overflow-hidden border border-line bg-[#ebe8df] p-5"><div className="mb-4 flex gap-2"><span className="h-2 w-16 bg-neutral-300" /><span className="h-2 w-12 bg-neutral-300" /></div><div className="grid gap-2">{["Billing", "Usage", "Team"].map((item) => <div key={item} className="h-12 border border-line bg-white px-3 py-2 text-sm">{item}</div>)}</div><div className={cn("absolute border border-ink bg-[#fffdf8] shadow-quiet", mode === "banner" && "inset-x-5 top-5 p-3", mode === "sidebar" && "bottom-0 right-0 top-0 w-72 p-4", mode === "modal" && "left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 p-4", mode === "toast" && "bottom-5 right-5 w-72 p-4", mode === "bell" && "bottom-5 right-5 size-14 rounded-full grid place-items-center")}>{mode === "bell" ? <Bell /> : <div><div className="text-sm font-semibold">New: adoption funnels</div><p className="mt-1 text-xs text-neutral-600">Targeted update preview with CTA and unread state.</p><Button className="mt-3"><MousePointerClick size={14} /> Take me there</Button></div>}</div></div>; }
