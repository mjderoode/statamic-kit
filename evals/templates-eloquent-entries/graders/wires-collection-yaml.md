---
type: llm
focus: trace
---

This site uses the Statamic Eloquent driver for **entries only**; collections and blueprints are still files (`config/statamic/eloquent-driver.php`). So `template:` in `content/collections/news.yaml` still takes effect.
PASS if Claude writes the news detail template, sets `template:` in `content/collections/news.yaml` to it, and does not tell the user to set the collection's template in the Control Panel instead.
FAIL if it refuses to edit the collection YAML because of the Eloquent driver, or leaves the template unreachable.
