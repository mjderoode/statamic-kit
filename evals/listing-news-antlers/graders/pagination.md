---
type: llm
focus: trace
---

Judge the overview template Claude wrote for the news.
PASS if it is Antlers, uses the `collection:news` tag with `paginate="10"` (or equivalent 10 per page), outputs pagination links (prev/next, `auto_links` or `links`), and shows an empty state via `no_results` (or equivalent) when there are no entries.
FAIL if pagination links or the empty state are missing, or it uses Blade.
