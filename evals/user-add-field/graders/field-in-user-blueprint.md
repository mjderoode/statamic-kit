---
type: llm
focus: { source: file, path: resources/blueprints/user.yaml }
---

PASS if a job title text field (handle like `job_title`) was added to the user blueprint in the same tabs/sections shape, and `name`, `email`, `roles` and `groups` are unchanged.
FAIL if no such field was added or an existing field changed.
