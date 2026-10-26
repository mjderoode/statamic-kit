---
name: templates
description: This skill should be used when the user asks to build or change a Statamic page template — an overview or listing page for a collection, a detail (show) page for its entries, a page per taxonomy term, the main or footer navigation, a menu with dropdowns, breadcrumbs, or a reusable responsive image partial — "build an overview page for the news", "make the detail page for vacancies", "add a page per topic", "build the main navigation with dropdowns", "add breadcrumbs", "make a responsive image partial", or Dutch phrasing such as "maak een overzichtspagina voor het nieuws" or "bouw het hoofdmenu". Applies to Statamic sites with Antlers or Blade templates. Creating or changing blueprints, fields, collections or taxonomies is the blueprints skill.
---

# Statamic templates

Build page templates — listings, detail pages, taxonomy term pages,
navigation, breadcrumbs, image partials — **the way this site already does
it**, and wire them to the existing structure so Statamic actually uses them.

The references this skill needs are inlined at the end of this file
(**Inlined references**); the sections named in bold below are there. Do not
read reference files from the plugin folder — they are all inlined.

## Workflow

### 1. Detect

Follow **Project detection** (inlined below) for the Statamic version, moved
paths and the Eloquent driver. Then read:

- the layout (`layout.antlers.html`, or the Blade layout the page templates
  `@extends`) and two or three existing page templates — the template
  language is theirs, not a guess from the file tree;
- partials and components the new page can reuse (cards, teasers, image
  components, nav partials);
- the collection config (`route:`, `mount:`, `template:`, `layout:`,
  `taxonomies:`) and the blueprint(s) of the entries the page shows — every
  field the template outputs must exist there;
- `config/statamic/static_caching.php` (`strategy`, `ignore_query_strings`)
  and `resources/sites.yaml` (multisite).

**Eloquent driver.** For this skill, this replaces the Eloquent stop in
**Project detection**: templates are files and can still be written.
- **Collections in the database:** YAML wiring has no effect. Write the
  template and tell the user which collection setting (`template:`,
  `mount:`) to set in the Control Panel. Write no YAML.
- **Blueprints in the database:** you cannot see the field handles. Plan the
  template and ask for the handles (or read them with `php artisan tinker`
  when the app runs) before writing it.
- **Only entries in the database:** collection YAML still works. Wire
  `template:` and `mount:` as usual; the listing page entry is created in the
  Control Panel.

### 2. Stop on missing structure or real ambiguity

Ask, and change no files (by any tool) until answered, when:

- **The page needs structure that does not exist**: a collection, taxonomy,
  navigation or a field (e.g. an author, an excerpt, a SEO title). Say what is
  missing and offer to add it first with the `blueprints` skill. Never add a
  field to a blueprint from this skill, and never output a variable that is not
  a blueprint field or a Statamic system variable. This holds even when the
  request pre-approves the plan: the user approved a template, not new
  structure.
- **Several collections, navigations or layouts** could be meant. Name them
  and recommend one.

### 3. Present the plan — hard gate

Present, before any edit:

- every file to create and every file to change;
- every wiring line (**Page wiring** below): `template:`, `mount:`, `route:`,
  the listing page entry and its place in the pages tree, a
  `Route::statamic(...)` line;
- **URLs that change**: a new or edited `route:` changes the URL of every
  existing entry — list them (or the pattern, old → new) and ask about
  redirects;
- an outline of each template: which fields it outputs, what it reuses, its
  empty state, pagination;
- the static-caching consequence for anything that varies per request
  (query-string filters, pagination when query strings are ignored);
