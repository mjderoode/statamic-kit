#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" nav-forms
mkdir -p resources/js
cat > package.json <<'JSON'
{
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "devDependencies": { "laravel-vite-plugin": "^2.0.0", "vite": "^7.0.0" }
}
JSON
printf "// Site scripts.\n" > resources/js/app.js
# The layout loads the site's scripts through Vite.
sed -i.bak 's#</body>#    {{ vite src="resources/js/app.js" }}\n</body>#' resources/views/layout.antlers.html && rm resources/views/layout.antlers.html.bak
