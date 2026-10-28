<?php

return [

    'strategy' => 'half',

    'strategies' => [
        'half' => [
            'driver' => 'application',
            'expiry' => null,
        ],
        'full' => [
            'driver' => 'file',
            'path' => public_path('static'),
            'lock_hold_length' => 0,
        ],
    ],

    'exclude' => [
        'urls' => [],
    ],

    'invalidation' => [
        'class' => null,
        'rules' => 'all',
    ],

    'ignore_query_strings' => true,

];
