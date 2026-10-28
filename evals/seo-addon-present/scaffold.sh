#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" pages-antlers
# SEO Pro is installed and already outputs meta in the layout.
cat > composer.lock <<'JSON'
{
    "_readme": ["Fixture lock file: only the packages the skill inspects."],
    "packages": [
        { "name": "laravel/framework", "version": "v13.17.0" },
        { "name": "statamic/cms", "version": "v6.2.0" },
        { "name": "statamic/seo-pro", "version": "v7.0.0" }
    ],
    "packages-dev": []
}
JSON
sed -i.bak 's#    <title>{{ title }} | Studio</title>#    {{ seo_pro:meta }}#' resources/views/layout.antlers.html && rm resources/views/layout.antlers.html.bak
