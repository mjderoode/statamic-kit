---
type: llm
focus: trace
---

This is a multisite project with sites `en` and `nl`. The existing `contact` global set has `sites: { en: null, nl: en }` in `content/globals/contact.yaml`, values per site in `content/globals/en/` and `content/globals/nl/`, and its translatable field has `localizable: true`.
Judge the new footer global set.
PASS if all hold: config `content/globals/<handle>.yaml` with a `title` and a `sites:` map covering both `en` and `nl` (nl with origin en, like contact); blueprint `resources/blueprints/globals/<same handle>.yaml` with a copyright text field that has `localizable: true`; if values files were created, they are under `content/globals/<site>/<handle>.yaml`; the contact global set is untouched.
FAIL if `sites:` is missing or only covers one site, the copyright field is not localizable, handles differ, or contact changed.
