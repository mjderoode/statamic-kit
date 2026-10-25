---
type: llm
---

The project reads globals in Antlers as `{{ contact:phone }}`.
PASS if the reply says the field was added to the `contact` global's blueprint and shows how to output it in a template using the project's syntax (e.g. `{{ contact:opening_hours }}`, or a loop over it if it is a grid/list).
FAIL if it does not mention template usage, or shows Blade/PHP syntax for this Antlers project.
