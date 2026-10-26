---
type: llm
focus: trace
---

Judge `resources/views/vacancies/vacancy.blade.php`. The vacancy blueprint has title, location, hours, image, content (bard) and slug.
PASS if it is Blade, uses `@extends('layouts.default')` with `@section('content')` like `page.blade.php` (Statamic ignores the layout for Blade templates), outputs only those fields or system variables, and follows the site's markup (`container`, `page__title`).
FAIL if it is Antlers, lacks @extends, or uses a field the blueprint does not have.
