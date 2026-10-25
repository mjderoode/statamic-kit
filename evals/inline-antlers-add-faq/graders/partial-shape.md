---
type: llm
focus: { source: file, path: resources/views/blocks/faq.antlers.html }
---

PASS if this is an Antlers template (not Blade) that renders the FAQ block's heading and loops over the question/answer items using the same field handles the blueprint defines, and contains no hard-coded sample content.
FAIL if it uses Blade syntax, is empty, or uses field names that would not exist on the set.
