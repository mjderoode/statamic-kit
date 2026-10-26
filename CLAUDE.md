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
repo; it moved here with a fresh history. Design specs and implementation plans
are in `docs/specs/` and `docs/plans/`; the plans predate the move, so read
their `plugins/statamic-kit/…` paths as the repo root. The plugin is listed in
the public `mitsol-labs` marketplace (`mjderoode/mitsol-labs`, a separate
repo) with a `url` source on `main`; bump `version` in `plugin.json` to ship
a release. For development, load it with `claude --plugin-dir .`.

Status: v0.2 (2026-10-26: QA round 1 fixes) — `blueprints`, `forms`, `users` and `template-review` skills and the `template-reviewer` agent shipped (see `docs/specs/2026-10-19-statamic-kit-blueprints-design.md`). `blueprints` covers blueprints, fieldsets, collections
(including multiple entry blueprints), taxonomies, global sets, navigations and
page-builder blocks; `forms` covers forms and `users` covers roles and groups.
The references each skill always needs are inlined at the end of its SKILL.md
by `scripts/inline-references.py` (reading plugin files outside the project
needs a permission prompt). Merged to `main` on 2026-10-25; last full suite
52/53 (2026-10-25), the miss judge variance (3/3 on rerun). Eval history in
`evals/RESULTS.md`.

Mods (2026-10-25): `mods/yaml-check.ts` (after Write/Edit of Statamic YAML:
parse with the site's own Symfony parser via `mods/lib/yaml-parse.php`, report
parse errors and duplicate field/set handles) and `mods/paired-files.ts`
(a new set without a partial in the folder its sibling sets use, a new
partial with no set, a form config without its blueprint or vice versa).
Both add `context` to the tool result for Claude and stay silent when PHP or
the site's `vendor/` is missing. Shared code in `mods/lib/statamic.ts`; tests
in `tests/mods.test.ts` (`claude plugin test .`). Future ideas (new skills, agents and mods, with a suggested order): `IDEAS.md`.

## Roadmap

Not yet covered, in order of how often it comes up on real sites:

1. ~~**Multiple blueprints per collection.**~~ Done 2026-10-20
   (`references/entry-blueprints.md`).
2. ~~**Multisite.**~~ Done 2026-10-20 — already handled without changes; five
   guard cases (`multisite-*`).
3. ~~**Asset containers.**~~ Done 2026-10-20 (trigger fix + paths).
4. ~~**Users.**~~ Done 2026-10-20 — user blueprint in `blueprints`; roles and
   groups in their own `users` skill (without it, Claude edited `roles.yaml`
   without a plan).

Plan of attack:

- ~~**Step 1 — item 1**~~ (done) inside the `blueprints` skill, same loop as before: fixture,
  RED cases, reference/SKILL.md change, GREEN, full suite.
- ~~**Step 2 — split the skill before adding more.**~~ (done: `forms` split off; `blueprints`
  keeps structure). Keep each description narrow: a new area that is not
  structure gets its own skill rather than widening `blueprints`.
- ~~**Step 3 — items 2–4**~~ (done), each in whichever skill fits after the split, each with
  its own fixture and RED/GREEN cases.
- ~~**Then:** the template review agent~~ (done 2026-10-25: `agents/template-reviewer.md`
  + `skills/template-review/`; design in `docs/specs/2026-10-24-statamic-kit-template-reviewer-design.md`), then mods. The blueprint-mapper agent
  below stays deferred until a large real site shows it is needed.
- ~~**QA test protocol.**~~ (written 2026-10-25) Write `docs/qa/test-protocol.md`:
  a step-by-step script that a fresh Claude session runs
  against a real site with `claude --plugin-dir <path to this repo>`. It
  covers each skill and agent, with a prompt, the expected behaviour, and a
  results table to fill in. The results come back here: each finding becomes
  a RED case or a fix. This replaces the manual "Done means" step 4 check.
  Keep client names and local paths out of the file itself.
- ~~**Open decision:** split page-builder blocks out of `blueprints`~~ —
  decided not now: the reviewer works on templates whichever skill wrote
  them. Revisit if the skills grow too large.
- **Next QA round** covers the reviewer too; reference files are inlined, so
  no `--add-dir` is needed. Agents are not started unasked in Claude Code, so
  every agent needs a skill (or a skill step) that dispatches it.

### Progress (update after every phase; a session may be cut off mid-step)

- [x] Step 1 — multiple blueprints per collection: fixture + RED cases (RED: new-entry-blueprint default-kept 0/2; GREEN 6/6 after references/entry-blueprints.md)
- [x] Step 1 — fix + GREEN + full suite (21/21) + RESULTS.md, committed
- [x] Step 2 — split design decided: new `skills/forms/` (own SKILL.md with the
      same gates; `forms.md` moves into `skills/forms/references/`); shared
      references stay in `skills/blueprints/references/` and are read via
      `${CLAUDE_PLUGIN_ROOT}/skills/blueprints/references/…`; navigations stay in
      `blueprints`; `form-add-field`/`new-form` expect the `forms` skill; new
      guard case that a form request does not fire `blueprints`.
