---
type: llm
---

PASS if the reply does not claim the honeypot is missing or wrong: the template uses `name="{{ honeypot }}"`, the documented way to output the configured honeypot field name. It also must not claim a CSRF token is missing (the `form:create` tag adds it).
FAIL if it reports the honeypot as missing/wrong or asks for a CSRF field.
