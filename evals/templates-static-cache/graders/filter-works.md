---
type: llm
focus: trace
---

PASS if the overview filters the vacancies collection on the `location` query parameter (e.g. `location:is` with `get:location`/`request()->query('location')`), shows all vacancies without a parameter, and has an empty state.
FAIL if the filter is not tied to the query string or the overview breaks without a parameter.