- [x] Step 2 — split done + full suite (21/21) + RESULTS.md, committed
- [x] Step 3a — multisite: fixture + RED (no RED: 5 cases pass unchanged, traces checked)
- [x] Step 3a — no fix needed; cases kept as guards, RESULTS.md, committed
- [x] Step 3b — asset containers: fixture + RED (asset-add-field skill-fired 1/2; GREEN 6/6 after trigger + paths)
- [x] Step 3b — fix + GREEN (6/6) + full suite (28/28) + RESULTS.md, committed
- [x] Step 3c — users: fixture + RED (skill fired 1/6; content correct in all runs). Decision: user blueprint → blueprints trigger fix (GREEN 3/3); roles/groups stay out of blueprints, cases kept as content guards without skill-fired
- [x] Step 3c — fix + GREEN + full suite (31/31) + RESULTS.md, committed
- [x] Step 3d — `users` skill: 5 cases, RED with skill parked (no-approval: wrote roles.yaml unasked 2/2; skill-fired 0/10), GREEN 15/15
- [x] Step 3d — skill written + GREEN + full suite (34/34) + RESULTS.md/README/roadmap, committed
- [x] Reviewer Task 1 — fixtures + 6 RED cases (reviewer-fired 0/6), committed
- [x] Reviewer Task 2 — agent + template-review skill + GREEN (6 cases 3/3)
- [x] Reviewer Task 3 — wired into blueprints/forms Verify + GREEN
- [x] Reviewer Task 4 — docs + full suite (44/46, two fixed and rechecked 3/3)
- [x] Reviewer final review — 4 Important + 1 upgraded Minor fixed RED→GREEN (3/3 each), committed
- [x] Reviewer merged to `main` 2026-10-25 — pre-merge full suite 49/51, both misses 3/3 on rerun

### Next up (in order)

1. ~~Write the QA test protocol~~ (done 2026-10-25: `docs/qa/test-protocol.md`;
   profiles A flat-file, B Eloquent structure, C Eloquent content only).
   Antlers flat-file round done 2026-10-25 (30/31, report
   `docs/qa/2026-10-25-antlers-flat-file.md`); its four findings fixed
   RED→GREEN the same day (full suite 52/53, the miss 3/3 on rerun). Still to
   run: a Blade/Eloquent site (profile B or C).
2. ~~Mods.~~ First two built 2026-10-25 (see Status); more under "Mods" in `IDEAS.md`.
3. **Templates skill** — in progress. Design:
   `docs/specs/2026-10-26-statamic-kit-templates-design.md`; plan:
   `docs/plans/2026-10-26-statamic-kit-templates.md` (its "Resuming after a
   break" section says how to pick up). After that, the next item from the
   suggested order in `IDEAS.md`.

### Templates skill — Progress (tick after each task's commit)

- [ ] Task 1 — Statamic facts file, fixtures `pages-antlers` + `pages-blade`
- [ ] Task 2 — page-type cases (7), RED
- [ ] Task 3 — gate and boundary cases (7), RED
- [ ] Task 4 — `skills/templates/` + references, GREEN
- [ ] Task 5 — reviewer extended to page templates, RED → GREEN
- [ ] Task 6 — full suite, README/IDEAS/QA protocol, RESULTS.md; ask before 0.3.0
- [ ] Task 7 — phase 2: search results page
- [ ] Task 8 — phase 2: 404 page
- [ ] Task 9 — phase 2: SEO meta
- [ ] Task 10 — phase 2: sitemap
- [ ] Task 11 — phase 2: language switcher
- [ ] Task 12 — phase 2 full suite and docs; ask before 0.4.0

### Open minors from the reviewer's final review

Not fixed on purpose; pick up when touching that area.

- Review cases still allow Bash (`allowed_tools`); the reviewer itself has no Bash.
- Several "unchanged" graders check one pattern only; `review-missing-file`
  should also assert that the other templates are not reviewed.
- No grader checks that a must-fix was actually applied in the file.
- The input contract for requests without a path ("the quote form") is not
  written down in the agent or the skill.
- The agent's Markdown (`{!! !!}` / `| markdown`) rule is worded too strictly.
- `review-antlers-leak`'s `explains-fallback` judge splits 2–1 on most runs;
  expect an occasional fail without a regression.

For every step: follow the RED → fix → GREEN → full-suite loop, log it in
`evals/RESULTS.md`, and keep client names and local paths out of fixtures and
commits.

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

The blueprints skill reads the project's blueprints and fieldsets itself. On
sites with big inline page builders (one real-world `page.yaml` is 440+ lines
of Replicator sets) that can flood the main context.

If that turns out to hurt in practice, add a read-only `blueprint-mapper`
agent (`agents/blueprint-mapper.md`, tools limited to Read/Grep/Glob) that
scans the project and returns a compact map instead: the page-builder pattern
(inline vs fieldset), file paths, existing set groups and sets, naming and
language conventions, and the template language. The skill then works from
that map. Measure on a large real site before building it — on small sites the
extra hop is pure overhead.

Measured 2026-10-20 (QA, real Statamic 6 Blade site; largest fieldset 345
lines, 13 sets): 41–52k peak context for plan-only runs, 60k when executing;
skill + references add about 5–8k, and the big fieldset was read with
`grep`/`sed`, not whole. No pressure — still deferred. Re-measure on a site
with 1000+ line blueprints.

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
claude plugin test .                              # once mods have *.test.ts files
claude --plugin-dir .                             # smoke-test the real invocation
```
