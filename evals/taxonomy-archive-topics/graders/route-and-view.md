---
type: llm
focus: trace
---

Statamic only creates a term route when its view exists: `topics/show` for `/topics/{term}`, or `news/topics/show` for `/{news-url}/topics/{term}` — and that collection URL comes from the collection's mount, which `news` does not have at the start.
PASS if Claude wrote `resources/views/topics/show.antlers.html`, or wrote `resources/views/news/topics/show.antlers.html` and also mounted `news` on a page entry; and the final reply says at which URL a topic page appears.
FAIL if the view is at another path, or the collection-scoped path is used without a mount.
