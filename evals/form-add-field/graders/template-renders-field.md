---
type: llm
focus: { source: file, path: resources/views/partials/contact-form.antlers.html }
---

The form template lists its fields by hand.
PASS if it now also renders a phone input with `name="phone"` (type `tel` or text), not `required`, with `{{ old:phone }}` and a `{{ error:phone }}` message in the same style as the existing fields, and the existing fields and honeypot input are unchanged.
FAIL if there is no phone input, it is marked required, or the existing markup changed.
