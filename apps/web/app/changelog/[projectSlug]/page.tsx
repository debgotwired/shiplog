import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { demoProject, getPublicEntries } from "@/lib/demo-data";

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string }> }): Promise<Metadata> {
  const { projectSlug } = await params;
  return { title: `${demoProject.name} changelog`, description: "Product updates, improvements, and releases.", alternates: { canonical: `/changelog/${projectSlug}` } };
}

export default async function PublicChangelog({ params, searchParams }: { params: Promise<{ projectSlug: string }>; searchParams: Promise<{ q?: string; category?: string }> }) {
  await params;
  const sp = await searchParams;
  const entries = getPublicEntries().filter((entry) => {
    const text = [entry.title, entry.summary, entry.content, entry.categories.join(" ")].join(" ").toLowerCase();
    return (!sp.q || text.includes(sp.q.toLowerCase())) && (!sp.category || entry.categories.includes(sp.category));
  });
  const categories = [...new Set(getPublicEntries().flatMap((entry) => entry.categories))];

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-ink">
      <section className="border-b border-line bg-[#fffdf8]">
        <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
          <div className="mb-5 inline-flex items-center gap-2 border border-line bg-white px-3 py-1 text-xs font-medium">{demoProject.name} updates</div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">What shipped, who it helps, and where to try it.</h1>
          <p className="mt-5 max-w-2xl text-lg text-neutral-600">A premium public changelog with RSS, Atom, search, category filtering, subscribe hooks, and widget-ready entry metadata.</p>
          <form className="mt-8 flex flex-col gap-2 md:flex-row">
            <input name="q" placeholder="Search updates" defaultValue={sp.q} className="h-11 flex-1 border border-line bg-white px-3 outline-none focus:border-pine" />
            <select name="category" defaultValue={sp.category ?? ""} className="h-11 border border-line bg-white px-3 outline-none focus:border-pine"><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <button className="h-11 bg-ink px-5 font-medium text-paper">Search</button>
          </form>
          <div className="mt-4 flex gap-3 text-sm"><a href={`/changelog/${demoProject.slug}/rss.xml`} className="underline">RSS</a><a href={`/changelog/${demoProject.slug}/atom.xml`} className="underline">Atom</a></div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-5 px-5 py-8">
        {entries.map((entry) => <article key={entry.id} className="border border-line bg-[#fffdf8] p-5 shadow-quiet">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500"><span>{entry.type}</span><span>•</span><time>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString() : "Scheduled"}</time>{entry.categories.map((category) => <span key={category} className="border border-line bg-white px-2 py-0.5">{category}</span>)}</div>
          <h2 className="text-2xl font-semibold tracking-tight">{entry.title}</h2>
          <p className="mt-2 text-neutral-600">{entry.summary}</p>
          <div className="prose prose-sm mt-5 max-w-none"><ReactMarkdown>{entry.content}</ReactMarkdown></div>
          {entry.ctaUrl ? <a className="mt-5 inline-flex h-10 items-center bg-ink px-4 text-sm font-medium text-paper" href={entry.ctaUrl}>{entry.ctaLabel ?? "Take me there"}</a> : null}
        </article>)}
      </section>
      <section className="border-t border-line bg-[#fffdf8]"><div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between"><div><h2 className="font-semibold">Subscribe to updates</h2><p className="text-sm text-neutral-600">Preference center supports all, weekly, monthly, category-only, and unsubscribe.</p></div><form className="flex gap-2"><input type="email" placeholder="you@company.com" className="h-10 border border-line bg-white px-3" /><button className="h-10 bg-pine px-4 text-sm font-medium text-white">Subscribe</button></form></div></section>
    </main>
  );
}
