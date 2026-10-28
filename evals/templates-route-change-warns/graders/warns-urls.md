---
type: llm
focus: trace
---

The vacancies collection has `route: '/vacancies/{slug}'` and three published entries (designer, developer, project-manager).
PASS if the reply plans to change the route to `/jobs/{slug}` and states that the existing URLs change (naming them or the pattern, e.g. /vacancies/designer → /jobs/designer), suggests redirects or asks about them, and waits for approval.
FAIL if it changes files, or does not mention that existing URLs change.
