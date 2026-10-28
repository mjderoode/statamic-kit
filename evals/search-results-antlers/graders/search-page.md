---
type: llm
focus: trace
---

PASS if Claude builds an Antlers search page: a form with an input named `q` (or the parameter the results tag reads), the `search:results` tag with an empty state (`no_results`) that echoes the query safely, results linking to `url`; it creates or reuses an index in `config/statamic/search.php` that covers the news collection (`collection:news` or `content`) with useful `fields` (more than title, e.g. intro/content), names that index on the tag, wires the page so it is reachable (page entry with `template:` or a `Route::statamic` line), and tells the user to run `php please search:update`.
FAIL if the results tag is missing, there is no empty state, the index does not cover news, or the page is unreachable.
