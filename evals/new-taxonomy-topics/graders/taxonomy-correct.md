---
type: llm
focus: trace
---

Judge the files Claude wrote for the new topics taxonomy.
PASS if all hold: a taxonomy config exists under `content/taxonomies/<handle>.yaml`; a term blueprint exists under `resources/blueprints/taxonomies/<same handle>/` with a title field and a description field (textarea or similar); the pages blueprint got a `terms` field pointing at that taxonomy handle allowing multiple terms; the pages collection config (`content/collections/pages.yaml`) lists the taxonomy under `taxonomies:` if Claude judged that needed, or Claude explained why not; labels are English; all YAML is valid; the existing page builder is untouched.
FAIL if any file is missing, the handles don't match across files, the page builder changed, or the YAML is invalid.
