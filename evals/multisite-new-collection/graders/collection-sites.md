---
type: llm
focus: trace
---

This is a multisite project with sites `en` and `nl` (`resources/sites.yaml`, `multisite => true`). The existing `pages` collection lists `sites: [en, nl]`.
Judge the new news collection.
PASS if all hold: a collection config `content/collections/<handle>.yaml` that lists both `en` and `nl` under `sites:`; a blueprint `resources/blueprints/collections/<same handle>/<blueprint>.yaml` where the translatable text fields (title, body) have `localizable: true`; the publish date is a `date` field (or the collection is dated); the YAML is valid.
FAIL if `sites:` is missing or lists only one site (the collection would exist in the default site only), the text fields are not localizable, or handles don't match.
