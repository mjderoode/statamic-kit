# Changelog

Releases ship when `version` in `.claude-plugin/plugin.json` changes.

## Unreleased

- Edition check: project detection reads `config/statamic/editions.php`
  (and `STATAMIC_PRO_ENABLED` in `.env`). On Statamic Core, `users` stops
  before writing roles or groups and `forms` stops before a second form; both
  explain how to enable Pro and ask how to proceed.
- `forms`: file uploads. Picks `files` (email-only, deleted after sending) or
  `assets` (kept in a container), limits size with `max_filesize` (in KB)
  rather than `max:` (which counts files), sets `attachments: true`, and adds
  `enctype="multipart/form-data"` to hand-written forms.

## 0.3.0 — 2026-10-28

- New `templates` skill: collection overview pages with pagination, detail
  pages, taxonomy term pages, navigation with dropdowns, breadcrumbs, a
  responsive image partial, a search page, a 404 page, SEO meta tags, an XML
  sitemap and a language switcher — built on the site's own layout and
  partials, and wired to existing collections. Leaves meta and sitemaps to an
  installed SEO addon.
- `template-reviewer` now also reviews page templates, and runs after
  `templates` writes one.

## 0.2.0 — 2026-10-26

- New mods: `yaml-check` (parses Statamic YAML with the site's own parser
  after each write and reports parse errors and duplicate handles) and
  `paired-files` (a set without a partial, a partial without a set, a form
  config without its blueprint).
- Fixes from the first real-site QA round (Antlers, flat file): all
  `blueprints` references are inlined, so no plugin file needs a permission
  prompt; the reviewer always opens the dispatcher and layout, and rates
  echoed old input in an Antlers form as should-fix; `forms` reviews the
  site's generic form template when a new form is rendered by it.

## 0.1.0 — 2026-10-25

- Skills `blueprints` (blueprints, fieldsets, collections, taxonomies, global
  sets, navigations, asset containers, the user blueprint, page-builder
  blocks), `forms`, `users` (roles and groups) and `template-review`.
- Agent `template-reviewer`: read-only review of set and form templates.
- Every writing skill presents a plan and waits for approval; sites that
  keep structure in the database (Eloquent driver) are detected and not
  edited.
