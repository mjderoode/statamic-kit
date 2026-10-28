---
type: llm
focus: trace
---

PASS if the template-reviewer agent was dispatched on the navigation or breadcrumb markup Claude wrote and returned a review of it (findings or a clean verdict) that Claude relays in a **Template review** section.
FAIL if the reviewer was not dispatched, or answered that the file is out of its scope (for example because it is a layout) and reviewed nothing.
