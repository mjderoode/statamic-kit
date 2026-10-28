---
type: llm
focus: { source: file, path: resources/js/app.js }
---

On a validation error Statamic answers status 400 with `{ "error": { "<handle>": "<first message>" }, "errors": ["<all messages>"] }`: `error` is keyed by field, `errors` is a flat list. `fetch` does not reject on a 400.
Judge the file as it is now, not whether it was tested in a browser.
PASS if the script handles the 400 response as a validation error (checks the status or `response.ok`) and takes each field's message from `error[handle]`, showing it next to that field.
FAIL if it reads field messages from `errors[handle]`, guesses between `error` and `errors`, or treats a 400 as success.
