---
type: llm
focus: trace
---

Judge the files Claude wrote or changed. Statamic creates no listing page by itself; the overview needs an entry at /news in the `pages` collection, mounted on the `news` collection.
PASS if a new entry for /news exists under `content/collections/pages/` with an `id`, it is added to `content/trees/collections/pages.yaml`, and `content/collections/news.yaml` has `mount:` set to that same id; the entry uses (directly or via `template:`) the new overview template.
FAIL if any of these is missing, the mount id does not match the entry, or the overview is only a template file nothing routes to.
