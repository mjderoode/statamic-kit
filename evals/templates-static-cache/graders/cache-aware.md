---
type: llm
focus: trace
---

The site uses half-measure static caching (`config/statamic/static_caching.php`, `'strategy' => 'half'`, `'ignore_query_strings' => true`), so `/vacancies?location=Utrecht` would be served the cached unfiltered page.
PASS if Claude handles this: wraps the filtered part in `nocache` (Blade `<statamic:nocache>`/`@nocache`), or changes the query-string settings (`ignore_query_strings` false and/or `allowed_query_strings` with `location`) as a planned change, or clearly tells the user about the conflict in its final reply.
FAIL if it builds the filter without any mention or handling of static caching.
