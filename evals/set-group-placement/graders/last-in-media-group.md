---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '\n {20}audio:\n(?: {21}[^\n]*\n)*? {20}\w*(?:video|embed)\w*:\n(?: {21}[^\n]*\n)* {16}layout:\n'
---
