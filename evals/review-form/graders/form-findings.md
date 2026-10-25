---
type: llm
---

PASS if the reply reports that `quote-form.antlers.html`, compared with the site's contact form, is missing: (a) labels linked to the inputs (it only uses placeholders), (b) per-field error messages, (c) old input on validation failure, and (d) the honeypot field (`winnie`) configured in `resources/forms/quote.yaml`.
FAIL if two or more of these are missing from the report.