---
type: regex
target: { source: file, path: resources/views/components/page-builder.blade.php }
pattern: '@stack|@push|FAQPage|faq'
match: not_contains
---
