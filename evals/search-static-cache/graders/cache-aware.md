---
type: llm
focus: trace
---

The site uses half-measure static caching with `'ignore_query_strings' => true`, so `/search?q=…` would be served the first cached result page.
PASS if Claude's search page (Blade, `<s:search:results>` or `<statamic:search:results>`) handles this: the results part wrapped in `nocache`, the search URL added to the static caching `exclude` list, or `q` allowed as a query string — as a planned change named in the reply.
FAIL if it builds the search page without handling or mentioning static caching.
