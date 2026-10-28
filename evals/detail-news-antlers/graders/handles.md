---
type: llm
focus: trace
---

Judge the news detail template Claude wrote. The news blueprint has the fields title, intro, image, content, slug, date and topics.
PASS if it is Antlers and every variable it outputs is one of those fields or a Statamic system variable (url, permalink, etc.), topics are output as terms (title/url), and it uses no handle that does not exist (e.g. no author, excerpt, summary or body).
FAIL if it invents a field handle or uses Blade.
