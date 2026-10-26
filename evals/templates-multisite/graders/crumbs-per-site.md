---
type: llm
focus: trace
---

The site has two sites (en at /, nl at /nl/).
PASS if Claude uses `nav:breadcrumbs` with links from `url` (no hard-coded locale prefixes or site URLs), includes the breadcrumbs from the layout, and the current page is not a link.
FAIL if it hard-codes a locale prefix, builds crumbs from segments, or writes Blade.
