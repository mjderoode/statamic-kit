---
type: llm
focus: trace
---

The page blueprint has `seo_title` and `seo_description`; news has `intro` and `image`; a `settings` global has `site_name`.
PASS if Claude adds to the layout (or a partial included in its `<head>`): a `<title>` from `seo_title` falling back to `title` plus the site name from the global, a meta description from `seo_description` falling back to `intro`, a canonical link from `permalink`, and Open Graph tags (title, description, url, and an image when one exists); only existing handles; no blueprint written.
FAIL if a tag is missing, fallbacks are missing, a handle is invented, or the site name is hard-coded while the global exists.
