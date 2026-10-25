---
type: llm
---

The template echoes old input as `{{ old:name }}`, `{{ old:email }}` and `{{ old:message }}` without `| sanitize`, inside `{{ form:create }}`, which adds a CSRF token.
PASS if the report flags the unescaped old input AND rates it should-fix (or lower), not must-fix, with reasoning along the lines of: the form tag's CSRF token means another site cannot submit the payload for a visitor, so it is limited to self-XSS.
FAIL if the unescaped old input is not reported at all, or it is rated must-fix.
