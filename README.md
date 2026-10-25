# statamic-kit

All-in-one Statamic toolkit for Claude Code.

## Install

Not published to a marketplace yet. Load it from a local clone:

```sh
git clone <this repo> statamic-kit
claude --plugin-dir /path/to/statamic-kit
```

## Components

| Component | What it does |
|---|---|
| `/statamic-kit:blueprints` | Creates and edits blueprints, fieldsets, collections, taxonomies, global sets, navigations and page-builder blocks, including the block's Antlers or Blade partial, by detecting and following the project's existing pattern. Presents a plan and waits for approval before writing. |
| `/statamic-kit:forms` | Creates and edits forms: config (storage, honeypot, email), blueprint with validation, and the Antlers or Blade front-end template, following the project's existing forms. Same plan-and-approve flow. |
| `/statamic-kit:users` | Creates and edits user roles and groups with Statamic's exact permission strings and their parent chain (e.g. `access cp` → `view` → `edit`), asking when a request names a collection or role that does not exist. Same plan-and-approve flow. |
| `/statamic-kit:template-review` | Reviews an Antlers or Blade block or form template on request by handing it to the agent below, and relays the report. Changes nothing. |
| `statamic-kit:template-reviewer` (agent) | Read-only review of set and form templates against the site's own blueprints and sibling templates: field handles, robustness, escaping, headings and focus, form labels/errors/old input/honeypot, missed site helpers. Findings by severity, plus a separate **Bad practice** list for weaknesses the whole site shares. Runs automatically after `blueprints` or `forms` writes a template. |

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
```

Eval cases live in `evals/` and run against synthetic fixture projects in
`evals/fixtures/`; see `evals/RESULTS.md` for the latest scores.

The references each skill always needs are copied into its `SKILL.md`
(Claude Code loads `SKILL.md` without a permission check; a separate reference
file outside the user's project would need approval). Edit `references/*.md`,
then run `python3 scripts/inline-references.py`.
