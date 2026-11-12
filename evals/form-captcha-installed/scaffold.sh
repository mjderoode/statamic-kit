#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" nav-forms
# The site already protects the contact form with the Captcha addon.
cat > composer.lock <<'JSON'
{
    "_readme": ["Fixture lock file: only the packages the skill inspects."],
    "packages": [
        { "name": "laravel/framework", "version": "v13.17.0" },
        { "name": "statamic/cms", "version": "v6.2.0" },
        { "name": "aryehraber/statamic-captcha", "version": "v1.20.0" }
    ],
    "packages-dev": []
}
JSON
mkdir -p config
cat > config/captcha.php <<'PHP'
<?php

return [
    'service' => env('CAPTCHA_SERVICE', 'Turnstile'),
    'sitekey' => env('CAPTCHA_SITEKEY', ''),
    'secret' => env('CAPTCHA_SECRET', ''),
    'forms' => ['contact'],
    'user_login' => false,
    'user_registration' => false,
    'disclaimer' => '',
    'invisible' => false,
    'hide_badge' => false,
    'enable_api_routes' => false,
    'custom_should_verify' => null,
];
PHP
sed -i.bak 's#<body>#<head>\n    {{ captcha:head }}\n</head>\n<body>#' resources/views/layout.antlers.html
sed -i.bak 's#    <input type="text" name="winnie"#    {{ captcha }}\n    {{ if error:captcha }}<p class="form-error">{{ error:captcha }}</p>{{ /if }}\n\n    <input type="text" name="winnie"#' resources/views/partials/contact-form.antlers.html
rm -f resources/views/*.bak resources/views/partials/*.bak
