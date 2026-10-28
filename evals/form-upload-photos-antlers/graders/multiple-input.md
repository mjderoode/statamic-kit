---
type: llm
focus: { source: file, path: resources/views/partials/contact-form.antlers.html }
---

For several files in one field, Statamic needs the input name with square brackets and the `multiple` attribute (`<input type="file" name="photos[]" multiple>`). The `form:create` tag adds `enctype="multipart/form-data"` by itself once the form has an upload field, so adding it by hand is optional.
PASS if the template has a file input for the new field with a `[]` name and `multiple`, preferably limited to images (`accept="image/*"` or similar), with a label and error output in the same style as the existing fields; the existing fields are unchanged.
FAIL if there is no file input, the name lacks `[]`, `multiple` is missing, or existing fields were changed.
