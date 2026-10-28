# statamic-kit

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

## Components

| Component | What it does |
|---|---|
| `/statamic-kit:blueprints` | Creates and edits blueprints, fieldsets, collections, taxonomies, global sets, navigations and page-builder blocks, including the block's Antlers or Blade partial, by detecting and following the project's existing pattern. Presents a plan and waits for approval before writing. |
| `/statamic-kit:forms` | Creates and edits forms: config (storage, honeypot, email), blueprint with validation, and the Antlers or Blade front-end template, following the project's existing forms. Same plan-and-approve flow. |
| `/statamic-kit:users` | Creates and edits user roles and groups with Statamic's exact permission strings and their parent chain (e.g. `access cp` → `view` → `edit`), asking when a request names a collection or role that does not exist. Same plan-and-approve flow. |
| `/statamic-kit:templates` | Builds page templates — collection overview pages with pagination, detail pages, taxonomy term pages, navigation with dropdowns, breadcrumbs, a responsive image partial, a search page, a 404 page, SEO meta tags, an XML sitemap and a language switcher — on the site's own layout, partials and components, and wires them to existing collections (`template:`, `mount:`, the listing page entry). Stops when a page needs a field or collection that does not exist and offers `blueprints` instead. Leaves meta and sitemaps to an installed SEO addon. Same plan-and-approve flow. |
| `/statamic-kit:template-review` | Reviews an Antlers or Blade block, form or page template on request by handing it to the agent below, and relays the report. Changes nothing. |
| `statamic-kit:template-reviewer` (agent) | Read-only review of set, form and page templates against the site's own blueprints and sibling templates: field handles, robustness, escaping, headings and focus, form labels/errors/old input/honeypot, missed site helpers. Findings by severity, plus a separate **Bad practice** list for weaknesses the whole site shares. Runs automatically after `blueprints`, `forms` or `templates` writes a template. |

| `yaml-check` (mod) | After Claude writes or edits Statamic YAML, parses it with the site's own Symfony YAML parser (the one Statamic uses) and reports parse errors and duplicate field or set handles back to Claude. Needs `php` and the site's `vendor/`; silent without them. |
| `paired-files` (mod) | After a write, reports a new page-builder set without a partial (in the folder its sibling sets use), a new partial with no matching set, and a form config without its blueprint or the other way round. |

The skill also triggers on plain requests such as "add an FAQ block to the page
builder" or "create a collection for vacancies".

Works standalone from your project files — no Composer package needed. Runs fine
alongside [Statamic Boost](https://statamic.com/addons/chrisvasey/statamic-boost).
Sites that store blueprints or collections in the database (Eloquent driver) are
detected and not edited.

## Layout

| Folder | Holds | Loaded as |
|---|---|---|
| `skills/<name>/SKILL.md` | Skills and slash commands (`/statamic-kit:<name>`) | Auto-discovered |
| `agents/<name>.md` | Subagents (`statamic-kit:<name>`) | Auto-discovered |
| `mods/<name>.ts` | Mods: panes, status line, hooks on tool calls/prompts | Imported and called by name in `hooks/register.ts` |

A plugin has exactly one hooks module (`hooks/hooks.json` → `hooks/register.ts`),
so every mod is a small `Register`-shaped function that `register.ts` imports and calls
by name (the engine only accepts statically named calls).

## Development

```sh
claude plugin validate .
python3 scripts/inline-references.py --check
claude --plugin-dir .
claude plugin eval . --scaffold --allow-tools Bash Write Edit
claude plugin test .
```

Mod tests live in `tests/` and run against an in-memory site.

Eval cases live in `evals/` and run against synthetic fixture projects in
`evals/fixtures/`; see `evals/RESULTS.md` for the latest scores.

The references each skill always needs are copied into its `SKILL.md`
(Claude Code loads `SKILL.md` without a permission check; a separate reference
file outside the user's project would need approval). Edit `references/*.md`,
then run `python3 scripts/inline-references.py`.
