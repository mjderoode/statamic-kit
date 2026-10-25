---
type: llm
focus: { source: file, path: resources/views/layout.antlers.html }
---

PASS if the `{{ nav:main }}` loop now sets `target="_blank"` (ideally with `rel="noopener"`) on the link only when the new toggle field is on, using the toggle's handle from the navigation blueprint, and the rest of the layout is unchanged.
FAIL if the template is unchanged, always opens links in a new tab, or uses a variable that is not the new field's handle.
