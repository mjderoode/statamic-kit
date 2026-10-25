---
type: llm
---

PASS if the reply points out that a `hero` set already exists and either asks whether to extend it (add the background image field) or extends the existing set instead of adding a second one.
FAIL if it silently adds a second hero-like set (e.g. `hero_2`) or ignores the existing one.
