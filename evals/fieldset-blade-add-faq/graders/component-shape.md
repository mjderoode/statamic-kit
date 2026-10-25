---
type: llm
focus: { source: file, path: resources/views/components/blocks/faq.blade.php }
---

PASS if this is a Blade anonymous component that declares `@props(['block'])`, reads fields as `$block['…']` using handles that exist on the new `faq` set, and loops over the question/answer items.
FAIL if it uses Antlers syntax, reads variables that would not exist, or contains hard-coded sample content.
