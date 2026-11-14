# Changelog

Releases ship when `version` in `.claude-plugin/plugin.json` changes.

## 0.5.0 — 2026-11-14

- A plugin icon (1254 × 1254 PNG) in the plugin manifest folder, for the
  listing in plugin directories. No change to what the plugin does.

## 0.4.5 — 2026-11-14

- README: a note that this is an independent plugin, not affiliated with
  Statamic, that it is built for Claude Code in a local project, and a new
  "What it runs and what it accesses" section: no network access, no stored
  data, mods only read, and the one local `php` process `yaml-check` starts.
  No change to what the plugin does.

## 0.4.4 — 2026-11-14

- The public repo now holds only the files that ship: the manifest, hooks,
  mods, skills, agent, README, CHANGELOG and LICENSE. Evals, design docs,
  tests and development scripts are no longer published. No change to what
  the plugin does.

## 0.4.3 — 2026-11-13

- Development: `tsconfig.json` allows `.ts` import paths (which the hooks
  engine requires), so a strict `tsc` check of the mods, hooks and tests
  passes. No change to what ships.

## 0.4.2 — 2026-11-13

- Development: a root `tsconfig.json` that extends the generated plugin types,
  so editors resolve the `claude-code` imports in the mods; local Claude Code
  settings are ignored by git. No change to what ships.

## 0.4.1 — 2026-11-13

- README: new "What you can do" overview, components split into skills,
  agents and mods, and descriptions checked against what the plugin does.

## 0.4.0 — 2026-11-13

- Edition check: project detection reads `config/statamic/editions.php`
  (and `STATAMIC_PRO_ENABLED` in `.env`). On Statamic Core, `users` stops
  before writing roles or groups and `forms` stops before a second form; both
  explain how to enable Pro and ask how to proceed.
- `forms`: file uploads. Picks `files` (email-only, deleted after sending) or
  `assets` (kept in a container), limits size with `max_filesize` (in KB)
  rather than `max:` (which counts files), sets `attachments: true`, and adds
  `enctype="multipart/form-data"` to hand-written forms.
- `forms`: email templates. View names in dot notation, the variables a
  view gets, Markdown mails in Blade with nothing indented, and the reserved
  `message` handle (shown through `fields` instead).
- `forms`: submitting without a page reload — plain `fetch` (the form's
  `FormData` to its action, the `X-Requested-With` header, field errors from
  the 400 response's `error` object) or live validation with Precognition
  through `js="alpine_precognition"`, including the Alpine plugin. The skill
  now also triggers on uploads, email templates, AJAX and live validation.
- `forms`: captchas through the `aryehraber/statamic-captcha` addon, never
  hand-written verification or a new `config/services.php`. New forms are
  added to the addon's `forms` list; keys come from `.env` and are never
  invented.
- `yaml-check` mod: flags `max:`/`min:` above 20 on `assets`/`files` fields,
  where they count files rather than limit size.
- `paired-files` mod: flags a new form that the Captcha addon's `forms`
  list in `config/captcha.php` leaves out.
- New `template-check` mod: flags a hand-written `<form>` with a file input
  but no `enctype="multipart/form-data"`, indented Markdown inside
  `<x-mail::message>`, and `message` output in a form's email view.

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
