---
type: llm
---

PASS if the verdict is that the template is clean, or it only offers optional suggestions — no must-fix and no should-fix findings.
An optional suggestion (for example wrapping the `<ul>` in `{{ if people }}` so an empty list renders nothing) is fine and does not fail this check.
FAIL if it reports any must-fix or should-fix finding, in particular one claiming the `{{ people }}` loop needs a null check to avoid an error (Antlers renders nothing for a missing or empty value).