---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '\n {20}(rich_text|callout|quote|source|image|video|columns|spacer):\n'
match: "count:8"
---
