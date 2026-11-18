# Statamic Kit

All-in-one Statamic toolkit for Claude Code.

An independent community plugin: not made, endorsed or supported by the makers
of Statamic. "Statamic" is their trademark and is used here only to say which
CMS the plugin works with.

Built for Claude Code working in a local Statamic project; the skills and
mods read and write that project's files, so they do little in a chat without
one.

**Platforms:** built and tested on macOS. The skills and the agent work
anywhere Claude Code runs. The mods expect `/` paths, so on native Windows
they stay silent (they find no project and report nothing). The `setup`
skill runs a bash script and needs `bash` and `perl`, so on Windows use WSL.

## Install

From the [mitsol-labs](https://github.com/mjderoode/mitsol-labs) marketplace:

```
/plugin install statamic-kit --marketplace mjderoode/mitsol-labs
```

Or add the marketplace first and install by name:

```
/plugin marketplace add mjderoode/mitsol-labs
/plugin install statamic-kit@mitsol-labs
```

### Auto-update

Claude Code doesn't auto-update third-party marketplaces unless you turn it
on. Either run `/plugin`, open the **Marketplaces** tab, select `mitsol-labs`
and choose **Enable auto-update**, or add this to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "mitsol-labs": {
      "source": { "source": "github", "repo": "mjderoode/mitsol-labs" },
      "autoUpdate": true
    }
  }
}
```

For a team, put the same block in the project's `.claude/settings.json` and
commit it. Everyone who opens and trusts the repository gets the marketplace
with auto-update on; each person still installs the plugin once.

With auto-update on, Claude Code checks for a new version in the background
shortly after a session starts. You then see `Plugin updated`, and the next
session (or `/reload-plugins`) loads it. A release is picked up when
`version` in `.claude-plugin/plugin.json` changes.

## What you can do

Ask in plain English or Dutch. The kit reads your site first, follows the
patterns already there (Antlers or Blade, your naming, your folders), shows a
plan, and writes only after you approve.

**New site**

- **Fresh Statamic 6 site** — Antlers, Tailwind 4 + Vite, a page-builder
  skeleton, globals, a main navigation, a contact form, a super user and a
  first commit, on MageBox (`https://<name>.test`) or with `php artisan serve`.

**Content structure**

- **Collections, taxonomies, globals, navigations** — config and blueprints in
  one go, including several entry types per collection.
- **Blueprints and fieldsets** — add or change fields without hand-writing YAML.
- **Page-builder blocks** — a new set plus its Antlers or Blade partial, in one go.
- **Asset containers and the user blueprint** — configured to match the site.

**Forms**

- **Complete forms** — config, validation, front-end template and email.
- **File uploads** — kept as assets or sent as attachments, with correct size limits.
- **Email templates** — plain or Markdown mails that render correctly.
- **No page reload** — AJAX submits or live validation with Precognition.
- **Spam protection** — honeypot and captcha through the Captcha addon.

**Pages**

- **Overview and detail pages** — with pagination, wired to your collections.
- **Navigation and breadcrumbs** — dropdowns included.
- **Search, 404, taxonomy term pages** — built on your own layout and partials.
- **SEO meta, XML sitemap, language switcher** — or left to your SEO addon.
- **Responsive images** — one reusable image partial.

**Users and permissions**

- **Roles and groups** — Statamic's exact permission strings, no guessing.
- **Edition-aware** — stops and explains when roles, groups or a second form
  need Statamic Pro.

**Quality checks, built in**

- **Template review** — field handles, escaping, accessibility and form
  handling checked against your blueprints, after every template it writes or
  on request.
- **YAML check** — parse errors and duplicate handles caught the moment a file
  is saved, using your site's own parser.
- **Missing pieces** — flags a block without a partial, a form without its
  blueprint, a form left out of the captcha config.
- **Common traps** — a file upload without `enctype`, indented Markdown in
  mails, upload limits that count files instead of size.

