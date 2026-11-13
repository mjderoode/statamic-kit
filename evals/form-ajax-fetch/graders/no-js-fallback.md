---
type: llm
focus: { source: file, path: resources/views/partials/contact-form.antlers.html }
---

Judge the file as it is now, not whether it was tested in a browser.
PASS if the server-rendered form still works without JavaScript: the form tag, labels, honeypot input and server-rendered error and success output remain in the template.
FAIL if the no-JavaScript path was removed (e.g. errors or honeypot dropped from the template).
