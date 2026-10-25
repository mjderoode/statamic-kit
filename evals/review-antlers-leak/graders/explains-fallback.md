---
type: llm
---

PASS if the reply reports that `{{ title }}` in the card partial is not a field on the `card` set (it has `heading`), and explains that Antlers then falls back to the surrounding context, so the page's own title is shown in every card instead of nothing; it proposes `{{ heading }}` (mentioning `scope` is a bonus).
FAIL if it misses `title`, or says a missing field simply renders empty.
