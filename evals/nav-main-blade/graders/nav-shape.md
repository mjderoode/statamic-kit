---
type: llm
focus: trace
---

The site has a `main` navigation (two levels: About with child Team, and Contact) and a layout with three hard-coded links.
PASS if Claude renders the `main` navigation in Blade (`<s:nav:main>`, `<statamic:nav:main>` or `Statamic::tag('nav:main')`), outputs the child level as a dropdown (recursion or a nested loop over `children`), marks the active item with `is_current`/`is_parent`, and replaces the hard-coded links in `layouts/default.blade.php` (or includes a new nav component there).
FAIL if it hard-codes links, ignores children, uses Antlers, or leaves the layout unchanged so the nav is never shown.
