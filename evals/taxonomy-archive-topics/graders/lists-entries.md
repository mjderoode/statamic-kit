---
type: llm
focus: trace
---

Judge the term template Claude wrote.
PASS if it is Antlers, shows the term's title, lists the news entries for that term (the `entries` pair on the term, or a `collection:news` tag filtered by the term), shows an empty state when there are none, and reuses `partials/card` or the site's markup pattern.
FAIL if it lists all news regardless of topic, has no empty state, or uses Blade.
