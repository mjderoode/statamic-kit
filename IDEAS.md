# Ideas

Mod ideas that are parked for later. The two picked first (a paired-files guard
and a YAML check after blueprint edits) are being built in `mods/`.

## Hard Eloquent stop (hook before an edit)

The skills already stop on sites that keep blueprints or collections in the
database (Eloquent driver), but only because their instructions say so. A hook
on `Write`/`Edit` that refuses writes to blueprint YAML when
`config/statamic/eloquent-driver.php` sets the driver to `eloquent` would make
that stop hold even when no skill fired.

## "Make it visible" toast

After a template or content change, show a toast when:

- static caching is on (`config/statamic/static_caching.php` strategy is not
  `null`): suggest `php please static:clear`;
- a template gained Tailwind classes while the Vite dev server is not running
  (no `public/hot`): suggest a build.

Both are common causes of "my change does not show up".

## Status line

Show what kind of Statamic project the session is in: Statamic version (from
`composer.lock`), single or multisite, flat-file or Eloquent driver, and
whether static caching is on.

## Page builder pane

A live pane listing the page builder's groups and sets, with a mark for each
set that has (or lacks) its partial. Related to the deferred
`blueprint-mapper` agent in `CLAUDE.md`: on large builders it would give the
same overview without reading the whole blueprint into context.
