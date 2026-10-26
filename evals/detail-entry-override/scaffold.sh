#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" pages-antlers
# One news entry keeps its own template.
mkdir -p resources/views/news
cat > content/collections/news/2026-10-10.year-review.md <<'MD'
---
id: 7a2b0000-0000-4000-8000-000000000020
title: 'Year in review'
intro: 'Our year in pictures.'
template: news/longread
topics:
  - company
---
A long read.
MD
cat > resources/views/news/longread.antlers.html <<'HTML'
{{# Long read: full-width article for special news items. #}}
<article class="longread">
    <h1 class="longread__title">{{ title }}</h1>
    <div class="prose prose--wide">{{ content }}</div>
</article>
HTML
