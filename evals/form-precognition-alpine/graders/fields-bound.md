---
type: llm
focus: { source: file, path: resources/views/partials/contact-form.antlers.html }
---

Judge the file as it is now, not whether it was tested in a browser.
PASS if each of the name, email and message inputs is bound with `x-model="form.<handle>"`, validates itself when the visitor leaves it (`@change` or `@blur` calling `form.validate('<handle>')`), and shows its error from the Precognition form object (`form.errors.<handle>` / `form.invalid('<handle>')`); the labels, honeypot input and success message remain.
FAIL if a field is not bound or not validated per field, or the honeypot or success message was dropped.
