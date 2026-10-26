---
type: llm
focus: trace
---

Judge the news detail template Claude wrote, compared with `resources/views/page.antlers.html` and `layout.antlers.html`.
PASS if it relies on the layout (no own `<html>`, `<head>` or `<body>`; Antlers templates are injected into `{{ template_content }}`) and follows the existing page pattern (`container` wrapper, `page__title` h1, `prose` for the content).
FAIL if it duplicates the layout or ignores the site's markup pattern.
