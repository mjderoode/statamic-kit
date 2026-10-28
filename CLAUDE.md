# CLAUDE.md

Guidance for Claude Code when working on the `statamic-kit` plugin.

## What this is

An all-in-one Claude Code plugin for building and maintaining Statamic sites.
It bundles three kinds of components:

| Folder | Holds | Loaded as |
|---|---|---|
| `skills/<name>/SKILL.md` | Skills and slash commands (`/statamic-kit:<name>`) | Auto-discovered |
| `agents/<name>.md` | Subagents (`statamic-kit:<name>`) | Auto-discovered |
| `mods/<name>.ts` | Mods: panes, status line, toasts, hooks on tool calls/prompts | Imported and called by name in `hooks/register.ts` |

## Repository

This repo is the plugin itself: `.claude-plugin/plugin.json` sits at the
root, so every path below is relative to the repo root. Until 2026-10-25 the
plugin lived at `plugins/statamic-kit/` in the `claude-plugins` marketplace
repo; it moved here with a fresh history. Design specs and implementation
plans are in `docs/specs/` and `docs/plans/`; plans from before the move use
`plugins/statamic-kit/…` paths, read those as the repo root.

The plugin is listed in the public `mitsol-labs` marketplace
(`mjderoode/mitsol-labs`, a separate repo) with a `url` source on `main`.
To ship a release: bump `version` in `plugin.json` and add an entry to
`CHANGELOG.md`. For development, load it with `claude --plugin-dir .`.

## Status

v0.3.0 (released 2026-10-28). What ships is listed in `README.md` and
`CHANGELOG.md`; eval history is in `evals/RESULTS.md` (last full suite 76/79
on 2026-10-27, misses judge variance).

- Skills: `blueprints` (structure: blueprints, fieldsets, collections incl.
  multiple entry blueprints, taxonomies, globals, navigations, asset
  containers, user blueprint, page-builder blocks), `forms`, `users` (roles
  and groups), `templates` (page templates), `template-review`.
- Agent: `template-reviewer` (read-only; sets, forms and page templates).
- Mods: `yaml-check` and `paired-files`; shared code in
  `mods/lib/statamic.ts`, tests in `tests/mods.test.ts`.

Design decisions that still hold:

- Each new area gets its own skill with a narrow description, rather than
  widening an existing one.
- Agents are not started unasked in Claude Code, so every agent needs a skill
  (or a skill step) that dispatches it.
- Page-builder blocks stay in `blueprints`; revisit only if the skills grow
  too large.

## Next up

1. **QA round on a Blade/Eloquent site** (profile B or C in
   `docs/qa/test-protocol.md`), covering `templates` and the reviewer. Only
   one real-site round has run so far (Antlers flat file, 2026-10-25, before
   `templates` existed). Each finding becomes a RED case or a fix.
2. The next item from the suggested order in `IDEAS.md`.

## Open minors

Not fixed on purpose; pick up when touching that area.

`templates` (phase 1 review):

- The mount/collection-URL rule is stated as a docs fact but is not in the docs.
- Detect does not read `blueprint_templates`.
- No full-measure `nocache` caveat.
- "Blueprint field or system variable" omits tag-provided variables.
- The inlined Project detection §4–5 is noise for `templates`.
- `templates-multisite`'s locale regex checks only the layout.
- `detail-news-antlers/resolves` accepts a new site-wide `default` template.
- `blueprints` has no "not page templates" exclusion; no footer-nav guard case.

Reviewer (final review):

- Review cases still allow Bash (`allowed_tools`); the reviewer itself has no Bash.
- Several "unchanged" graders check one pattern only; `review-missing-file`
  should also assert that the other templates are not reviewed.
- No grader checks that a must-fix was actually applied in the file.
- The input contract for requests without a path ("the quote form") is not
  written down in the agent or the skill.
- The agent's Markdown (`{!! !!}` / `| markdown`) rule is worded too strictly.
- `review-antlers-leak`'s `explains-fallback` judge splits 2–1 on most runs;
  expect an occasional fail without a regression.

## Workflow for every change

RED → fix → GREEN. Write the eval case(s) first and see them
fail, change the skill/agent/reference, see them pass, and log it in
`evals/RESULTS.md`. The full suite costs a lot of usage: **ask the user before
running it**; GREEN on the specific cases is enough to finish an item. Keep client names and local paths out
of fixtures, docs and commits. For bigger work, write a design in
`docs/specs/` and a plan in `docs/plans/` first, and keep a progress
checklist in the plan (a session may be cut off mid-step).

## Caveat: mods must be wired up by name

A plugin has exactly **one** hooks module: `hooks/hooks.json` → `hooks/register.ts`.
Every mod therefore goes through that file.

- Each mod is its own file in `mods/`, exporting a `Register`-shaped function
  (`(on, options) => void`, type imported from `'claude-code'`).
- `hooks/register.ts` must **import each mod and call it by name**:

  ```ts
  import { exampleMod } from '../mods/example-mod.ts'

  export const register: Register = (on, options) => {
    exampleMod(on, options)
  }
  ```

- **Do not** collect mods in an array/registry and loop over them. The engine
  only accepts statically named calls; `claude plugin validate` rejects
  `for (const mod of mods) mod(on, options)` with
  "the callee "mod" is not a function declared at the top of this file".
- No dynamic `import()` — a module containing it does not load.
- Imported files must use a JS/TS suffix (`.ts`, `.tsx`, …); anything else is not loaded.
- State a mod draws from belongs in `$.state` (declared in a `types/index.d.ts`
  contract referenced from `plugin.json` as `"types"`), not in module variables —
  a hot reload resets those.

## Deferred: a read-only mapper agent for large blueprints

On sites with big inline page builders (one real-world `page.yaml` is 440+
lines of Replicator sets) reading blueprints could flood the main context. A
read-only `blueprint-mapper` agent (Read/Grep/Glob) could return a compact map
instead: builder pattern, paths, set groups and sets, naming and language
conventions, template language.

Measured 2026-10-20 (real Statamic 6 Blade site, largest fieldset 345 lines,
13 sets): 41–52k peak context plan-only, 60k executing; skills add about
5–8k, and the big fieldset was read with `grep`/`sed`, not whole. No
pressure — still deferred. Re-measure on a site with 1000+ line blueprints.

## Conventions

- References a skill always needs are inlined into its SKILL.md by
  `scripts/inline-references.py` (reads of plugin files outside the user's
  project need approval). Edit `references/*.md`, never the inlined block.
- Author everything that ships (skills, agents, mods, README, output) in **English**.
- Build against the live spec, not memory: follow the `building-plugins-to-spec`
  skill and the official `plugin-dev` skills; use the `plugin-authoring` skill for mods.
- Prefer `skills/` over legacy `commands/`. Agents need full frontmatter
  (`name`, `description`, `model`, `color`, least-privilege `tools`).
- Use `${CLAUDE_PLUGIN_ROOT}` for intra-plugin paths; kebab-case names throughout.
- Remove a folder's `.gitkeep` once it holds a real component.

## Done means

```sh
claude plugin validate .                          # must print "Validation passed"
python3 scripts/inline-references.py --check      # inlined references current
claude plugin test .                              # mod tests
claude --plugin-dir .                             # smoke-test the real invocation
```
