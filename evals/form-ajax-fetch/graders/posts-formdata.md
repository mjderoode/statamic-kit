---
type: llm
focus: { source: file, path: resources/js/app.js }
---

Statamic needs `_token` and `_params` with every submission, and answers AJAX with JSON only when the request has the header `X-Requested-With: XMLHttpRequest`.
Judge the file as it is now, not whether it was tested in a browser.
PASS if the script posts `new FormData(form)` (built from the form element) to the form's own `action` URL and sends the `X-Requested-With: XMLHttpRequest` header.
FAIL if it builds its own JSON body, hard-codes a different URL, or omits the header.
