---
type: llm
focus: { source: file, path: resources/blueprints/forms/contact.yaml }
---

Statamic facts: the `assets` fieldtype stores uploads in an asset container (kept, visible in the Control Panel); the `files` fieldtype deletes them after the email. On upload fields, `max:` counts files; the file count belongs in `max_files`. The site has one asset container, `uploads`.
PASS if all hold: a new field (handle like `photos`) of `type: assets` with `container: uploads` and `max_files: 3`; `validate:` restricts uploads to images (`image` or `mimes:` with image types); no `max:` rule used for a file size; the existing fields are unchanged; the YAML is valid.
FAIL if the type is `files`, the container is missing or not `uploads`, `max_files` is missing or not 3, or there is no image restriction.
