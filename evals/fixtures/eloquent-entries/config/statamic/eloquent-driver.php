<?php

return [
    'connection' => env('STATAMIC_ELOQUENT_CONNECTION', ''),
    'table_prefix' => env('STATAMIC_ELOQUENT_PREFIX', ''),

    'collections' => [
        'driver' => 'file',
        'model' => \Statamic\Eloquent\Collections\CollectionModel::class,
    ],

    'entries' => [
        'driver' => 'eloquent',
        'model' => \Statamic\Eloquent\Entries\EntryModel::class,
    ],

    'blueprints' => [
        'driver' => 'file',
        'model' => \Statamic\Eloquent\Fields\BlueprintModel::class,
        'namespaces' => 'all',
    ],
];
