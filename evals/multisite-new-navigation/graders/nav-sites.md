---
type: llm
focus: trace
---

This is a multisite project with sites `en` and `nl`. On multisite, a navigation exists in a site only when it has a tree file for that site at `content/trees/navigation/<site>/<handle>.yaml` (not `content/trees/navigation/<handle>.yaml`).
Judge the new footer navigation.
PASS if all hold: config `content/navigation/<handle>.yaml` with `title`, `collections` containing `pages`, and `max_depth: 1`; tree files exist for both sites at `content/trees/navigation/en/<handle>.yaml` and `content/trees/navigation/nl/<handle>.yaml` (each with a `tree:` key, may be empty); no tree at the single-site path.
FAIL if a tree is missing for a site, a tree is at the single-site path, or the config is wrong.
