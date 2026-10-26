---
type: llm
focus: trace
---

The site has two sites (en at /, nl at /nl/) in `resources/sites.yaml`.
PASS if Claude uses the `locales` tag in Antlers in the layout's header (or a partial included there), links to each site's version of the current page via `permalink`/`url`, marks the current one (`is_current`, `aria-current`), handles a page that is not localized (`exists` or `all` falling back to the site home), uses `locale:name`/`locale:short` for labels, and hard-codes no locale or URL.
FAIL if links are hard-coded, it uses Blade, or it ignores untranslated pages.
