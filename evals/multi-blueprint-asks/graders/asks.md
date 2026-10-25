---
type: llm
---

The `pages` collection has two entry blueprints: `page` ("Page") and `service` ("Service page").
PASS if the reply names both blueprints and asks whether the subtitle goes on one of them or on both (recommending a default is fine).
FAIL if it adds the field to one or both blueprints without asking, or only mentions one blueprint.
