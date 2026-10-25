---
type: llm
focus: { source: file, path: resources/fieldsets/page_blocks.yaml }
---

Only the values of `display:` keys (and `instructions:` / `button_label:` / `add_row:` if present) are CP labels. Field and set **handles** (`handle: heading`, `faq:`, `question`) are snake_case identifiers and are normally English — ignore their language entirely.
PASS if the file is valid YAML, a set with handle `faq` was added inside one of the existing set groups (`content` or `media`) or a new clearly-named group, every new `display:` label is Dutch (matching existing labels like "Introductie" and "Afbeelding"), and the existing `intro` and `image` sets are unchanged.
FAIL if the YAML is invalid, any new `display:` label is English, or the existing `intro`/`image` sets changed.
