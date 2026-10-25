---
type: llm
focus: { source: file, path: resources/blueprints/collections/pages/page.yaml }
---

This is a multisite project (en + nl). In the page blueprint, the translatable text fields carry `localizable: true`; the hero image does not.
PASS if a `subtitle` field (text) was added with `localizable: true`, and all existing fields are unchanged (including their `localizable` settings).
FAIL if `subtitle` is missing, lacks `localizable: true`, or an existing field changed.