Works from your project files alone: no Composer package, no setup. (The
`setup` skill is the exception: it installs a new site, see below.)

## Components

### Skills

| Skill | What it does |
|---|---|
| `/statamic-kit:setup` | Creates a new Statamic 6 site from scratch with a bundled scaffolder: Composer install, Antlers, Tailwind 4 + Vite (built once), a page-builder blueprint with block partials, a home page, globals, a main navigation, a contact form, a super user and a first git commit on `main`. Uses MageBox (`https://<name>.test`, mail to Mailpit) when it is installed, otherwise `php artisan serve` on port 8000 with mail to the log. Checks the machine read-only first, presents a plan, asks for the super user's email and password (no default credentials) and runs nothing until you approve. Verifies the result afterwards. Not for changing an existing site. |
| `/statamic-kit:blueprints` | Creates and edits blueprints, fieldsets, collections (including multiple entry blueprints), taxonomies, global sets, navigations, asset containers, the user blueprint and page-builder blocks, including the block's Antlers or Blade partial, by detecting and following the project's existing pattern. Presents a plan and waits for approval before writing. |
| `/statamic-kit:forms` | Creates and edits forms: config (storage, honeypot, email), blueprint with validation, and the Antlers or Blade front-end template, following the project's existing forms. Also covers file uploads, email templates, submitting without a page reload (AJAX or Precognition) and captchas through the Captcha addon. Stops before a second form on Statamic Core. Same plan-and-approve flow. |
| `/statamic-kit:users` | Creates and edits user roles and groups with Statamic's exact permission strings and their parent chain (e.g. `access cp` → `view` → `edit`), asking when a request names a collection or role that does not exist. Stops on Statamic Core, where roles and groups need Pro. Same plan-and-approve flow. |
| `/statamic-kit:templates` | Builds page templates — collection overview pages with pagination, detail pages, taxonomy term pages, navigation with dropdowns, breadcrumbs, a responsive image partial, a search page, a 404 page, SEO meta tags, an XML sitemap and a language switcher — on the site's own layout, partials and components, and wires them to existing collections (`template:`, `mount:`, the listing page entry). Stops when a page needs a field or collection that does not exist and offers `blueprints` instead. Leaves meta and sitemaps to an installed SEO addon. Same plan-and-approve flow. |
| `/statamic-kit:template-review` | Reviews an Antlers or Blade block, form or page template on request by handing it to the `template-reviewer` agent, and relays the report. Changes nothing. |

### Agents

| Agent | What it does |
|---|---|
| `statamic-kit:template-reviewer` | Read-only review of set, form and page templates against the site's own blueprints and sibling templates: field handles, robustness, escaping, headings and focus, form labels/errors/old input/honeypot, missed site helpers. Findings by severity, plus a separate **Bad practice** list for weaknesses the whole site shares. Runs automatically after `blueprints`, `forms` or `templates` writes a template, or on request through `template-review`. |

### Mods

Mods run on their own after Claude writes or edits a file, and report back to
Claude only when they find something.

