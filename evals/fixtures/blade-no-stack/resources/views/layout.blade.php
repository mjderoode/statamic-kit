<!doctype html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <x-structured-data :data="['@context' => 'https://schema.org', '@type' => 'WebPage', 'name' => $title]" />
</head>
<body class="bg-paper text-ink">
    {{ $slot }}
</body>
</html>
