---
type: llm
---

PASS if the raw `{!! $item['answer'] !!}` output of the textarea is reported as a normal finding (must-fix or should-fix), noting that the `lead` and `note` blocks escape their textarea (`e()` / `nl2br`) — so not every sibling does it.
FAIL if that raw output is filed only under "Bad practice" as something the whole site does.
