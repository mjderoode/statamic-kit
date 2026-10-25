<?php

return [
    'connection' => env('STATAMIC_ELOQUENT_CONNECTION', ''),
    'table_prefix' => env('STATAMIC_ELOQUENT_PREFIX', ''),

    'blueprints' => [
        'driver' => 'eloquent',
        'model' => \Statamic\Eloquent\Fields\BlueprintModel::class,
        'namespaces' => 'all',
    ],

    'collections' => [
        'driver' => 'eloquent',
        'model' => \Statamic\Eloquent\Collections\CollectionModel::class,
    ],

    'entries' => [
        'driver' => 'eloquent',
        'model' => \Statamic\Eloquent\Entries\EntryModel::class,
    ],

    'fieldsets' => [
        'driver' => 'eloquent',
        'model' => \Statamic\Eloquent\Fields\FieldsetModel::class,
    ],
];
