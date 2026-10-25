<?php

return [
    'license_key' => env('STATAMIC_LICENSE_KEY'),

    // CMS structure lives together under cms/ instead of resources/.
    'blueprints_path' => base_path('cms/blueprints'),

    'fieldsets_path' => base_path('cms/fieldsets'),
];
