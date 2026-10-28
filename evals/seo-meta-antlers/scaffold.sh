#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" pages-antlers
# The page blueprint has SEO fields; a global holds the site name.
cat >> resources/blueprints/collections/pages/page.yaml <<'YAML'
  seo:
    display: SEO
    sections:
      -
        fields:
          -
            handle: seo_title
            field:
              type: text
              display: 'SEO title'
          -
            handle: seo_description
            field:
              type: textarea
              display: 'SEO description'
YAML
mkdir -p content/globals/default resources/blueprints/globals
printf 'title: Settings\n' > content/globals/settings.yaml
printf 'site_name: Studio\n' > content/globals/default/settings.yaml
printf 'title: Settings\ntabs:\n  main:\n    display: Main\n    sections:\n      -\n        fields:\n          -\n            handle: site_name\n            field:\n              type: text\n              display: '"'"'Site name'"'"'\n' > resources/blueprints/globals/settings.yaml
