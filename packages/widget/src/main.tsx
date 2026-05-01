import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import type { Entry, WidgetMode } from "@shiplog/shared";
import { evaluateTargeting, widgetEventSchema } from "@shiplog/shared";

type Identity = { id?: string; email?: string; plan?: string; role?: string; traits?: Record<string, unknown> };
type Config = { project: { id: string; widgetSettings: { mode: WidgetMode; launcherLabel?: string }; brandColor: string }; entries: Entry[] };

const script = document.currentScript as HTMLScriptElement | null;
const projectId = script?.dataset.projectId ?? "demo-project";
const mode = (script?.dataset.mode as WidgetMode | undefined) ?? "bell";
const baseUrl = script?.src ? new URL(script.src).origin : window.location.origin;
const storageKey = "shiplog:" + projectId;
const readState = () => JSON.parse(localStorage.getItem(storageKey) ?? "{}") as { visitorId?: string; identity?: Identity; dismissed?: string[]; lastSeen?: string; pageVisits?: Record<string, string[]> };
const writeState = (state: ReturnType<typeof readState>) => localStorage.setItem(storageKey, JSON.stringify(state));

let state = readState();
state.visitorId ||= "vis_" + Math.random().toString(36).slice(2);
state.dismissed ||= [];
state.pageVisits ||= {};
state.pageVisits[location.pathname] ||= [];
state.pageVisits[location.pathname].push(new Date().toISOString());
writeState(state);

function post(event: string, entry?: Pick<Entry, "id">, payload: Record<string, unknown> = {}) {
  const parsed = widgetEventSchema.safeParse({ event, projectId, entryId: entry?.id, visitorId: state.visitorId, userId: state.identity?.id, pageUrl: location.href, payload });
  if (!parsed.success) return;
  fetch(baseUrl + "/api/widget/" + projectId + "/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) }).catch(() => undefined);
}

function Widget({ config }: { config: Config }) {
  const [open, setOpen] = useState(mode !== "bell");
  const entries = useMemo(() => config.entries.filter((entry) => !state.dismissed?.includes(entry.id) && evaluateTargeting(entry.targeting, { pageUrl: location.href, path: location.pathname, user: state.identity, segments: { admins: state.identity?.role === "admin" }, pageVisits: state.pageVisits })), [config.entries]);
  const unread = entries.filter((entry) => !state.lastSeen || new Date(entry.publishedAt ?? entry.createdAt) > new Date(state.lastSeen)).length;
  const show = () => { state.lastSeen = new Date().toISOString(); writeState(state); setOpen(true); post("open", entries[0], { count: entries.length }); };
  const dismiss = (entry: Entry) => { state.dismissed = [...(state.dismissed ?? []), entry.id]; writeState(state); post("dismiss", entry); };
  if (!open) return <button class="shiplog-bell" onClick={show}>{config.project.widgetSettings.launcherLabel ?? "Updates"}{unread ? <span>{unread}</span> : null}</button>;
  return <section class={"shiplog-panel shiplog-" + mode}><header><strong>Product updates</strong><button onClick={() => setOpen(false)}>Close</button></header>{entries.map((entry) => <article key={entry.id}><h3>{entry.title}</h3><p>{entry.summary}</p><button onClick={() => { post("cta_click", entry, { ctaType: entry.ctaType }); if (entry.ctaUrl) location.assign(entry.ctaUrl); }}>{entry.ctaLabel ?? "Take me there"}</button><button onClick={() => dismiss(entry)}>Dismiss</button></article>)}</section>;
}

function mount(config: Config) {
  const style = document.createElement("style");
  style.textContent = ".shiplog-bell{position:fixed;right:22px;bottom:22px;z-index:2147483000;border:0;background:#171717;color:#fff;padding:12px 14px;border-radius:999px;box-shadow:0 12px 36px #0003}.shiplog-bell span{margin-left:8px;background:#b65f45;border-radius:999px;padding:2px 6px}.shiplog-panel{position:fixed;z-index:2147483000;background:#fffdf8;border:1px solid #171717;box-shadow:0 16px 48px #0002;padding:16px;max-width:380px;font-family:ui-sans-serif,system-ui;color:#171717}.shiplog-panel header{display:flex;justify-content:space-between;gap:12px}.shiplog-panel article{border-top:1px solid #dedbd1;margin-top:12px;padding-top:12px}.shiplog-panel h3{font-size:15px;margin:0 0 6px}.shiplog-panel p{font-size:13px;color:#555}.shiplog-panel button{margin-right:8px}.shiplog-toast,.shiplog-bell{right:22px;bottom:22px}.shiplog-banner{left:18px;right:18px;top:18px;max-width:none}.shiplog-modal{left:50%;top:50%;transform:translate(-50%,-50%)}.shiplog-sidebar{right:0;top:0;bottom:0;width:min(380px,calc(100vw - 28px));overflow:auto}";
  document.head.append(style);
  const root = document.createElement("div");
  document.body.append(root);
  config.entries.forEach((entry) => post("view", entry, { mode }));
  render(<Widget config={config} />, root);
}

declare global { interface Window { shiplog?: { identify: (identity: Identity) => void; track: (event: string, payload?: Record<string, unknown>) => void } } }
window.shiplog = { identify: (identity) => { state = { ...readState(), identity: { ...(state.identity ?? {}), ...identity } }; writeState(state); }, track: (event, payload = {}) => post(event || "feature_used", { id: String(payload.entryId ?? "") }, payload) };
fetch(baseUrl + "/api/widget/" + projectId + "/config").then((res) => res.json()).then(mount).catch(() => undefined);