| Mod | What it does |
|---|---|
| `yaml-check` | After Claude writes or edits Statamic YAML, parses it with the site's own Symfony YAML parser (the one Statamic uses) and reports parse errors, duplicate field or set handles, and `max:`/`min:` used as a size on upload fields (where they count files). Needs `php` and the site's `vendor/`; silent without them. |
| `template-check` | After Claude writes or edits a template, reports a hand-written `<form>` with a file input but no `enctype="multipart/form-data"` (Statamic's own form tag adds it and is never flagged), Markdown indented inside `<x-mail::message>` (renders as code), and `message` output in a form's email view (Laravel's mail object, not the field). |
| `paired-files` | After a write, reports a new page-builder set without a partial (in the folder its sibling sets use), a new partial with no matching set, a form config without its blueprint or the other way round, and a new form missing from the Captcha addon's `forms` list in `config/captcha.php`. |

The skills also trigger on plain requests, in English or Dutch, such as "add
an FAQ block to the page builder", "create a collection for vacancies" or
"build an overview page for the news"; no slash command needed.

Works standalone from your project files — no Composer package needed.
Sites that store blueprints or collections in the database (Eloquent driver) are
detected and not edited.

## What it runs and what it accesses

- **No network access of its own, except `setup`.** The mods, the other
  skills and the agent send, upload and fetch nothing, and call no external
  service or API. The `setup` skill runs Composer and npm, which download
  packages (see below).
- **No data stored.** The plugin keeps no logs, caches or files of its own,
  and collects no personal data.
- **Project files only.** The skills read the Statamic project you have open
  and write to it only after you approve a plan, through Claude Code's normal
  edit permissions. The `template-reviewer` agent can only read (Read, Grep,
  Glob).
- **`setup` runs local tools, only after you approve its plan.** It reads
  `command -v`, `php -v`, `composer --version`, `npm --version` and
  `git --version` first (the script also needs `perl`, and uses `uuidgen`,
  or the system's UUID source or `php` if that is missing), then runs the bundled script
  `skills/setup/scripts/new-statamic.sh` in a new directory it creates
  (`<dir>/<name>`, by default under the current directory):
  `composer create-project` for Statamic 6 (plus `composer show`),
  `php artisan key:generate`, `npm install`, `php please make:user` for the
  super user you chose, `npm run build`, `php please stache:clear`,
  `php please cache:clear`, and `git init` with one commit. It writes the new
  project's files, including `.env` (with a generated
  `APP_KEY`) and a `CLAUDE.md` with the project's conventions. When
  `gh` is installed and signed in it reads its GitHub token (`gh auth token`)
  and hands it to the Composer commands only, through `COMPOSER_AUTH`, for that one run, to avoid
  GitHub rate limits; the token is not written to any file. To check the
  result it runs `php please stache:warm`, uses `lsof` to see whether port 8000 is free and to stop only the server it started (`kill`), makes HTTP
  requests to the new site (`https://<name>.test`, or `http://localhost:8000`) and, without MageBox, starts `php artisan serve`
  on port 8000 for that check only and stops it again. With `--bare` it
  writes a temporary `public/setup-check.txt` with a random token to prove
  the response comes from the new site, and deletes it afterwards.
  **With MageBox, the site is also registered outside the project**
  (`magebox init` and `magebox start`): an nginx vhost, a PHP-FPM pool, local
  TLS certificates under `~/.magebox` and the `.test` domain. `magebox stop`
  removes the vhost and the pool, but not everything: the certificates and a
  line in MageBox's PHP ini file stay behind. It never writes into an
  existing project directory.
- **Mods read, never write.** The mods read project files after Claude
  writes or edits one, and only return text to Claude.
- **One local process.** `yaml-check` runs
  `php ${CLAUDE_PLUGIN_ROOT}/mods/lib/yaml-parse.php` in the project
  folder, with a 15-second timeout. It loads the project's own
  `vendor/autoload.php` so that it can use the site's Symfony YAML parser,
  which means Composer's autoloader and the project's autoloaded files run.
  The helper only parses the YAML it is given and prints the result as JSON;
  it writes no files. If `php` or `vendor/` is missing, the check is skipped
  without a message.

## Layout

| Folder | Holds | Loaded as |
|---|---|---|
| `skills/<name>/SKILL.md` | Skills and slash commands (`/statamic-kit:<name>`) | Auto-discovered |
| `agents/<name>.md` | Subagents (`statamic-kit:<name>`) | Auto-discovered |
| `mods/<name>.ts` | Mods: hooks that check files after Claude writes them | Imported and called by name in `hooks/register.ts` |

A plugin has exactly one hooks module (`hooks/hooks.json` → `hooks/register.ts`),
so every mod is a small `Register`-shaped function that `register.ts` imports and calls
by name (the engine only accepts statically named calls).

See [CHANGELOG.md](CHANGELOG.md) for what changed in each release.

## License

MIT — see [LICENSE](LICENSE).
