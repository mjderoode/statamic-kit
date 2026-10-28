#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" users
mkdir -p config/statamic
cat > config/statamic/editions.php <<'PHP'
<?php

return [

    'pro' => env('STATAMIC_PRO_ENABLED', false),

    'addons' => [
        //
    ],

];
PHP
printf 'APP_NAME=Site\nAPP_ENV=local\nSTATAMIC_PRO_ENABLED=true\n' > .env
