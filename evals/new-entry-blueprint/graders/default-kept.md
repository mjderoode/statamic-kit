---
type: llm
focus: trace
---

Statamic picks a collection's default entry blueprint as the first blueprint that is not `hide: true`, sorted by `order:` (missing = 99999) and then alphabetically by `title:`. Entries without a `blueprint:` key (here `content/collections/pages/about.md`) use that default. Before the run the default was `page` ("Page"; "Service page" sorts after it).

Work out the default from the final blueprint files in `resources/blueprints/collections/pages/`.
PASS if all hold: the default is still `page`; the new event blueprint is not `hide: true` (editors must be able to create event pages); and `about.md` still resolves to `page` (either through the default or an explicit `blueprint: page`).
FAIL if the new blueprint became the default (e.g. a title like "Event page" with no `order:` set sorts before "Page"), or the new blueprint is hidden.
