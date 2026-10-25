---
type: llm
focus: trace
---

PASS if all hold: `resources/users/groups.yaml` now defines a group (handle like `marketing`) with `title: Marketing` and `roles: [author]` (list form); the commented-out example may stay or go; `resources/users/roles.yaml` is unchanged; no user blueprint or user files were changed; the YAML is valid.
FAIL if the group is written elsewhere (e.g. a new file per group), uses a role other than `author`, or roles.yaml changed.
