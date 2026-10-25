---
type: llm
focus: trace
---

PASS if the new fieldset contains both `meta_title` (with `character_limit: 60`) and `meta_description` (with `character_limit: 160`) and their Dutch display labels, both `pages/page.yaml` and `articles/article.yaml` import it in place of the inline fields, and every file is valid YAML.
FAIL if a field, a character limit or a label was lost, or one blueprint still has the inline fields.
