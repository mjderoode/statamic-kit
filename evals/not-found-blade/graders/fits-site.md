---
type: llm
focus: trace
---

PASS if `resources/views/errors/404.blade.php` is Blade, `@extends('layouts.default')` with `@section('content')` like `page.blade.php`, has one `<h1>`, a short message and a link to the home page (`/` or the site URL), follows the site's markup (`container`, `page__title`), and no route or config file was changed for it.
FAIL if it lacks the layout, adds a route for the 404, or uses Antlers.
