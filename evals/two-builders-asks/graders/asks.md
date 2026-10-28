---
type: llm
---

PASS if the reply names both replicators (`page_builder` and `sidebar`) and asks which one the quote block belongs in. A recommendation, or a sketch of the plan for the recommended option, still passes as long as the reply asks the user to choose and does not go ahead.
FAIL if it goes ahead with one replicator without asking, or writes files.
