import type { Entry } from "@shiplog/shared";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]!));

export function rss(projectSlug: string, entries: Entry[], baseUrl: string) {
  return `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Shiplog changelog</title><link>${baseUrl}/changelog/${projectSlug}</link><description>Product updates</description>${entries.map((entry) => `<item><title>${escapeXml(entry.title)}</title><link>${baseUrl}/changelog/${projectSlug}#${entry.slug}</link><guid>${entry.id}</guid><pubDate>${new Date(entry.publishedAt ?? entry.createdAt).toUTCString()}</pubDate><description>${escapeXml(entry.summary)}</description></item>`).join("")}</channel></rss>`;
}

export function atom(projectSlug: string, entries: Entry[], baseUrl: string) {
  return `<?xml version="1.0" encoding="UTF-8" ?><feed xmlns="http://www.w3.org/2005/Atom"><title>Shiplog changelog</title><id>${baseUrl}/changelog/${projectSlug}</id><updated>${new Date().toISOString()}</updated>${entries.map((entry) => `<entry><title>${escapeXml(entry.title)}</title><id>${entry.id}</id><link href="${baseUrl}/changelog/${projectSlug}#${entry.slug}" /><updated>${new Date(entry.publishedAt ?? entry.createdAt).toISOString()}</updated><summary>${escapeXml(entry.summary)}</summary></entry>`).join("")}</feed>`;
}
