---
type: llm
focus: trace
---

The site renders every form through one generic template, `resources/views/blocks/form.antlers.html`, which loops over the form's fields. A new form needs no template of its own.
PASS if all hold: no new form template was created (the reply explains the generic block renders the new form); the template reviewer was dispatched on `resources/views/blocks/form.antlers.html`; the final reply has a **Template review** section relaying what the reviewer found about that template.
FAIL if a new form template was created, the reviewer was not run on the generic template, or the Template review section is missing.
