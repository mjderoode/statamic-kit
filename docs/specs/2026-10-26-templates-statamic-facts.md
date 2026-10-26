# Templates skill — Statamic 6 facts

Checked 2026-10-26 against statamic.dev (via context7 `/websites/statamic_dev`).
Graders and references cite this file. "Not in the docs" marks a fact taken
from Statamic's behaviour that a real-site QA round should confirm.

## Template and layout resolution

- Entry `template:` beats the collection's `template:`.
  <https://statamic.dev/frontend/views>
- `template: '@blueprint'` on a collection → `resources/views/{collection}/{blueprint}`
  (e.g. `articles` + blueprint `long` → `articles/long`). Remap the folder per
  collection with `blueprint_templates` in `config/statamic/system.php`
  (`'blog' => 'shared'` → `shared/post`). <https://statamic.dev/frontend/views>
- Layout: default `resources/views/layout.antlers.html`; `layout:` on an entry
  or collection picks another. An Antlers template is injected into the
  layout's `{{ template_content }}`. <https://statamic.dev/frontend/antlers>
- **Blade template → the layout is ignored**; the template uses `@extends`
  like plain Laravel. An Antlers template with a Blade layout gets
  `$template_content`. <https://statamic.dev/frontend/blade>

## Routes, mount, listing page

- Collection `route:` (string, or array per site) sets entry URLs; `mount:`
  takes the id of an entry. <https://statamic.dev/backend-apis/resource-apis/collection-repository>
- Statamic **does not** create a listing page. Either an entry in another
  collection (usually `pages`) at `/blog`, mounted with `mount:` on the
  collection, or a custom route at `/blog`.
  <https://statamic.dev/content-modeling/collections>
- Mounting makes entries subpages of the mount entry and adds add/edit links in
  the pages tree. Route can use the mount:
  `route: '{{ mount }}/{{ slug }}'` (Antlers in routes needs `{{ }}`).
- `{{ mount_url:blog }}` / `Statamic::tag('mount_url:blog')` returns the mount
  entry's URL. <https://statamic.dev/tags/mount_url>

## Listings and pagination

- Antlers: `{{ collection:blog paginate="10" as="posts" }}`, `{{ if no_results }}`,
  `{{ posts }}…{{ /posts }}`, `{{ paginate }}` pair with `prev_page`,
  `next_page`, `current_page`, `total_pages`, `total_items`, `auto_links`,
  `links:all`, `links:segments`. <https://statamic.dev/tags/collection>
- Blade: `<statamic:collection:blog paginate="10" as="posts">` (prefix `s:`
  also works), `@if ($no_results)`, `@foreach ($posts as $post)`,
  `$paginate['prev_page']`, … `@if ($paginate['total_pages'] > 1)`.
  Fluent alternative: `Statamic::tag('collection:pages')->limit(3)`.
  <https://statamic.dev/tags/collection>, <https://statamic.dev/frontend/blade>
- Pagination uses the `?page=x` query parameter.

## Taxonomy archives

