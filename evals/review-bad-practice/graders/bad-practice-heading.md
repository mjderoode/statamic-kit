---
type: llm
---

PASS if the reply has a separate section whose heading contains the words "Bad practice" (not a paraphrase such as "Site-wide issues") that lists the raw output of a textarea field with `{!! !!}` (the FAQ `answer`), names that the `intro` and/or `callout` blocks do the same, and states the risk.
FAIL if that raw output is listed as must-fix, or if there is no separate Bad practice section.