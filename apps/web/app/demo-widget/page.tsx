import { demoProject } from "@/lib/demo-data";

const modes = ["bell", "toast", "modal", "sidebar", "banner"];

export default async function WidgetDemo({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode = "bell" } = await searchParams;
  return (
    <main className="min-h-screen bg-[#f8f7f2] p-5 text-ink">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 border border-line bg-[#fffdf8] p-5 shadow-quiet">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Widget demo</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Install and test every Shiplog surface mode</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">Use the mode links below, then call window.shiplog.identify with role admin in the console to test attribute targeting.</p>
        </header>
        <div className="mb-5 flex flex-wrap gap-2">{modes.map((mode) => <a key={mode} className="border border-line bg-white px-3 py-2 text-sm" href={`/demo-widget?mode=${mode}`}>{mode}</a>)}</div>
        <section className="grid gap-3 border border-line bg-white p-5">
          <div id="billing-tab" className="border border-line p-4">Billing settings target</div>
          <div data-plan-card className="border border-line p-4">Plan usage target</div>
          <button id="invite" className="w-fit bg-ink px-4 py-2 text-paper">Invite admin</button>
        </section>
        <script src="/widget/shiplog.js" data-project-id={demoProject.id} data-mode={mode} async />
      </div>
    </main>
  );
}
