---
type: llm
---

PASS if the report does not claim that the honeypot input is missing (it is written as `name="{{ honeypot }}"`) and does not claim a CSRF token is missing (the form tag adds it).
FAIL if it reports either as missing.
