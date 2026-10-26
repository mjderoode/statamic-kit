---
type: llm
focus: trace
---

Judge whether Statamic would actually use the new template. `content/collections/news.yaml` has no `template:` at the start, so news entries would use the default template, which does not exist.
PASS if Claude created a news detail template and made it reachable: `template:` in `news.yaml` names the new file (path relative to `resources/views`, without extension), or the file sits where the collection's setting already resolves.
FAIL if the template is written somewhere no setting points to.