- Routes exist only **if the view exists**. Global: `/{taxonomy}` →
  `{taxonomy}/index`, `/{taxonomy}/{term}` → `{taxonomy}/show`. For a taxonomy
  attached to a collection also `/{collection-url}/{taxonomy}/{term}` →
  `{collection}/{taxonomy}/show` (only that collection's entries).
  <https://statamic.dev/content-modeling/taxonomies>
- Not in the docs: `{collection-url}` is the mount entry's URL, so the
  collection-scoped term routes need the collection to be mounted. Without a
  mount, use the global `{taxonomy}/show`.
- On a term route: Antlers `{{ entries paginate="5" }}{{ results }}…{{ /results }}{{ /entries }}`;
  Blade `@php($results = $entries->paginate(5))` and `$results->items()`.
- Term `url` includes the collection URL when the collection can be inferred.

## Navigation and breadcrumbs

- `{{ nav:main }}` / `<s:nav:main>`; collection tree: `nav handle="collection::pages"`.
  Variables `url`, `title`, `children`, `is_current`, `is_parent`. Recursion:
  Antlers `{{ *recursive children* }}`, Blade `@recursive_children`. Params
  `max_depth`, `include_home`, `select`, `from`; `as` disables recursion.
  <https://statamic.dev/tags/nav>
- `{{ nav:breadcrumbs }}` with `include_home` (default `true`).
  <https://statamic.dev/tags/nav-breadcrumbs>

## Images

- Glide pair: Antlers `{{ glide :src="image" width="600" }}<img src="{{ url }}" width="{{ width }}" height="{{ height }}">{{ /glide }}`;
  Blade `<s:glide :src="$image" width="600">` (or `glide:generate` in Blade).
  Inside the pair the asset's own fields are available, e.g. `alt`.
  <https://statamic.dev/tags/glide>
- A `srcset` is built from several Glide URLs (one per width), e.g.
  `{{ glide:image width="800" }} 800w`.

## Static caching

- `config/statamic/static_caching.php` `strategy`: `null` (off), `half`
  (application driver) or `full` (file driver).
  <https://statamic.dev/advanced-topics/static-caching>
- By default query strings are **ignored**: each URL is cached once, so
  `?page=2` or `?location=x` would serve the first cached version. Set
  `ignore_query_strings => false` (then `allowed_query_strings` /
  `disallowed_query_strings` work in half measure).
- `{{ nocache }}…{{ /nocache }}`, Blade `<statamic:nocache>…</statamic:nocache>`
  or `@nocache('partial')`. With full measure, `nocache` relies on JavaScript.
  <https://statamic.dev/tags/nocache>

## Eloquent driver

- The driver moves repositories to the database per type: collections,
  entries, navs, taxonomies, blueprints/fieldsets, globals, … ; a site may keep
  configuration (e.g. `collections`) flat and only `entries` in the database.
  Views are not a repository: templates stay files.
  <https://statamic.dev/knowledge-base/tips/storing-content-in-a-database>
- So with `collections` on `eloquent`, `template:`/`mount:`/`route:` are set
  in the Control Panel; with `entries` on `eloquent`, the listing page entry is
  created in the CP. This matches the spec's Eloquent rule.

## Phase 2 (checked 2026-10-26)

### Search

- Results: Antlers `{{ search:results index="default" }}` with `{{ if no_results }}`;
  Blade `<statamic:search:results index="default" as="results">` with
  `@forelse … @empty`. The query parameter is `q` (`get:q`, `get('q')`).
  A plain `<form action="/search">` with `<input type="search" name="q">`
  posts to the page that holds the results tag.
  <https://statamic.dev/frontend/search>, <https://statamic.dev/tags/search>
- Indexes in `config/statamic/search.php`: `driver` (`local`), `searchables`
  (`content`, `collection:*`, `collection:news`, `taxonomy:…`, …), `fields`
  (default index only `title`), per-site with `sites`. Update with
  `php please search:update [name|--all]`.
- With static caching, `?q=` is ignored by default (see Static caching): the
  results part needs `nocache`, or the URL excluded, or the query string
  allowed.

### Error pages

- Statamic renders `resources/views/errors/{status}.antlers.html` (404 for
  unhandled routes); `errors/layout.antlers.html` overrides the layout for
  errors. 5xx templates are not injected into a layout.
  <https://statamic.dev/content-modeling/routing>
- Not in the docs: without `errors/layout`, an Antlers 404 uses the default
  `layout`; a Blade 404 (`errors/404.blade.php`) `@extends` the site layout
  like any Blade template.

### SEO and sitemaps

- Statamic core has no SEO meta or sitemap. SEO Pro (first-party addon) sets
  meta, Open Graph and Twitter data and generates `sitemap.xml`; other addons:
  Advanced SEO, Aardvark SEO, SEOtamic. Without an addon, meta tags come from
  the site's own fields and templates.
  <https://statamic.dev/knowledge-base/from-wordpress-to-statamic>
- A hand-made sitemap is a route plus template:
  `Route::statamic('sitemap.xml', 'sitemap', ['content_type' => 'xml'])`
  (`'xml'` → `text/xml`). Not in the docs: pass `'layout' => null` so the
  HTML layout is not wrapped around the XML.
  <https://statamic.dev/content-modeling/routing>

### Language switcher

- `{{ locales }}…{{ /locales }}` lists the current entry's sites: `permalink`,
  `url`, `locale:name`, `locale:short`, `is_current`, `exists` (false when not
  localized or a draft); `self="false"` leaves the current one out;
  `all="true"` lists every site and falls back to the site URL when the entry
  is missing. Blade: `<s:locales>` with `$locale['permalink']`,
  `$locale['name']`. Sites are configured in `resources/sites.yaml`.
  <https://statamic.dev/tags/locales>
