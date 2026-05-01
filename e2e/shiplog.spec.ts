import { expect, test } from "@playwright/test";

const modes = ["bell", "toast", "modal", "sidebar", "banner"] as const;

test("dashboard supports entry creation, publishing, search, live preview, and public/widget sync", async ({ page, request }) => {
  const title = "QA release note " + Date.now();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Changelog operations console" })).toBeVisible();

  await page.getByRole("button", { name: /Entries/ }).click();
  await expect(page.getByText("Adoption funnels now connect announcements")).toBeVisible();
  await page.getByPlaceholder("Search entries, status, categories").fill("targeting");
  await expect(page.getByText("Visual targeting rules for page")).toBeVisible();

  await page.getByRole("button", { name: /New entry/ }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Summary").fill("A full browser pass created this draft and verified editor persistence.");
  await page.getByLabel("Markdown content").fill("## QA result\n\nThe editor, preview, draft save, and publish controls work.");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText(title)).toBeVisible();
  const qaRow = page.getByRole("row").filter({ hasText: title });
  await qaRow.getByRole("button", { name: "Publish" }).click();
  await expect(qaRow.getByText("published")).toBeVisible();

  await page.goto("/changelog/acme-cloud");
  await expect(page.getByText(title)).toBeVisible();
  const bootstrap = await request.get("/api/bootstrap");
  const bootstrapData = await bootstrap.json();
  const projectId = bootstrapData.projects.find((project: { slug: string }) => project.slug === "acme-cloud").id;
  const config = await request.get(`/api/widget/${projectId}/config`);
  const data = await config.json();
  expect(JSON.stringify(data.entries)).toContain(title);
});

test("dashboard exercises targeting, widget customization, email, social, integrations, admin, and adoption tabs", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Targeting/ }).click();
  await expect(page.getByText("visited /settings at least 2 times in 7 days")).toBeVisible();
  await expect(page.getByText("Dismissed entries do not show again.")).toBeVisible();

  await page.getByRole("button", { name: /Widget/ }).click();
  await page.getByLabel("Mode").selectOption("sidebar");
  await expect(page.locator("pre")).toContainText('data-mode="sidebar"');
  await expect(page.getByText("New: adoption funnels")).toBeVisible();

  await page.getByRole("button", { name: /Email/ }).click();
  await page.getByRole("button", { name: /Mock send/ }).click();
  await expect(page.getByText("Mock send complete")).toBeVisible();

  await page.getByRole("button", { name: /Social/ }).click();
  await page.getByRole("button", { name: /Generate copy/ }).click();
  await expect(page.locator("textarea")).toHaveValue(/Shipped: targeted in-product announcements/);

  await page.getByRole("button", { name: /Integrations/ }).click();
  await page.getByRole("button", { name: "Generate draft" }).first().click();
  await expect(page.getByText("Entry editor")).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue(/GitHub generated draft/);

  await page.getByRole("button", { name: /Adoption/ }).click();
  await expect(page.getByText("Save 3-step tour")).toBeVisible();
  await expect(page.getByText("feature_used")).toBeVisible();

  await page.getByRole("button", { name: /Admin/ }).click();
  await page.getByLabel("Plan").selectOption("starter");
  await expect(page.getByText("Manual invoicing only. No Stripe code is present.")).toBeVisible();
  await expect(page.getByText("Full targeting")).toBeVisible();
});

test("public changelog supports search, category filtering, feeds, sitemap, and widget script", async ({ page, request }) => {
  await page.goto("/changelog/acme-cloud");
  await expect(page.getByRole("heading", { name: /What shipped/ })).toBeVisible();
  await expect(page.getByText("Adoption funnels now connect announcements")).toBeVisible();
  await page.getByPlaceholder("Search updates").fill("targeting");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Visual targeting rules for page")).toBeVisible();

  await page.goto("/changelog/acme-cloud?category=Targeting");
  await expect(page.getByText("Visual targeting rules for page")).toBeVisible();
  await expect(page.getByText("Adoption funnels now connect announcements")).toHaveCount(0);

  const rss = await request.get("/changelog/acme-cloud/rss.xml");
  expect(rss.ok()).toBeTruthy();
  expect(await rss.text()).toContain("<rss");

  const atom = await request.get("/changelog/acme-cloud/atom.xml");
  expect(atom.ok()).toBeTruthy();
  expect(await atom.text()).toContain("<feed");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/changelog/acme-cloud");

  const widget = await request.get("/widget/shiplog.js");
  expect(widget.ok()).toBeTruthy();
  expect(widget.headers()["content-type"]).toContain("text/javascript");
  expect(await widget.text()).toContain("window.shiplog.identify");
});

