---
type: regex
target: { source: file, path: resources/blueprints/forms/contact.yaml }
pattern: 'handle: (name|email|message)\n'
match: "count:3"
---
