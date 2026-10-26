---
type: llm
focus: trace
---

PASS if Claude uses the `nav:breadcrumbs` tag in Antlers, includes the breadcrumbs so every page shows them (layout or a partial included from the layout, possibly skipped on the home page), renders the current page as text rather than a link (e.g. via `last` or `is_current`), and wraps them in a `<nav>` with an accessible label.
FAIL if it builds crumbs by hand from segments, adds them to a single template only, or links the current page.
