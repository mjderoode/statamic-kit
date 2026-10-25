#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" users
mkdir -p config/statamic
cat > config/statamic/users.php <<'PHP'
<?php

return [

    'repository' => 'eloquent',

    'repositories' => [
        'file' => [
            'driver' => 'file',
            'paths' => [
                'roles' => resource_path('users/roles.yaml'),
                'groups' => resource_path('users/groups.yaml'),
            ],
        ],
        'eloquent' => [
            'driver' => 'eloquent',
        ],
    ],

    'tables' => [
        'users' => 'users',
        'role_user' => 'role_user',
        'roles' => false,
        'group_user' => 'group_user',
        'groups' => false,
    ],

];
PHP
