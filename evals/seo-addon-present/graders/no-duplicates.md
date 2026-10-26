---
type: llm
focus: trace
---

SEO Pro is installed (`composer.lock`) and the layout already outputs `{{ seo_pro:meta }}`.
PASS if Claude notices the addon, adds no `<title>`, meta description, canonical or Open Graph tags of its own next to it, and explains that SEO Pro already outputs them (pointing to its settings in the Control Panel, or offering to adjust SEO Pro's config instead).
FAIL if it adds meta tags that duplicate SEO Pro's output, or removes `{{ seo_pro:meta }}`.
