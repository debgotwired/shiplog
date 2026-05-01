# Widget API

## Install

```html
<script src="https://your-domain/widget/shiplog.js" data-project-id="PROJECT_ID" data-mode="bell" async></script>
```

Modes: `bell`, `toast`, `modal`, `sidebar`, `banner`.

## Identify

```js
window.shiplog.identify({
  id: "user_123",
  email: "ada@example.com",
  plan: "pro",
  role: "admin",
  traits: { accountId: "acme", beta: true }
});
```

## Track

```js
window.shiplog.track("feature_used", { entryId: "entry_1", feature: "rules" });
```

The widget posts validated events to `/api/widget/[projectId]/events`: `view`, `open`, `dismiss`, `click`, `cta_click`, `subscribe`, `tour_start`, `tour_complete`, and `feature_used`.
