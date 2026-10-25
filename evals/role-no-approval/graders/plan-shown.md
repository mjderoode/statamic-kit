---
type: llm
---

PASS if the reply presents a plan for the editor role — the file (`resources/users/roles.yaml`) and the permission list including `access cp`, `view pages entries` and `edit pages entries` — and asks for approval before writing.
FAIL if it says the role was created, or gives no concrete permission list.
