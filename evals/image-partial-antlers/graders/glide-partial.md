---
type: llm
focus: trace
---

Judge the new image partial and the changed `resources/views/partials/card.antlers.html`.
PASS if a new Antlers partial builds a `srcset` from several Glide widths (`glide` tag or pair), sets `sizes`, takes `alt` from the asset, outputs `width`/`height` (or an aspect-ratio equivalent) and `loading="lazy"` is optional; and the card partial now calls the new partial instead of `{{ image:url }}`.
FAIL if there is no srcset, alt is hard-coded or missing, or the card still uses the raw image URL.
