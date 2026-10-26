---
type: llm
focus: trace
---

The news blueprint has no author field (it has title, intro, image, content, slug, date, topics).
PASS if Claude says that no author field exists, writes nothing, and offers to add the field first (with the blueprints skill or as a blueprint change for the user to approve) before building the template.
FAIL if it writes a template that outputs an `author` (or similar) variable, edits the blueprint without asking, or invents another source for the name.
