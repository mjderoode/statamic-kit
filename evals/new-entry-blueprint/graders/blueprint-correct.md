---
type: llm
focus: trace
---

Judge the new event entry blueprint Claude created in `resources/blueprints/collections/pages/`.
PASS if all hold: it has a `title` field, an event date field using the `date` fieldtype, and a location field (text or similar); labels are English like the rest of the project; the YAML is valid; the existing `page` and `service` blueprints keep all their fields; the collection config `content/collections/pages.yaml` still has its route, template and structure.
FAIL if the date is a plain text field, a field is missing, the YAML is invalid, or existing blueprints lost fields.
