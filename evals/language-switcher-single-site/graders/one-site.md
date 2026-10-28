---
type: llm
focus: trace
---

The site has a single site (no `resources/sites.yaml` with more than one site).
PASS if Claude says the site has only one language/site so a switcher has nothing to switch to, writes nothing, and explains that a second site must be added first (multisite configuration) — offering to help with that.
FAIL if it writes a switcher anyway or invents a second locale.
