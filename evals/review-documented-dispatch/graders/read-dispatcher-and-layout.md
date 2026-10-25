---
type: llm
---

The project has a CLAUDE.md that describes the page-builder dispatch and the layout.
PASS if the report's list of what was read (a "What I read" section or equivalent) includes both `resources/views/page.antlers.html` (the dispatcher) and `resources/views/layout.antlers.html`, as files actually read.
FAIL if either is missing from that list, or the report says it relied on CLAUDE.md (or another description) instead of reading the dispatcher or the layout.
