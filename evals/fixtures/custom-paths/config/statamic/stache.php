<?php

use Statamic\Stache\Stores;

return [
    'stores' => [
        'taxonomies' => [
            'class' => Stores\TaxonomiesStore::class,
            'directory' => base_path('cms/content/taxonomies'),
        ],

        'collections' => [
            'class' => Stores\CollectionsStore::class,
            'directory' => base_path('cms/content/collections'),
        ],

        'entries' => [
            'class' => Stores\EntriesStore::class,
            'directory' => base_path('cms/content/collections'),
        ],
    ],
];
