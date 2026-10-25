# Design: `statamic-kit` — `blueprints` skill

**Date:** 2026-10-19
**Status:** Approved (design), awaiting spec review
**Repo:** `mjderoode/claude-plugins` (existing monorepo-marketplace `mitchell-plugins`)
**Plugin:** `plugins/statamic-kit/` (scaffold exists: manifest, empty `skills/`, `agents/`, `mods/`, single hooks entry)

## Purpose

`statamic-kit` is a public, all-in-one Claude Code plugin for building and
maintaining Statamic sites: skills, agents and (later) mods. This spec covers its
**first component**: a `blueprints` skill that creates and edits Statamic
blueprints, fieldsets and page-builder blocks — including the block's template
partial — by **detecting how the project already does it and following that
pattern**, rather than imposing a structure.

Every Statamic site builds its page builder differently. Two real sites that
informed this design already diverge:

| | Site A (Antlers) | Site B (Blade) |
|---|---|---|
| Page builder lives | Inline in `collections/pages/page.yaml` (one 440+ line Replicator) | In a reusable fieldset (`fieldsets/article_blocks.yaml`) |
| Block grouping | Set groups (`blocks` → `hero`, …) | Set groups (`content`, `media`, `editorial`) |
| Templates | `views/blocks/<handle>.antlers.html` | `components/blocks/<handle>.blade.php` via `<x-dynamic-component>` |
| CP label language | English | Dutch |

A skill that only works for one of these is useless publicly.

## Positioning and dependencies

**Standalone. No Composer dependency.** The skill works from the project's own
files. Statamic is flat-file by default — blueprints, fieldsets, collections and
content are YAML/Markdown in the repo — so Claude can read everything it needs
directly.

Considered and rejected for v1: building on **Statamic Boost**
(`chrisvasey/statamic-boost`, read-only MCP tools + AI guidelines on top of
Laravel Boost). It would add resolved blueprints and addon fieldtypes, but costs a
Composer install + `boost:install` + MCP setup, narrows support to Laravel 12/13,
needs the app to boot from the host, couples us to a single external maintainer,
and is read-only anyway. A hybrid (use Boost when present) doubles every code path
for little gain on flat-file sites.

Design consequence: "look up the project's structure" is one replaceable step in
the workflow, so a Boost-backed path can be added later (e.g. for Eloquent-driver
sites) without restructuring. The README states the plugin runs fine alongside
Statamic Boost; we do not repeat Boost's guidelines.

## Scope

**In scope (v1)**
- Add a block to an existing page builder: the set, in the right set group, plus
  its template partial.
- Create a new collection or taxonomy blueprint. A new collection also gets its
  collection config file (`content/collections/<handle>.yaml`), without which the
  blueprint does nothing.
- Create a fieldset, or extract repeated fields into a fieldset and `import` it.
- Add or change fields in an existing blueprint.

**Out of scope (YAGNI)**
- Editing content or entries.
- Globals, forms and navigation — except their blueprint.
- Styling partials. A partial is bare but working, following existing markup
  conventions only where they are clear.
- Eloquent-driver sites (detected; the skill stops and explains).
- A standalone project-inspection skill. Only the detection the blueprints skill
  consumes is built (see `project-detection.md`).
- A mapper subagent for large blueprints (deferred; recorded in the plugin's
  `CLAUDE.md`).

## Packaging

```
plugins/statamic-kit/
├── .claude-plugin/plugin.json      # exists
├── skills/
│   └── blueprints/
│       ├── SKILL.md                # workflow: detect → plan → write → verify
│       └── references/
│           ├── project-detection.md  # version, driver, paths, page-builder pattern, template language, conventions
│           ├── blueprint-yaml.md     # tabs/sections/fields, import vs field-reference, prefix, v5/v6 differences
│           ├── fieldtypes.md         # common fieldtypes and their key options
│           ├── page-builder.md       # Replicator/Bard sets, set groups, inline vs fieldset
│           └── templates.md          # partials in Antlers and Blade, and how each is dispatched
├── evals/                          # see Testing
├── CLAUDE.md                       # exists
└── README.md                       # exists
```

`SKILL.md` stays lean (progressive disclosure); detail lives in `references/` and
is loaded only when needed. `project-detection.md` starts inside this skill and
moves to a shared location once a second component (the template review agent)
needs it; the location is taken from the live plugin spec at that point.

Remove `skills/.gitkeep` when the skill lands.

### Naming

Skill `blueprints` → Skill id `statamic-kit:blueprints`, slash command
`/statamic-kit:blueprints`. It must also trigger automatically on requests like
"add an FAQ block", "create a collection for vacancies", "move the SEO fields
into a fieldset". The description lists triggers only (third person, "Use
when…"), never the workflow, and must not fire on general Laravel work
(migrations, controllers, Eloquent models).

## Workflow (`SKILL.md`)

### 1. Detect

Using `project-detection.md`, establish:

- **Version** — `statamic/cms` from `composer.lock`; decides the YAML shape.
- **Driver** — if `statamic/eloquent-driver` is installed and blueprints or
  collections are database-backed: stop, explain why, write nothing.
- **Paths** — `resources/blueprints/`, `resources/fieldsets/`, or overrides from
  config.
