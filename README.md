# Statamic Kit

All-in-one Statamic toolkit for Claude Code.

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

Works from your project files alone: no Composer package, no setup.

## Components

### Skills

| Skill | What it does |
|---|---|
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
