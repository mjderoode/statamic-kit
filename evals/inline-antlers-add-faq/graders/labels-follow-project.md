---
type: llm
focus: { source: file, path: resources/blueprints/collections/pages/page.yaml }
---

The file is a Statamic blueprint. A new set with handle `faq` was added under the `blocks` set group.
PASS if all of these hold: the file is valid YAML; the `faq` set has a `display` label and field `display` labels written in English (matching the existing English labels such as "Hero" and "Button label"), not Dutch; the `faq` set contains a heading field and a repeating structure (grid, replicator or similar) for question/answer pairs; the `hero` and `rich_text` sets are unchanged.
FAIL if the YAML is invalid, any new label is Dutch, the question/answer structure is missing, or an existing set was altered.
