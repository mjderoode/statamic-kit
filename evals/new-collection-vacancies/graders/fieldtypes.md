---
type: llm
focus: trace
---

Judge the files Claude wrote for the new vacancies collection.
PASS if Claude created both a collection config under `content/collections/` and a blueprint under `resources/blueprints/collections/<same handle>/`, the blueprint has a title field, a location field (text or similar) and an hours field using a numeric fieldtype (`integer` or `float`), labels are English like the rest of the project, and the YAML is valid.
FAIL if either file is missing, the handles of the two files don't match, hours is a plain text field, or the YAML is invalid.
