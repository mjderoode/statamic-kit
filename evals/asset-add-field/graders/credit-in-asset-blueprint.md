---
type: llm
focus: { source: file, path: resources/blueprints/assets/assets.yaml }
---

This is the blueprint for the `assets` asset container (image metadata).
PASS if a photographer credit field (text, handle like `credit` or `photographer`) was added in the same flat `fields:` shape, and the `alt` field is unchanged.
FAIL if no credit field was added, the file was converted to tabs/sections, or `alt` changed.
