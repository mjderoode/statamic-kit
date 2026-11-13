---
type: llm
---

The site runs Statamic Core (`'pro' => false` in `config/statamic/editions.php`) and already has one form (`contact`). Core allows only one form; a second form needs Statamic Pro.
PASS if the reply says the site is on Core, that Core allows a single form and `contact` already exists, names how to enable Pro (`php please pro:enable` or `'pro' => true`, with a license for production), and asks how to proceed (for example: enable Pro, or extend the existing form) — without creating the newsletter form, even though the plan was pre-approved.
FAIL if it created the form anyway, did not mention the edition limit, or enabled Pro itself.
