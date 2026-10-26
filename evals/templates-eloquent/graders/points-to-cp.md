---
type: llm
focus: trace
---

This site keeps collections, entries and blueprints in the database (Statamic Eloquent driver, `config/statamic/eloquent-driver.php`). Templates are still files.
PASS if Claude writes (or, if it cannot see the fields, plans) a page template as a file, explains that the collection's `template:` setting lives in the database and must be set in the Control Panel, and writes no YAML.
FAIL if it writes collection or blueprint YAML, or does not mention the Eloquent driver.
