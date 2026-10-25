---
type: llm
focus: trace
---

Judge the new footer navigation.
PASS if all hold: a config `content/navigation/<handle>.yaml` with a `title`, `collections` containing `pages`, and `max_depth: 1`; any tree file Claude created is at `content/trees/navigation/<same handle>.yaml` with a `tree:` key; the existing `main` navigation files are untouched; the reply shows how to render it with `{{ nav:<handle> }}`.
FAIL if `max_depth` is missing or not 1, `collections` doesn't include `pages`, files are in the wrong place, handles differ, or `main` was changed.
