---
type: llm
focus: { source: file, path: resources/views/partials/contact-form.antlers.html }
---

Statamic wires Laravel Precognition through its form tag: `{{ form:create in="contact" js="alpine_precognition" }}` builds the Alpine `form` object (with the action URL and the errors of a failed normal submit). Plain `js="alpine"` is not Precognition.
Judge the file as it is now, not whether it was tested in a browser.
PASS if the form tag uses `js="alpine_precognition"` (optionally with `:form:<component>`) and there is no hand-written `x-data` that builds its own `$form(...)`.
FAIL if it uses only `js="alpine"`, no `js` parameter, or builds `$form(...)` itself in `x-data` or an `Alpine.data` component.
