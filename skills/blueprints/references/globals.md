# Globals

A global set is three things. Find the existing sets first and mirror them.

| Part | Default path | Holds |
|---|---|---|
| Set config | `content/globals/<handle>.yaml` | `title:` (and site settings on multisite) |
| Blueprint | `resources/blueprints/globals/<handle>.yaml` | The fields, same shape as any blueprint |
| Values | `content/globals/<site>/<handle>.yaml` | The field values, top-level keys (no `data:` wrapper) |

- `<site>` is the site handle; a single-site install uses `default`. Multisite
  sites are listed in `resources/sites.yaml`.
- `content/globals` can be moved via `stores.globals.directory` and
  `stores.global-variables.directory` in `config/statamic/stache.php`
  (**Project detection** §3).

## Adding a field to an existing set

Edit only the blueprint. Never touch the values file: existing values must stay
exactly as they are, and a new field simply starts empty.

## Creating a new set

1. Create the set config with a `title`.
2. Create the blueprint under `resources/blueprints/globals/` with the same
   handle.
3. Create an empty values file per site only if existing sets have one, at the
   same path pattern.
4. Handles must match across all files.

## Template usage — include it in the summary

Show how to output the new field, in the project's own style:

- **Antlers:** `{{ <set>:<field> }}`, e.g. `{{ contact:opening_hours }}`; loop a
  grid with `{{ <set>:<field> }}…{{ /<set>:<field> }}`.
- **Blade:** check how the project already reads globals (a helper class, a view
  composer, `GlobalSet::findByHandle('<set>')->inCurrentSite()`, …) and use the
  same route; don't introduce a new one.
