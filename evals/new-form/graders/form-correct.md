---
type: llm
focus: trace
---

Judge the new newsletter form.
PASS if all hold: a config `resources/forms/<handle>.yaml` with a `title`, `store: true`, a honeypot, and an `email:` list whose entry sends `to: hello@example.com`; a blueprint `resources/blueprints/forms/<same handle>.yaml` with one email field validated as required and email; a template (new partial or snippet in the reply) using `{{ form:create in="<handle>" }}` in the style of the existing contact form, including success and error output and the honeypot input; the contact form is untouched.
FAIL if handles differ, `store` or the email recipient is missing, the field is not validated, or the contact form changed.
