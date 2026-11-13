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
  "dependencies": { "alpinejs": "^3.14.0" },
  "devDependencies": { "laravel-vite-plugin": "^2.0.0", "vite": "^7.0.0" }
}
JSON
cat > resources/js/app.js <<'JS'
import Alpine from 'alpinejs'

window.Alpine = Alpine
Alpine.start()
JS
# The layout loads the site's scripts through Vite.
sed -i.bak 's#</body>#    {{ vite src="resources/js/app.js" }}\n</body>#' resources/views/layout.antlers.html && rm resources/views/layout.antlers.html.bak
