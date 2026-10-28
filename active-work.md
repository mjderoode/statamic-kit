# Active work

The list we work from now, top to bottom. Tick an item when it is committed;
move longer-term ideas to `IDEAS.md`. Every item follows the RED → fix →
GREEN loop in `CLAUDE.md` (full suite only after asking).

1. [x] **Pro edition check.** (done 2026-10-28) Roles and groups, multisite, revisions and the
   REST/GraphQL API are Pro features, but no skill reads
   `config/statamic/editions.php`. On a Solo site `users` writes roles that
   do nothing. Add the edition to project detection and stop or warn when a
   request needs Pro. Small; one or more RED cases.
2. [ ] **Forms extensions.**
   - [x] File uploads (done 2026-10-28): `files` vs `assets`, `max_filesize`
     instead of `max:`, `attachments: true`, `enctype` on hand-written forms.
   - [x] Mods for the same mistakes (done 2026-10-28): `yaml-check` flags
     size-like `max:`/`min:` on upload fields; new `template-check` flags a
     file input in a `<form>` without `enctype`.
   - [ ] HTML template for the notification email (`html`/`text` views,
     `markdown: true`).
   - [ ] Submitting without a page reload (AJAX or Precognition).
   - [ ] Spam protection with a captcha addon next to the honeypot.
3. [ ] **Live preview and redirects.** Preview targets per collection, and
   redirects from old URLs after a rebuild or migration. May fold into the
   config skill in `IDEAS.md`.
4. [ ] **Writing content.** No skill writes entries: "put 5 FAQ items on the
   homepage", "create a news item", "fill the footer global". The hard parts
   are Bard's ProseMirror format, replicator data with an `id` and `type` per
   set, the structure tree for pages, and `origin:` for multisite
   localizations. A `content` skill with the same plan-and-approve flow.
5. [ ] **Front end for logged-in users.** Login, register, password reset and
   profile pages (`user:login_form` and friends) and protected pages
   (`protect:`). Fits as phase 3 of `templates`.
6. [ ] **Translatable strings in templates.** On multisite, fixed texts such
   as "Read more" and "Next page" are not run through `lang/` files
   (`{{ trans }}` / `__()`). Both `templates` and the reviewer should pick
   up hard-coded text on a multilingual site.
7. [ ] **Point Eloquent sites somewhere.** The kit stops on Eloquent sites
   but offers nothing after the stop. A short note on the Control Panel steps
   or `php please eloquent:import-*` makes the stop useful.
