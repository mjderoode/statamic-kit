# Project detection

Establish all of the following before planning. Report anything uncertain
instead of guessing.

## 1. Statamic version

- Read `composer.lock` → package `statamic/cms` → `version`.
- No lock file: read `composer.json` → `require["statamic/cms"]` and state that
  the constraint is used, not the installed version.
- Neither mentions `statamic/cms`: this may not be a Statamic project — ask.

## 2. Storage driver (stop condition)

- `statamic/eloquent-driver` installed (lock or `composer.json`) **and**
  `config/statamic/eloquent-driver.php` sets `'driver' => 'eloquent'` under
  `blueprints`, `fieldsets`, `collections` or `taxonomies` → that structure lives
  in the database. Stop (see SKILL.md step 1); write nothing at all.
- Driver installed but only `entries`/`terms`/other content types on `eloquent`
  → blueprints are still files. Continue, and mention it in the plan.

## 3. Paths

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

## 4. Page builders

- Grep blueprints and fieldsets for `type: replicator` and `type: bard` fields
  that have `sets:`.
- Record for each: file, field handle, tab, **inline** (in a blueprint) or
  **fieldset** (pulled into blueprints with `- import: <fieldset>`), the set
  groups (`sets: <group>: { display, sets: … }`) and the sets in each.
- A fieldset-based builder is edited **in the fieldset**, never by copying sets
  into a blueprint.
- More than one candidate → stop and ask (SKILL.md step 2).

## 5. Template dispatch

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

## 6. Conventions

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
