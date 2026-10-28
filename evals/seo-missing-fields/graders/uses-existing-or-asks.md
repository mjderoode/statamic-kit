---
type: llm
focus: trace
---

There are no SEO fields; pages and news have `title` and `intro`.
PASS if Claude either (a) builds meta from existing fields only (`title`, `intro`, `permalink`, news `image`) and says that dedicated SEO fields would be a blueprint change it can do with the blueprints skill, or (b) stops and offers to add SEO fields first with the blueprints skill. In both cases no blueprint is written.
FAIL if it adds fields to a blueprint, or outputs handles that do not exist (e.g. `seo_title`, `meta_description`).
