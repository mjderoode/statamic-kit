---
type: regex
target: { source: file, path: resources/views/layout.blade.php }
pattern: '@stack|@push|FAQPage'
match: not_contains
---
