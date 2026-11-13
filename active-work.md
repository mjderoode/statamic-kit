# Active work

## Where we are (2026-11-13)

Items 1 and 2 are done and merged to `main` (full suite 90/90 on
2026-11-12/13). **Next session: start with item 3.**

How we work, briefly:

- RED → fix → GREEN per sub-item: new cases with `--runs 1` for RED,
  `--runs 3` for GREEN, one `--case` per invocation, at most 3 in parallel.
- **Ask before running the full suite** (it costs a lot of usage).
- Prefer graders that check files (`regex` on a path, or `llm` with
  `focus: { source: file, path: … }`); the default Haiku judge is unreliable
  on long rubrics over the transcript. Give a prompt a fixed path when the
  file location is not what is being tested.
- Work on a branch; log every round in `evals/RESULTS.md` and every change
  under "Unreleased" in `CHANGELOG.md`. Releasing = bump `version` in
  `plugin.json`, move "Unreleased" to that version.
- Usage-limit or auth stops are infrastructure: rerun just those runs.

The list we work from now, top to bottom. Tick an item when it is committed;
move longer-term ideas to `IDEAS.md`. Every item follows the RED → fix →
GREEN loop in `CLAUDE.md` (full suite only after asking).

1. [x] **Pro edition check.** (done 2026-10-28) Roles and groups, multisite, revisions and the
   REST/GraphQL API are Pro features, but no skill reads
   `config/statamic/editions.php`. On a Solo site `users` writes roles that
   do nothing. Add the edition to project detection and stop or warn when a
   request needs Pro. Small; one or more RED cases.
2. [x] **Forms extensions.** (done 2026-11-12)
   - [x] File uploads (done 2026-10-28): `files` vs `assets`, `max_filesize`
     instead of `max:`, `attachments: true`, `enctype` on hand-written forms.
   - [x] Mods for the same mistakes (done 2026-10-28): `yaml-check` flags
     size-like `max:`/`min:` on upload fields; new `template-check` flags a
     file input in a `<form>` without `enctype`.
   - [x] HTML template for the notification email (done 2026-10-28):
     view names, variables, Markdown in Blade without indentation, the
     reserved `message` handle; `template-check` flags the last two.
   - [x] Submitting without a page reload (done 2026-10-28): plain `fetch`
     (FormData to the form's action, `X-Requested-With`, 400 with `error`
     per field) and Precognition through `js="alpine_precognition"`.
   - [x] Captcha (done 2026-11-12): the `aryehraber/statamic-captcha` addon
     instead of hand-written verification; new forms added to its `forms`.
   - [x] Mod (done 2026-11-12): `paired-files` flags a new form left out of
     the Captcha addon's `forms` list.
3. [ ] **Live preview and redirects.** ← next Preview targets per collection, and
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