- **Page builder** — Replicator/Bard fields with `sets` across blueprints and
  fieldsets; inline vs fieldset; existing set groups and sets.
- **Template dispatch** — how blocks are rendered (`partial` with
  `blocks/{{ type }}`, `<x-dynamic-component>`, …); from that, the template
  language and the path for a new partial.
- **Conventions** — CP label language, handle naming, whether sets carry `icon`
  and `instructions`, and the shape of a comparable existing partial.

### 2. Clarify only what is genuinely ambiguous

Two page builders, an unclear target group, underspecified fields. Prefer
proposing a default over asking an open question.

### 3. Present the plan — hard gate

Show: files to modify and create, the new YAML fragments and the partial outline,
and which conventions are being followed (e.g. "Dutch labels, like the other
sets"). **Write nothing until the user approves.** A YAML mistake in an existing
blueprint breaks the Control Panel.

### 4. Write

- Minimal edits; preserve existing ordering, indentation and quote style.
- New set goes in the right group; the partial goes on the path existing partials
  use, modelled on a comparable sibling partial.

### 5. Verify

- **Static** (always): YAML parses; set and group handles are unique; a partial
  exists for every new set; every `import` resolves to an existing fieldset.
- **Runtime** (when PHP is available): `php please stache:clear`, then load the
  blueprint so Statamic actually parses it. If the runtime check cannot run (e.g.
  Docker without host access), say so explicitly — never report it as verified.
- Finish with a short summary: what changed and where to find it in the CP.

### Error handling

| Situation | Behaviour |
|---|---|
| No page builder found | Propose creating one; do not guess |
| Detection uncertain (unusual paths, mixed patterns) | Report what was found and ask for confirmation |
| Eloquent driver | Stop with an explanation; write nothing |
| Verification fails | Show the error and fix it; never finish with a silent half-result |

## Testing

Two layers. Client sites are never committed to the public repo.

### Layer 1 — scenarios on synthetic fixtures (in the repo)

Fixtures live in `plugins/statamic-kit/evals/fixtures/<name>/`: minimal fake
Statamic projects containing only the files the skill reads (no full install, no
`vendor/`). They are **derived from the structure** of the real sites — same
patterns, set groups and dispatch — but stripped and anonymised: no client
content, styling or brand names, only a handful of blocks.

Every run copies the fixture to a temporary directory first; fixtures stay
pristine and runs are repeatable.

| Fixture | Mirrors |
|---|---|
| `inline-antlers` | Inline page builder in the blueprint, set groups, Antlers partials, English labels |
| `fieldset-blade` | Page builder in a fieldset, `<x-dynamic-component>`, Dutch labels; two blueprints that each repeat the same SEO fields inline (for scenario 4) |
| `eloquent` | Eloquent driver configured |
| `no-builder` | Plain blueprints, no page builder |
| `two-builders` | Two Replicators; target is ambiguous |

| # | Scenario | Fixture | Pass when |
|---|---|---|---|
| 1 | "Add an FAQ block" | `inline-antlers` | Set in the right group; `faq.antlers.html` exists; YAML parses; diff touches only what is needed |
| 2 | Same request | `fieldset-blade` | Change is in the fieldset, not the blueprint; Blade component exists; labels are Dutch |
| 3 | "Create a collection for vacancies with title, location and hours" | `inline-antlers` | Collection config and blueprint both exist; sensible fieldtypes |
| 4 | "Move the repeated SEO fields into a fieldset" | `fieldset-blade` | Fieldset exists; blueprint uses `import`; no fields lost |
| 5 | Any block request | `eloquent` | Stops with explanation; no files written |
| 6 | "Add an FAQ block" | `no-builder` | Proposes creating a page builder; does not guess |
| 7 | "Add an FAQ block" | `two-builders` | Asks which page builder is meant |
| 8 | Trigger tests | — | Fires on block/collection/fieldset requests; does not fire on migrations, controllers, models |

Checks are deterministic where possible (file existence, YAML parse, handle
lookups, diff scope). The approval gate (step 3) is handled with two kinds of
run: scenarios that pre-approve the plan in the prompt, and one dedicated test
asserting that without approval nothing is written.

**Baseline first.** Following the TDD approach for skills, run the scenarios
*without* the skill before writing the references. The references target the
mistakes Claude actually makes; knowledge Claude already has stays out.

The eval runner is taken from the live tooling at build time (`claude plugin
eval` exists; its format is checked before building around it).

### Layer 2 — local smoke test on real sites (not in the repo)

Copy the two real sites to a temporary directory and run 2–3 real requests
against the copies. The working repos are never touched — no branches, no
`stache:clear` side effects. This is the only place the runtime check
(`php please`) runs against a real install with `vendor/`.

## Done means

- `claude plugin validate plugins/statamic-kit` passes.
- All layer-1 scenarios pass; baseline results recorded for comparison.
- Layer-2 smoke test done on both site copies, runtime check included.
- Plugin added to `.claude-plugin/marketplace.json`; README gains the install
  line; `claude plugin validate .` passes.

## Open questions for build time

- Exact `claude plugin eval` suite format and how fixtures are mounted.
- The shared-reference location for `project-detection.md` once a second
  component needs it.
