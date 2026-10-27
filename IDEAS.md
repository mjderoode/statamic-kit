# Ideas

Parked ideas for the kit, in the order of a site's life cycle. The kit now
covers structure (blueprints, forms, users) and template review; the gaps are
before and after that: building pages, extending in PHP, debugging, upgrades
and deploys.

Every new area gets its own skill with a narrow description (see the roadmap
in `CLAUDE.md`), and every agent needs a skill that dispatches it.

## Suggested order

1. ~~**`templates` skill**~~ — built 2026-10-26/27 (both phases).
2. **`troubleshoot` skill + "Make it visible" toast** — small, felt daily.
3. **`extend` skill** — covers the PHP side.
4. Then `blueprint-reviewer`, `upgrade` and `deploy`.

## 1. Site setup

- **`setup` skill**: set up a new site — starter kit choice, Antlers or Blade,
  Tailwind/Vite, `sites.yaml` for multisite, the first collections and a
  layout.
- **Config skill** for what no skill covers yet: Glide presets
  (`config/statamic/assets.php`), search indexes, static caching, revisions,
  collection routes and mounts, preview targets.

## 2. Templates and pages

**Built 2026-10-26/27** (`skills/templates/`, plan
`docs/plans/2026-10-26-statamic-kit-templates.md`): listing and detail pages,
taxonomy term pages, navigation, breadcrumbs, the responsive image partial,
search results, 404, SEO meta, sitemap and language switcher.

Original idea:

The kit only writes partials for page-builder sets. A **`templates`** (or
`pages`) skill would build the rest:

- Listing and detail pages: `{{ collection:news paginate }}`, pagination,
  filtering by taxonomy.
- Taxonomy term archive pages.
- Navigation partials with children, breadcrumbs, a language switcher.
- A reusable responsive image partial (Glide + `srcset`).
- Search results page, 404 page, SEO meta and a sitemap.

## 3. Extending Statamic in PHP

An **`extend`** skill that uses `php please make:*` and follows the site's
conventions:

- Custom tags and modifiers.
- Fieldtypes, actions, scopes and filters.
- Listeners (`EntrySaved` etc.), computed values, dictionaries.
- Custom routes and controllers, plus Pest tests for all of the above.

## 4. Editor experience in the CP

A read-only **`blueprint-reviewer`** agent, the counterpart of the template
reviewer. It checks blueprints for missing `instructions` and `display` names,
field widths, tabs and sections, `listable` columns and missing validation.
Runs after `blueprints`, the way the template reviewer runs after a template is
written.

## 5. Content

- **Import and migration**: WordPress, CSV or an old site into entries.
- **Refactors**: move an inline page builder into a fieldset, turn a
  Replicator into Bard sets, rename a field across every template and every
  content file that uses it.

## 6. Debugging

A **`troubleshoot`** skill for "my change does not show up" and Antlers
errors. It walks the usual causes: Stache, static cache, Glide cache or view
cache; Vite not built; wrong template or layout; `nocache`. Ties in with the
"Make it visible" toast under Mods.

## 7. Performance and SEO

A read-only **audit agent** that looks for nested collection tags (N+1),
missing static caching, images without Glide, heading order, missing alt text,
and meta/OG tags.

## 8. Upgrades and deploys

- **`upgrade`** skill: Statamic 4→5→6 (and Laravel) with the official upgrade
  guide as a checklist. Rare, but saves a lot of time when it comes up.
- **`deploy`** skill: a Forge/Ploi deploy script (`stache:warm`,
  `static:warm`, `search:update`), an `.env` checklist and Statamic Git
  automation. Also the move to the Eloquent driver (`eloquent:import-*`).

## 9. Mods

The first two picked (a paired-files guard and a YAML check after blueprint
edits) are built in `mods/`.

### Handle check (new)

After a template edit, report any `{{ field }}` or `$field` that is not in the
blueprint. A quick, cheap version of what the template reviewer does.

### Hard Eloquent stop (hook before an edit)

The skills already stop on sites that keep blueprints or collections in the
database (Eloquent driver), but only because their instructions say so. A hook
on `Write`/`Edit` that refuses writes to blueprint YAML when
`config/statamic/eloquent-driver.php` sets the driver to `eloquent` would make
that stop hold even when no skill fired.

### "Make it visible" toast

After a template or content change, show a toast when:

- static caching is on (`config/statamic/static_caching.php` strategy is not
  `null`): suggest `php please static:clear`;
- a template gained Tailwind classes while the Vite dev server is not running
  (no `public/hot`): suggest a build.

Both are common causes of "my change does not show up".

### Status line

Show what kind of Statamic project the session is in: Statamic version (from
`composer.lock`), single or multisite, flat-file or Eloquent driver, and
whether static caching is on.

### Page builder pane

A live pane listing the page builder's groups and sets, with a mark for each
set that has (or lacks) its partial. Related to the deferred
`blueprint-mapper` agent in `CLAUDE.md`: on large builders it would give the
same overview without reading the whole blueprint into context.
