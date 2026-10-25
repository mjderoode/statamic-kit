<?php

// Parses YAML with the Symfony parser from the site's own vendor folder, the
// same parser Statamic uses, and prints the results as JSON.
//
//   php yaml-parse.php <vendor/autoload.php> --texts
//       stdin: JSON array of texts
//   php yaml-parse.php <vendor/autoload.php> <file> ...
//       each file
//
// Prints a JSON array with one result per text or file, in order:
//   {"ok": true, "data": ...} or {"ok": false, "error": "...", "line": 12}

use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Yaml\Yaml;

if ($argc < 3) {
    fwrite(STDERR, "usage: yaml-parse.php <autoload> --texts | <file>...\n");
    exit(2);
}

require $argv[1];

$parse = function ($text): array {
    if (!is_string($text)) {
        return ['ok' => false, 'error' => 'unreadable', 'line' => -1];
    }
    try {
        return ['ok' => true, 'data' => Yaml::parse($text)];
    } catch (ParseException $e) {
        return [
            'ok' => false,
            'error' => $e->getMessage(),
            'line' => $e->getParsedLine(),
        ];
    }
};

if ($argv[2] === '--texts') {
    $input = json_decode(stream_get_contents(STDIN), true);
    $texts = is_array($input) ? array_values($input) : [];
} else {
    $texts = array_map(
        fn ($file) => @file_get_contents($file),
        array_slice($argv, 2)
    );
}

echo json_encode(
    array_map($parse, $texts),
    JSON_UNESCAPED_SLASHES
        | JSON_UNESCAPED_UNICODE
        | JSON_PARTIAL_OUTPUT_ON_ERROR
);
