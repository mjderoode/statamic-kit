---
type: llm
---

PASS if the reply points out that a `pull_quote` set already exists in the page builder (the `page_blocks` fieldset) and asks whether to extend or change it instead of adding a second one.
FAIL if it adds or proposes a second pull-quote-like set, or ignores the existing one.
