---
type: llm
focus: trace
---

Judge the overview template Claude wrote. The site already has `resources/views/partials/card.antlers.html`, used on the home page for news teasers.
PASS if the overview renders each news item with that card partial (e.g. `{{ partial:card }}`) and follows the markup pattern of the existing templates (`container` wrapper, `page__title` heading, `card-grid`).
FAIL if it writes its own teaser markup instead of reusing the card partial.
