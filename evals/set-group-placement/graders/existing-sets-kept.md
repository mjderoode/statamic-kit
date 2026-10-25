---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '\n {20}(heading|rich_text|quote|image|gallery|audio|columns|spacer):\n'
match: "count:8"
---
