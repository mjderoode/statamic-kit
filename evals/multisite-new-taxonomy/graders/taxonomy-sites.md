---
type: llm
focus: trace
---

This is a multisite project with sites `en` and `nl` (`resources/sites.yaml`, `multisite => true`); the `pages` collection lists `sites: [en, nl]`. No taxonomy exists yet.
Judge the new topics taxonomy.
PASS if all hold: config `content/taxonomies/<handle>.yaml` with a `title` and `sites:` listing both `en` and `nl`; the `pages` collection config gains `taxonomies: [<handle>]` and keeps its `sites`, `propagate` and `structure`; any term blueprint Claude created (under `resources/blueprints/taxonomies/<handle>/`) has its title field `localizable: true`; the YAML is valid.
FAIL if the taxonomy has no `sites:` or only one site (topics would exist only in the default site), the collection is not linked, or the collection config lost keys.
