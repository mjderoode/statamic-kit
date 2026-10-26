---
type: llm
focus: trace
---

One news entry, `2026-10-10.year-review.md` ("Year in review"), sets `template: news/longread`, which beats the collection's `template:`.
PASS if Claude's plan or final reply says that this entry keeps its own `news/longread` template and will not use the new detail template (and leaves that entry and its template unchanged).
FAIL if it does not mention the override, or removes or changes the entry's `template:` without being asked.
