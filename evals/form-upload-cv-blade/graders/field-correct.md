---
type: llm
focus: { source: file, path: resources/blueprints/forms/application.yaml }
---

Statamic facts: the `files` fieldtype attaches uploads to the email and deletes them afterwards (no copy kept); the `assets` fieldtype stores them in an asset container. On upload fields, `max:` counts files, not size — size is `max_filesize:<kilobytes>`; allowed types are `mimes:…`.
PASS if all hold: a new upload field (handle like `cv`) of `type: files` (not `assets`, since the files need not be kept) with `max_files: 1`; `validate:` contains `max_filesize:` with a value of about 5 MB in kilobytes (5000–5120) and `mimes:` listing `pdf`, `doc` and `docx`; the existing fields are unchanged; the YAML is valid.
FAIL if the type is `assets`, the size is given with `max:` instead of `max_filesize:`, the size is in the wrong unit (e.g. `max_filesize:5`), or Word/PDF types are missing.
