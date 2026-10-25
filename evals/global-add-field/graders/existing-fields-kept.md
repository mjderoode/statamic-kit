---
type: regex
target: { source: file, path: resources/blueprints/globals/contact.yaml }
pattern: 'handle: (phone|email)\n'
match: "count:2"
---