test("widget config and event APIs validate happy and unhappy paths", async ({ request }) => {
  const config = await request.get("/api/widget/demo-project/config");
  expect(config.ok()).toBeTruthy();
  const json = await config.json();
  expect(json.entries.length).toBeGreaterThan(0);
  expect(json.project.id).toBe("demo-project");

  const valid = await request.post("/api/widget/demo-project/events", { data: { event: "cta_click", visitorId: "vis_e2e", pageUrl: "https://example.com", payload: { mode: "bell" } } });
  expect(valid.ok()).toBeTruthy();

  const invalid = await request.post("/api/widget/demo-project/events", { data: { event: "unknown", visitorId: "vis_e2e" } });
  expect(invalid.status()).toBe(400);

  const missingVisitor = await request.post("/api/widget/demo-project/events", { data: { event: "open", pageUrl: "https://example.com" } });
  expect(missingVisitor.status()).toBe(400);

  const badUrl = await request.post("/api/widget/demo-project/events", { data: { event: "open", visitorId: "vis_e2e", pageUrl: "not-a-url" } });
  expect(badUrl.status()).toBe(400);
});

test("provider mock endpoints cover GitHub, Linear, AI, email, social, and distribution", async ({ request }) => {
  const github = await request.post("/api/integrations/github", { data: { pull_request: { title: "Merge adoption flow" } } });
  expect((await github.json()).draft.title).toContain("Merge adoption flow");

  const linear = await request.post("/api/integrations/linear", { data: { data: { title: "Finish targeting builder" } } });
  expect((await linear.json()).draft.title).toContain("Finish targeting builder");

  for (const route of ["/api/ai/draft", "/api/email/send", "/api/social/generate", "/api/distribution/post"]) {
    const response = await request.post(route, { data: { entryId: "entry_rules" } });
    expect(response.ok(), route).toBeTruthy();
    expect((await response.json()).ok).toBe(true);
  }
});

for (const mode of modes) {
  test(`widget renders ${mode} mode and exposes identify/track`, async ({ page }) => {
    await page.goto(`/demo-widget?mode=${mode}`);
    if (mode === "bell") {
      await page.locator(".sl-bell").click();
    }
    await expect(page.getByText("Product updates")).toBeVisible();
    await page.evaluate(() => {
      (window as any).shiplog?.identify({ id: "u_e2e", email: "qa@example.com", plan: "pro", role: "admin", traits: { accountId: "acme" } });
      (window as any).shiplog?.track("feature_used", { entryId: "entry_rules", feature: "targeting" });
    });
    await expect(page.locator("body")).toContainText("Visual targeting rules");
  });
}

test("widget bell supports unread reset, dismiss persistence, and CTA navigation", async ({ page }) => {
  await page.goto("/demo-widget?mode=bell");
  await expect(page.locator(".sl-badge")).toBeVisible();
  await page.locator(".sl-bell").click();
  await expect(page.getByText("Product updates")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.locator(".sl-badge")).toHaveCount(0);

  await page.locator(".sl-bell").click();
  const targetingArticle = page.locator("article").filter({ hasText: "Visual targeting rules" });
  await targetingArticle.getByRole("button", { name: "Dismiss" }).click();
  await page.reload();
  await page.locator(".sl-bell").click();
  await expect(page.locator("article").filter({ hasText: "Visual targeting rules" })).toHaveCount(0);

  await page.goto("/demo-widget?mode=bell");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator(".sl-bell").click();
  await page.locator("article").filter({ hasText: "Visual targeting rules" }).getByRole("button", { name: "Open rule builder" }).click();
  await expect(page).toHaveURL(/\/targeting$/);
});

test("mobile dashboard, public changelog, and widget avoid horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ["/", "/changelog/acme-cloud", "/demo-widget?mode=sidebar"]) {
    await page.goto(url);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, url).toBeLessThanOrEqual(2);
  }
  await expect(page.getByText("Product updates")).toBeVisible();
});