- the conventions being followed ("reuses `partials/card` like the home
  page", "`@extends('layouts.default')` like `page.blade.php`").

Then **stop and wait for approval. Do not create or change any file in the
same turn as the plan — not with Write or Edit, and not through Bash (`cat >`,
`sed -i`, `tee`, …)** unless the user's request explicitly pre-approves it
(e.g. "I approve your plan in advance", "go ahead without waiting"). Without
such words, the turn ends with the plan and a question. A wrong mount or route
breaks live URLs, so the user sees the change first.

### 4. Write

- Model each new template on its closest sibling: same wrapper, classes,
  heading pattern, comment style and empty-field guards. Reuse the site's
  partials and components instead of writing new markup for the same thing.
- Antlers templates are injected into the layout's `{{ template_content }}`
  and never repeat `<html>`/`<head>`/`<body>`. A Blade template ignores the
  Statamic layout and `@extends` the site's Blade layout like its siblings.
- Make minimal edits to YAML and existing templates; keep order,
  indentation, comments and quote style.
- Only change files that were in the plan.

### 5. Verify

- Every touched YAML file parses (PHP with the project's `vendor/autoload.php`
  and `Symfony\Component\Yaml\Yaml::parseFile()`, else `ruby -ryaml`, else
  `python3` with `yaml`).
- Each new template is where the collection, entry or taxonomy setting
  resolves (**Page wiring**); a `mount:` id matches the listing entry's `id`.
- Every variable in the new templates is a field of the blueprint or a
  Statamic system variable.
- If a runtime check is possible (`php` and `vendor/` exist), render the URL
  with `php artisan tinker` or a request; otherwise report **"runtime check
  not run"** and why. Never report an unrun check as verified.

**Template review** (only if this run wrote or changed a template; a
YAML-only change skips it)
- Dispatch the read-only reviewer: Agent tool with
  `subagent_type: "statamic-kit:template-reviewer"`, giving the template
  path(s), the collection (or taxonomy, or navigation) handle and the
  blueprint path(s) of the entries the page shows.
- Fix small **must-fix** findings yourself, only in files that were in the
  approved plan, then dispatch the reviewer once more at most. Anything
  larger, or in another file, becomes a question for the user — never edit a
  file outside the plan.
- Never fix **Bad practice** items (weaknesses the template shares with the
  rest of the site): list them under a heading named exactly `Bad practice`
  for a site-wide decision.
- List the **should-fix** findings and suggestions and offer to apply them;
  do not apply them unasked.

End with a summary: what was created and changed, the URLs where the pages
appear, anything the user must still do (Control Panel settings, redirects,
a cache clear when static caching is on), and a **Template review**
section: what the reviewer found, what you changed, the should-fix items you
offer, and the `Bad practice` list — or that it came back clean. Never leave
it out.

## Page wiring

Facts checked against the Statamic 6 docs.

- **Template resolution.** An entry's `template:` beats its collection's
  `template:`. `template: '@blueprint'` resolves to
  `resources/views/{collection}/{blueprint}`, remappable per collection with
  `blueprint_templates` in `config/statamic/system.php`. Without any setting
  the collection uses `default`. Values are paths below `resources/views`
  without extension.
- **Listing pages.** Statamic never creates a listing page. Use an entry at
  the listing URL (usually in `pages`, added to its tree) with its own
  `template:`, and set `mount:` on the collection to that entry's `id`; or a
  `Route::statamic('/news', 'news/index')` line when the site defines pages in
  `routes/web.php`.
- **Pagination.** Antlers: `{{ collection:news paginate="10" as="posts" }}`
  with `{{ if no_results }}` and the `{{ paginate }}` pair (`prev_page`,
  `next_page`, `auto_links`). Blade: `<s:collection:news paginate="10"
  as="posts">` with `$no_results` and `$paginate['next_page']`. Pages are
  `?page=x`.
- **Taxonomy term pages** exist only when the view exists:
  `{taxonomy}/show` serves `/{taxonomy}/{term}`; `{collection}/{taxonomy}/show`
  serves `/{collection-url}/{taxonomy}/{term}`, and that collection URL comes
  from its mount. On a term page, the `entries` pair lists its entries.
- **Navigation**: `nav:<handle>` with `children`, `is_current`, `is_parent`;
  recursion with `{{ *recursive children* }}` / `@recursive_children`.
  Breadcrumbs: `nav:breadcrumbs` (`include_home` defaults to true).
- **Images**: the `glide` tag builds each `srcset` URL; inside a `glide` pair
  the asset's fields (`alt`) and `width`/`height` are available.
- **Static caching**: query strings are ignored by default, so `?page=2` or a
  `?location=` filter serves the cached first version. Use `nocache`
  (Blade `<s:nocache>` or `@nocache('partial')`) or allow the query string
  (`ignore_query_strings => false`, `allowed_query_strings`), and say which.
- **Multisite**: links from `url`/`permalink`, never a hard-coded locale
  prefix; `collection` and `nav` tags already scope to the current site.

## Out of scope

Creating or changing blueprints, fieldsets, fields, collections, taxonomies
and navigations (the `blueprints` skill) — except the wiring lines in
**Page wiring** (`template:`, `layout:`, `mount:`, `route:`) when a page
needs them; forms (the `forms` skill);
page-builder set partials (`blueprints`); styling beyond following existing
markup; JavaScript filtering; controllers and PHP beyond a `Route::statamic`
line.

<!-- BEGIN INLINED REFERENCES: generated by scripts/inline-references.py, edit references/ instead -->

## Inlined references

<!-- source: skills/blueprints/references/project-detection.md -->
### Project detection

Establish all of the following before planning. Report anything uncertain
instead of guessing.

#### 1. Statamic version

- Read `composer.lock` → package `statamic/cms` → `version`.
- No lock file: read `composer.json` → `require["statamic/cms"]` and state that
  the constraint is used, not the installed version.
- Neither mentions `statamic/cms`: this may not be a Statamic project — ask.

#### 2. Storage driver (stop condition)

- `statamic/eloquent-driver` installed (lock or `composer.json`) **and**
  `config/statamic/eloquent-driver.php` sets `'driver' => 'eloquent'` under
  `blueprints`, `fieldsets`, `collections` or `taxonomies` → that structure lives
  in the database. Stop (see SKILL.md step 1); write nothing at all.
- Driver installed but only `entries`/`terms`/other content types on `eloquent`
  → blueprints are still files. Continue, and mention it in the plan.

#### 3. Paths

| What | Default location |
|---|---|
| Collection blueprints | `resources/blueprints/collections/<collection>/<blueprint>.yaml` |
| Taxonomy (term) blueprints | `resources/blueprints/taxonomies/<taxonomy>/<blueprint>.yaml` |
| Globals / forms / assets / user blueprints | `resources/blueprints/globals/`, `forms/`, `assets/`, `user.yaml` |
| Fieldsets | `resources/fieldsets/<handle>.yaml` |
| Collection config | `content/collections/<handle>.yaml` |
| Taxonomy config | `content/taxonomies/<handle>.yaml` |
| Navigation config / tree / blueprint | `content/navigation/<handle>.yaml` / `content/trees/navigation/<handle>.yaml` / `resources/blueprints/navigation/<handle>.yaml` (see **Navigation**) |
| Form config / blueprint | `resources/forms/<handle>.yaml` / `resources/blueprints/forms/<handle>.yaml` (forms skill) |
| Asset container config / blueprint | `content/assets/<handle>.yaml` / `resources/blueprints/assets/<handle>.yaml`; its disk in `config/filesystems.php` |
| Global set config / values | `content/globals/<handle>.yaml` / `content/globals/<site>/<handle>.yaml` (see **Globals**) |

These are only defaults. **Always** check the config, even when the default
directories exist (a fresh install leaves `resources/blueprints/user.yaml` and
`default.yaml` behind after the paths are moved):

| Config | Key | Moves |
|---|---|---|
| `config/statamic/system.php` | `blueprints_path` (string, or per-type array like `['default' => …, 'forms' => …]`) | Blueprints |
| `config/statamic/system.php` | `fieldsets_path` | Fieldsets |
| `config/statamic/stache.php` | `stores.collections.directory` | Collection configs (entries live under `stores.entries.directory`) |
| `config/statamic/stache.php` | `stores.taxonomies.directory` | Taxonomy configs |
| `config/statamic/stache.php` | `stores.navigation.directory`, `stores.nav-trees.directory` | Navigation configs and trees |
| `config/statamic/forms.php` | `forms` | Form configs |
| `config/statamic/stache.php` | `stores.asset-containers.directory` | Asset container configs |
| `config/statamic/stache.php` | `stores.globals.directory`, `stores.global-variables.directory` | Global set configs and values |

Resolve `base_path(...)` / `resource_path(...)` to project-relative paths and use
those for every read and write. Mention moved paths in the plan.
- A collection uses a taxonomy via `taxonomies: [<handle>]` in its collection
  config; entries link terms with a `terms` field.

#### 4. Page builders

- Grep blueprints and fieldsets for `type: replicator` and `type: bard` fields
  that have `sets:`.
- Record for each: file, field handle, tab, **inline** (in a blueprint) or
  **fieldset** (pulled into blueprints with `- import: <fieldset>`), the set
  groups (`sets: <group>: { display, sets: … }`) and the sets in each.
- A fieldset-based builder is edited **in the fieldset**, never by copying sets
  into a blueprint.
- More than one candidate → stop and ask (SKILL.md step 2).

#### 5. Template dispatch

Find where the builder field is rendered, to learn the template language and the
path a new partial needs:

- **Antlers:** `{{ <field> }} … {{ partial src="<dir>/{type}" }} … {{ /<field> }}`
  → partials at `resources/views/<dir>/<set>.antlers.html`.
- **Blade:** a loop over the field rendering
  `<x-dynamic-component :component="'<prefix>.'.$block['type']" …>`
  → anonymous components at `resources/views/components/<prefix>/<set>.blade.php`
  (dots in the prefix are directories).
- Anything else (`@include("blocks.{$type}")`, a custom tag, a view composer):
  describe it in the plan and follow it, or ask if unclear.

The template language is that of the dispatching template and the sibling
partials, not a guess from the file tree.

#### 6. Conventions

- **CP label language:** read existing `display:` values. New labels use that
  language **regardless of the language of the user's request**.
- **Handles:** match existing style (Statamic's norm is snake_case).
- **Set metadata:** add `icon:` / `instructions:` only if sibling sets have them.
- **Ordering:** obey rules stated in YAML comments (e.g. "keep sets alphabetical");
  otherwise append at the end of the group.
- **Closest sibling partial:** note its wrapper element, empty-field guards and
  comment style; the new partial copies them.
- **Existing handles:** if the requested set or field handle already exists, say
  so and offer to extend it.

<!-- END INLINED REFERENCES -->
