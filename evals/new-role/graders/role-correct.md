---
type: llm
focus: { source: file, path: resources/users/roles.yaml }
---

Statamic permissions are hierarchical: a child permission only works when its parents are also granted, and nothing in the Control Panel works without `access cp`. For the `pages` collection the chain is `view pages entries` → `edit pages entries` → `create` / `publish` / `delete pages entries`.
PASS if all hold: a new role (handle like `editor`) with a `title` and a `permissions:` list containing `access cp`, `view pages entries`, `edit pages entries`, `create pages entries` and `publish pages entries`; it does NOT contain `super`, `delete pages entries`, or any user permission (`view users`, `edit users`, `create users`, `edit roles`, …); the `admin` and `author` roles are unchanged; the YAML is valid.
FAIL if `access cp` or `view pages entries` is missing (the role would not work), a forbidden permission is present, a permission string is misspelled (not Statamic's exact wording), or existing roles changed.
