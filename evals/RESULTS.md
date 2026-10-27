# Eval results — 2026-10-19

Run: `claude plugin eval . --scaffold --allow-tools Bash Write Edit --runs 3 -j 4`
(two arms: with plugin / no-plugin baseline). Claude Code 2.1.303, default model, cost $11.03.

**11/11 cases pass in the with-plugin arm; overall score 1.00; mean Δ vs baseline +0.22.**

| Case | With plugin | Without | Δ | Skill fired |
|---|---|---|---|---|
| duplicate-handle | 1.00 | 1.00 | +0.00 | 3/3 |
| eloquent-stops | 1.00 | 0.56 | +0.44 | 3/3 |
| extract-seo-fieldset | 1.00 | 1.00 | +0.00 | 3/3 |
| fieldset-blade-add-faq | 1.00 | 1.00 | +0.00 | 3/3 |
| inline-antlers-add-faq | 1.00 | 1.00 | +0.00 | 3/3 |
| new-collection-vacancies | 1.00 | 1.00 | +0.00 | 3/3 |
| new-taxonomy-topics | 1.00 | 1.00 | +0.00 | 3/3 |
| no-approval-no-writes | 1.00 | 0.00 | +1.00 | 3/3 |
| no-builder-proposes | 1.00 | 1.00 | +0.00 | 3/3 |
| trigger-negative-migration | 1.00 | 1.00 | +0.00 | 0/3 (correct: must not fire) |
| two-builders-asks | 1.00 | 0.00 | +1.00 | 3/3 |

The skill's measurable contribution is in the gates: plan-before-write, asking when
several page builders exist, and a complete stop on Eloquent-driver sites (the
baseline still writes a partial there). On the write cases Claude already performs
well without it; the skill keeps that behaviour while adding the gates.

No graders were changed after the baseline run.

## After final review — 2026-10-19

Grader changes made on review findings (not to make the skill pass):

- Guard cases (`no-approval-no-writes`, `two-builders-asks`, `eloquent-stops`,
  `no-builder-proposes`) gained file-state graders (`no-files-created`,
  `blueprint-untouched`), so writes through Bash are caught too. Verified: they
  fail in the no-plugin arm, which writes files, and pass with the plugin.
- `no-builder-proposes/version-fallback` is now an LLM check that the reply says
  the version comes from the `composer.json` constraint (was a trace regex that
  could not fail).
- `collection-file`, `blueprint-file`, `fieldset-created` now match only files
  created during the run, excluding the fixture's own files (were always true).

Re-run with the plugin (`--runs 1 --ablation none`): **11/11 cases pass**, cost $2.04.

## Custom paths — 2026-10-19

New fixture `custom-paths`: blueprints and fieldsets moved via `blueprints_path` /
`fieldsets_path` in `config/statamic/system.php`, collection and taxonomy configs
moved via `config/statamic/stache.php`, with the install's default
`resources/blueprints/user.yaml` and `default.yaml` left behind as a decoy.
New cases `custom-paths-add-faq` and `custom-paths-new-collection` check that
everything lands in the configured `cms/` paths and nothing in the defaults.

These cases already passed (6/6 runs) before `project-detection.md` named the
config keys explicitly, so they are regression guards rather than a fix for an
observed failure. Full suite after the change (`--runs 1 --ablation none`):
**13/13 cases pass**, cost $2.73.

## Globals — 2026-10-19

New fixture `globals` (an existing `contact` global set: config, blueprint,
`default` site values, Antlers usage in the layout) and two cases:
`global-add-field` and `new-global-set`.

- **RED:** before the change the skill did not fire on "add a global for the
  footer" (`new-global-set`, 0/2 runs), so no plan, gates or verification applied.
  `global-add-field` already passed.
- **Fix:** `references/globals.md`, global sets named in the SKILL.md
  description and body, and global paths in `project-detection.md`.
- **GREEN:** both cases 3/3; full suite 15/15 (after the grader fix below).

Grader fix: `fieldset-blade-add-faq/dutch-labels` failed on correct output
(Dutch `display:` labels) because the judge counted English field handles as
labels. The criteria now say only `display:`-type values are labels; 3/3 after.

## Navigation and forms — 2026-10-19

New fixture `nav-forms` (a `main` navigation with config and tree, a `contact`
form with config, blueprint and an Antlers `{{ form:create }}` partial) and four
cases: `nav-add-field`, `new-navigation`, `form-add-field` and `new-form`.

- **RED:** the skill did not fire on `new-navigation`, `form-add-field` or
  `new-form` (0/6 runs); Claude did the work without plan, gates or
  verification. `nav-add-field` already passed (2/2).
- **Fix:** `references/navigation.md` and `references/forms.md`, navigations and
  forms named in the SKILL.md description and body, their default paths and
  config keys in `project-detection.md`, and the out-of-scope line narrowed to
  content (navigation trees, form submissions).
- **GREEN:** all four cases 3/3; full suite 19/19 (`--runs 1 --ablation none`),
  including `trigger-negative-migration`, so the broader description does not
  fire on plain Laravel requests.

## Multiple blueprints per collection — 2026-10-20

New fixture `multi-blueprint`: a `pages` collection with two entry blueprints
(`page` "Page", `service` "Service page", no `order:`), an entry without a
`blueprint:` key and one on `service` with its own template. Two cases:

- `multi-blueprint-asks` — "add a subtitle field to the pages" (pre-approved):
  must name both blueprints and ask, writing nothing. Already passed before the
  change (2/2); kept as a regression guard.
- `new-entry-blueprint` — "add an event page type". Statamic's default entry
  blueprint is the first non-hidden one by `order:`, then `title:`, and entries
  without a `blueprint:` key use it. A new "Event page" with no `order:` sorts
  before "Page" and silently becomes the default.

- **RED:** `new-entry-blueprint/default-kept` failed 0/2: both runs wrote
  `title: 'Event page'` with no `order:`, moving the existing entry onto the
  event blueprint. The other graders passed.
- **Fix:** `references/entry-blueprints.md` (default rule, keep-the-default
  procedure, asking when the target blueprint is unnamed, templates for a new
  type), plus an ambiguity bullet and a pointer in SKILL.md.
- **GREEN:** both cases 3/3; full suite 21/21 (`--runs 1 --ablation none`), $4.20.

## Split: separate `forms` skill — 2026-10-20

The `blueprints` description had grown to cover every kind of Statamic
structure. Forms also touch templates, email and submissions, so they moved to
their own skill before more scope is added.

- New `skills/forms/SKILL.md` with the same gates (detect, Eloquent stop,
  ambiguity, plan gate, verify). `forms.md` moved into `skills/forms/references/`.
  Shared references stay in `skills/blueprints/references/` and are read via
  `${CLAUDE_PLUGIN_ROOT}/skills/blueprints/references/…` — confirmed in all six
  form runs (each read `project-detection.md` and `forms.md`).
- `blueprints` no longer names forms in its description or body.
- Graders: `form-add-field` and `new-form` now expect the `forms` skill and add
  `blueprints-not-fired`; `trigger-negative-migration` checks that neither skill
  fires.
- Result: both form cases 3/3; full suite 21/21 (`--runs 1 --ablation none`), $4.09.

## Multisite — 2026-10-20

New fixture `multisite`: sites `en` + `nl` (`resources/sites.yaml`,
`multisite => true`), a `pages` collection with `sites: [en, nl]`, a page
blueprint whose text fields are `localizable: true` (the image is not), and a
`contact` global set with `sites: { en: null, nl: en }` and per-site values.
Five cases: `multisite-add-field`, `multisite-new-collection`,
`multisite-new-global`, and two with nothing to mirror —
`multisite-new-taxonomy` (first taxonomy) and `multisite-new-navigation` (first
navigation; trees must be per site at `content/trees/navigation/<site>/`).

- **No RED:** all five passed with the unchanged skill (2/2 each). Traces
  checked by hand: Claude read `resources/sites.yaml`, set `sites:` on the new
  taxonomy and collection, marked new text fields `localizable: true`, and wrote
  one nav tree per site.
- **No skill change:** without a failing case there is nothing to fix; the
  "mirror the project" workflow plus Claude's own Statamic knowledge covers it.
  The five cases stay as regression guards.

## Asset containers — 2026-10-20

New fixture `assets`: an `assets` container on the `assets` disk
(`public_path('assets')`) with a flat metadata blueprint (`alt`), and a page
blueprint whose `hero_image` uses it. Two cases:

- `asset-add-field` — "add a photographer credit field to our images".
- `new-asset-container` — a PDF brochures container plus a download field on the
  page blueprint; the grader requires a new disk with its own, non-overlapping
  root in `config/filesystems.php` and the field pointing at the new container.

- **RED:** `asset-add-field/skill-fired` 1/2 — in one run the skill did not fire,
  so no plan, gates or verification. `new-asset-container` already passed (2/2).
- **Fix:** asset containers named in the SKILL.md description (two trigger
  phrases) and body, a short pointer for config/disk/blueprint, and the
  container config path plus the `stores.asset-containers.directory` key in
  `project-detection.md`.
- **GREEN:** both cases 3/3; full suite 28/28 (`--runs 1 --ablation none`), $5.99.
  (A first full-suite attempt hit the session limit and scored nothing; re-run
  after the reset.)

## Users, roles and groups — 2026-10-20

New fixture `users`: `resources/users/roles.yaml` (`admin` with `super`, an
`author` role on the `blog` collection), an empty `groups.yaml`, and a
tabs/sections `user.yaml`. Three cases: `user-add-field`, `new-role` (editor on
`pages`: needs `access cp` and the full `view` → `edit` → `create`/`publish`
chain, no delete, no user permissions) and `new-user-group`.

- **RED:** the skill fired in 1/6 runs. The content was right in every run —
  correct permission chain and wording, group in `groups.yaml`.
- **Decision:** the user blueprint is a blueprint, so `blueprints` now names it
  (description, body). Roles and groups are user management, not structure:
  they stay out of `blueprints` (now listed under Out of scope) instead of
  widening it, and get no skill of their own while Claude handles them
  correctly unaided. `new-role` and `new-user-group` keep their content graders
  as regression guards, without `skill-fired`.
- **GREEN:** `user-add-field` 3/3; full suite 31/31 (`--runs 1 --ablation none`), $6.17.

## Separate `users` skill for roles and groups — 2026-10-20

Follow-up to the entry above: roles and groups get their own skill after all,
for the plan gate and verification (a wrong permission locks people out or
grants too much).

- New `skills/users/` (SKILL.md + `references/permissions.md`: file shapes, the
  full permission hierarchy from Statamic 6 `CorePermissions`, handle sources).
- Stop condition checked in source: an `eloquent` user repository keeps roles
  and groups in YAML unless `tables.roles` / `tables.groups` name a table. A
  first draft stopped on any `eloquent` repository, which would have refused on
  a real site with exactly that setup.
- Cases: `new-role` and `new-user-group` expect the `users` skill again; new
  guards `role-no-approval` (plan only, no writes), `role-unknown-collection`
  ("news" does not exist: ask, don't invent a handle) and
  `role-eloquent-users` (users in the database, roles in YAML: proceed).
- **RED** (skill directory parked): skill-fired 0/10; `role-no-approval` wrote
  the role into `roles.yaml` without a plan or approval in 2/2 runs.
  `role-unknown-collection` and `role-eloquent-users` content already passed.
- **GREEN:** all five 3/3; full suite 34/34 (`--runs 1 --ablation none`), $6.77.
  `trigger-negative-migration` now also checks that `users` does not fire (3/3).

## Block requests without the builder words — 2026-10-20

QA on a real Statamic 6 Blade site: "Add a pull quote block" (a `pull_quote`
set already existed) did not fire `blueprints` in 2/2 runs. Claude grepped and
answered without the skill (the answer was correct). Hypothesis: a "block"
request that does not say "page builder", "replicator" or "set" misses the
trigger. Three cases:

- `block-exists-no-builder-word`: "Add a hero block with a heading and a
  background image." on `inline-antlers`, where `hero` already exists. Checks
  that the skill fires, that it flags the existing set and that it offers to
  extend it.
- `new-block-no-builder-word`: "Add a testimonials block with a quote, a name
  and a photo." on `inline-antlers`. Checks that the skill fires, that it
  plans first and that it writes nothing.
- `pull-quote-exists`: the exact QA prompt "Add a pull quote block" on a new
  fixture `blade-pull-quote` (`fieldset-blade` plus a `pull_quote` set and its
  Blade component).

- **RED:** none. `block-exists-no-builder-word` 3/3,
  `new-block-no-builder-word` 3/3. In `pull-quote-exists` the skill fired in
  12/13 runs (2/3, then 5/5 and 5/5); the one miss still flagged the existing
  set. The hypothesis does not hold: "block" alone triggers the skill.
- **Fix:** none. The SKILL.md description is unchanged. One miss in 13 runs is
  too few to show whether a wider description helps. The QA misses most likely
  come from the real-site context (more files, other plugins and instructions
  competing), not from the wording. The three cases stay as trigger guards;
  re-check on the real site through the QA protocol.
- Cost: $3.55.

## Set group and position for a new set — 2026-10-20

QA on a real Statamic 6 Blade site (13 sets in 4 groups): "add an FAQ block"
landed in a different group each run (`editorial` after `source`, then
`content` after `callout`). Both were defensible, but no rule chose between them.

New fixtures `set-groups` (inline Blade builder; groups `text`, `media`,
`layout`) and `set-groups-tie` (groups `content`, `editorial`, `media`,
`layout`, mirroring the QA site, where an FAQ fits two groups). Three cases:

- `set-group-placement` — "add a video embed block", pre-approved; the regex
  requires the new set last in `media` (after `audio`, before `layout`).
- `set-group-plan` — same request without approval; the judge requires the plan
  to name the group and the position in words, and no writes.
- `set-group-tie` — FAQ block, pre-approved; requires it last in `content` (the
  first fitting group in the file), after `callout`.

- **RED:** none. `set-group-placement` 3/3, `set-group-plan` 3/3 (one judge vote
  of three failed in one run), `set-group-tie` 5/5, always `content`. The small
  fixtures do not reproduce the QA variance. It probably needs the size of the
  real builder. The rule was added anyway, because the QA showed the result
  varies on a real site, and these cases now guard it.
- **Fix:** `references/page-builder.md` gets one deterministic rule: no
  groups → append; otherwise the closest group by its sets; on a tie, the first
  fitting group in the file; if none fits, the last group, with a new group
  offered in the plan; position last in the group unless a comment sets an
  order. The plan names group, reason and position. SKILL.md's plan checklist
  gets a "group and position" line.
- **GREEN:** `set-group-placement` 3/3, `set-group-plan` 3/3, `set-group-tie`
  3/3; `inline-antlers-add-faq`, `fieldset-blade-add-faq` and
  `two-builders-asks` 1/1 each (`--ablation none`), $2.92 in total.
- Note: `claude plugin eval` with several `--case` flags runs only the last
  one, so run each case in its own invocation.

## Reference files outside the project — 2026-10-21

QA on a real site: in `claude -p` every Read of `skills/*/references/*.md` was
denied (`permission_denials`), because the plugin folder is outside the working
directory. Reproduced with `--plugin-dir` and with the installed plugin (2/2
denied each). Tried from the plugin side, all failed:

- `allowed-tools: Read(${CLAUDE_PLUGIN_ROOT}/**)` in the frontmatter: the Skill
  call itself then needs approval and is denied.
- `` !`cat ${CLAUDE_SKILL_DIR}/references/…` `` injection: blocked (cat only in
  allowed working directories), and the whole skill fails to load.
- Relative paths: resolved to the absolute plugin path and denied.

What works: a user-side allow rule (`Read(//<plugin folder>/**)`), 2/2 runs
with every reference read; `--add-dir` per the docs. One run used
`cd … && cat` instead of Read and was denied even with the rule.

- **Fix:** README section with the allow rule; all three SKILL.md files now
  say to read references with Read, one file per call, and to name an unread
  reference in the plan instead of failing. The cache-path rule in the README
  is not yet tested on a marketplace-installed copy.
- The eval harness does not show this; it is only visible in real-site runs.
- **Full suite:** 40/40 (`--runs 1 --ablation none`), $8.46.

## Inline the always-needed references — 2026-10-22

Follow-up to the entry above: asking every user for an allow rule is not
acceptable, and a plugin hook that auto-approves its own reads was rejected
(it is a self-granted permission, and the API docs say a hook's `allow` does
not dismiss a prompt). Claude Code loads SKILL.md without a permission check,
so the references each skill always needs are now copied into it by
`scripts/inline-references.py` (`--check` reports stale copies):
`blueprints` gets project-detection, blueprint-yaml, page-builder, templates;
`forms` gets project-detection, forms, blueprint-yaml; `users` gets
project-detection, permissions. The rare references stay as files; a denied
read is named in the plan. README allow-rule section removed.

- **Check:** `claude -p --plugin-dir` without any allow rule, one prompt per
  skill: no reads of the plugin folder and no plugin-path denials; correct
  plan, no writes, in all three.
- **Full suite:** 40/40 (`--runs 1 --ablation none`), split over three
  invocations because a usage limit and then parallel-start auth failures cut
  runs off (those were infrastructure errors, not grader failures, and were
  rerun). `two-builders-asks` scored 0.83 once (one grader in one run), then
  3/3 on rerun — noise. Estimated cost (subscription usage, not billed): about $10.

## Template reviewer agent — 2026-10-24

Design: `docs/specs/2026-10-24-statamic-kit-template-reviewer-design.md`; plan:
`docs/plans/2026-10-24-statamic-kit-template-reviewer.md`.

New fixtures: `review-blade` (fieldset builder with a FAQ component seeded with
the six weaknesses from real-site QA, and siblings that all output a textarea
with `{!! !!}`), `review-antlers` (a well-made `team` partial), `review-form`
(a quote form without labels, errors, old input or honeypot next to a good
contact form) and `review-single` (one block, no siblings). Six cases:
`review-blade-defects`, `review-bad-practice`, `review-antlers-clean`,
`review-form`, `review-missing-file`, `review-no-siblings`.

- **RED** (no agent, `--runs 1`): `reviewer-fired` 0/6. Content without the
  agent: defects FAIL (fewer than five of six found), bad-practice FAIL (no
  separate section), antlers-clean FAIL (false must/should-fix findings),
  no-siblings FAIL; form and missing-file already PASS. Estimated cost $1.04.
- **First GREEN attempt: `reviewer-fired` 0/18.** The agent loads (it is in
  the session's agent list) and works when named explicitly (5/6 seeded
  defects, Bad practice separate), but Claude Code does not start an agent on
  its own from a plain "review this template". **Fix:** a thin
  `template-review` skill that triggers on review requests and dispatches the
  agent; the review logic stays in the agent.
- The `review-antlers` `team` partial was not actually clean (its photo's alt
  text could be empty, a fair finding); removed the photo from the fixture.
- Two agent rules tightened after 2/3 and 1/3 runs: each missing form item is
  its own finding; an empty wrapper is a suggestion at most.
- **GREEN:** all six cases 3/3 (`review-antlers-clean` and `review-form` after
  the rule change; the other four rechecked 1/1 after it). Estimated cost
  about $5.

### Reviewer wired into `blueprints` and `forms` — 2026-10-25

Verify step now dispatches `statamic-kit:template-reviewer` only when a set or
form template was written or changed, fixes small must-fix findings in
planned files (at most one re-review), lists Bad practice for the user.
`Agent` added to `allowed_tools` of the nine template-writing cases and
`user-add-field`. New graders: `reviewer-fired` and `reviewer-max-two`
(`inline-antlers-add-faq`, `fieldset-blade-add-faq`, `form-add-field`),
`reviewer-not-fired` (`user-add-field`), `reports-review`,
`layout-untouched`, `default-untouched` (`fieldset-blade-add-faq`).

- **RED** (`--runs 1`): `reviewer-fired` 0/3, `reports-review` FAIL;
  `reviewer-not-fired` already 1/1.
- **GREEN:** the four cases 3/3; `custom-paths-add-faq`, `set-group-placement`,
  `set-group-tie`, `new-form`, `duplicate-handle` 1/1 (three of these rerun
  after a usage-limit cut-off). Estimated cost about $5.

### Full suite with the reviewer — 2026-10-25

- **Full suite:** 44/46 (`--runs 1 --ablation none -j 3`), estimated $10.20.
  Misses: `review-antlers-clean` and `review-bad-practice`. Traces showed
  (a) the clean case's reply held only an optional `{{ if people }}`
  suggestion, which the judge read as the forbidden "missing guard" — grader
  clarified; (b) the main model relayed the Bad practice list under another
  heading ("Site-wide issues"). **Fix:** `template-review` and both Verify
  steps now keep the heading exactly `Bad practice`; the grader requires the
  literal words.
- **Recheck:** both cases 3/3. Estimated $2.

### Final review fixes — 2026-10-25

A whole-branch review found four Important gaps; one Minor was upgraded on
effect (should-fix findings were never offered). Each got a case first:

| Finding | Case | RED | GREEN |
|---|---|---|---|
| A wrong handle in an Antlers set falls back to the page's value (agent said it renders empty) | `review-antlers-leak` | FAIL | 3/3 |
| Bad practice judged from 2–3 siblings; must grep all | `review-bad-practice-mixed` | FAIL | 3/3 |
| Should-fix findings not offered after a write | `fieldset-blade-add-faq` (`offers-should-fix`) | FAIL | 3/3, after requiring a closing **Template review** section (2/3 misses before) |
| Edit outside the plan (layout without `@stack`) | `faq-layout-outside-plan` | PASS (guard) | 3/3 |
| `name="{{ honeypot }}"` reported as missing; CSRF | `review-form-honeypot-var` | PASS (guard) | 3/3 |

Agent: parent-context fallback and `scope=`; `honeypot` variable and CSRF
from the form tag; grep all siblings before filing Bad practice. Verify
steps: offer should-fix items; end with a Template review section.

- **Regression check** (`--runs 1`): the six original review cases,
  `inline-antlers-add-faq`, `form-add-field` — all pass except one
  `review-blade-defects` run (fewer than five of six found), then 3/3 on
  rerun: variance at the grader's threshold.
- Estimated cost of the fix pass about $9 (part of it cut off twice by the
  usage limit and rerun).

## Pre-merge full suite — 2026-10-25

Full suite, 1 run per case: 49/51. Two cases failed once on an LLM judge and
passed 3/3 on rerun:

- `fieldset-blade-add-faq`: `offers-should-fix` failed once (FAIL FAIL FAIL); rerun 3/3.
- `review-antlers-leak`: `explains-fallback` failed once (FAIL PASS FAIL); rerun 3/3,
  but each passing vote was split 2–1. That grader sits close to its threshold.

## Real-site QA round 1 (protocol) — 2026-10-25

`docs/qa/test-protocol.md` run on a real Antlers flat-file site (profile A,
Statamic 6.31): **30 pass, 1 partial** of 31 turns; no plan turn wrote, no
write left its plan. Partial: BP-10 could not read `references/navigation.md`
(not inlined). Minor findings: the reviewer skips the dispatcher and layout
when the site's `CLAUDE.md` describes them; must-fix rating for unescaped old
input ignores CSRF; `forms` reviews an existing generic template without
writing one (useful, but outside the skill text). Report:
`docs/qa/2026-10-25-antlers-flat-file.md`. Cost about $11.70.

## QA round 1 findings — 2026-10-25

Each finding from `docs/qa/2026-10-25-antlers-flat-file.md`:

| Finding | Case | RED | GREEN |
|---|---|---|---|
| `navigation.md` (and `globals`, `entry-blueprints`, `fieldtypes`) read from the plugin folder, denied headless | — (eval sandbox allows the read) | — | inlined; cross-references now name sections, not files |
| Reviewer relied on the site `CLAUDE.md` instead of opening dispatcher and layout | `review-documented-dispatch` | 1/3 | 3/3 |
| Old input echoed raw in a form tag rated must-fix, CSRF ignored | `review-form-old-input` | 1/3 | 3/3 |
| New form rendered by a generic template: reviewer not run | `form-generic-review` | 0/3 | 3/3 |

Agent: open the dispatcher and the layout even when documented; Antlers old
input inside the form tag is should-fix (CSRF limits it to self-XSS), Blade's
`old()` is escaped. `forms` Verify: review the generic template when a new
form uses it.

- **Full suite** (`--runs 1`, 53 cases): 52/53. `review-form-old-input` failed
  its `old-input-rated-should-fix` judge once; rerun 3/3 (6/7 overall).
  A first attempt stopped on the session limit and is not counted.
- Cost about $17 (RED $2.27, GREEN $1.92, suite $12.57, rerun ~$0.50).

## Templates skill — RED (page types) — 2026-10-26

Design: `docs/specs/2026-10-26-statamic-kit-templates-design.md`; plan:
`docs/plans/2026-10-26-statamic-kit-templates.md`; facts:
`docs/specs/2026-10-26-templates-statamic-facts.md`. New fixtures
`pages-antlers` (news + topics, card partial, hard-coded header links) and
`pages-blade` (vacancies on `@blueprint`, `x-card`/`x-picture`, half-measure
static caching).

RED (`--runs 1`, no templates skill; Claude Code 2.1.310, default model):
`skill-fired` 0/7 as expected. **Every content grader already passes** in all
seven cases (listing, detail, `@blueprint` detail, taxonomy archive, Blade
nav, breadcrumbs, image partial). The listing run wrote the `/news` page
entry, added it to the tree, mounted `news`, reused `partials/card`, and
flagged the missing news detail template on its own — in 6 turns, without a
plan step. So the page-type knowledge needs no reference yet; the skill's
value has to come from the gates, the boundary and the reviewer (Task 3).
A first attempt did not load (run settings in `case.yaml` instead of the
`prompt.md` front matter) and cost nothing. Cost $1.59.

## Templates skill — RED (gates and boundary) — 2026-10-26

RED (`--runs 1`, no templates skill), seven cases:

| Case | RED | What happened |
|---|---|---|
| `templates-plan-gate` | 0.29 | no approval asked: wrote the overview, page entry and mount straight away |
| `templates-missing-field` | 0.14 | added an `author` field to the news blueprint unasked, then used it |
| `templates-route-change-warns` | content pass | planned `/jobs`, named the changing URLs, wrote nothing |
| `templates-static-cache` | content pass | handled half-measure caching of the query string |
| `templates-eloquent` | content pass | template file only, pointed to the CP |
| `templates-multisite` | content pass | `nav:breadcrumbs`, no hard-coded locale |
| `templates-trigger-guard` | 1.00 | `blueprints` fired, as it should |

So the skill has two jobs the baseline misses: the plan-and-approve gate
for page work, and stopping at missing structure instead of creating it.
Cost $1.75.

## Templates skill — GREEN — 2026-10-26

`skills/templates/SKILL.md`: detect (layout, sibling page templates, reusable
partials, collection config, blueprint, static caching, multisite), stop on
missing structure (offer `blueprints`, never add a field — even when the plan
is pre-approved), plan gate with wiring lines and changing URLs, write on the
closest sibling, verify. A short **Page wiring** section holds the facts the
plan needs; no separate references (RED asked only for the gate and the
boundary). Project detection is inlined.

- Smoke (`--runs 1`): `templates-plan-gate`, `templates-missing-field`,
  `listing-news-antlers` 1.00 each, $0.69.
- **GREEN** (`--runs 3`, 14 cases): 13 cases 3/3. `templates-route-change-warns`
  scored 0.86 ×3: `blueprints` fired instead of `templates` and warned about
  the changing URLs every time. A route change with no template work is
  collection config, so the case now accepts either skill; rerun 1/1.
- Which fix answers which RED failure: plan gate → `templates-plan-gate`
  (0.29 → 3/3); missing-structure stop → `templates-missing-field`
  (0.14 → 3/3).
- Cost $10.71.

## Templates skill — reviewer on page templates — 2026-10-26

`template-reviewer` now covers page templates (listings, detail and term
pages, navigation, breadcrumbs, image partials) with a new check 7: page
links on paginated listings, an empty state, one `<h1>` counting the layout,
image alt and dimensions, `nocache` or allowed query strings under static
caching, current-item marking, reuse of the site's partials. The
`template-review` skill triggers on page templates; `templates` Verify
dispatches the reviewer like `blueprints` does. New fixture `review-listing`
(news overview with five seeded defects).

- **RED** (`--runs 1`): `reviewer-fired` 0/1 on `review-listing`,
  `listing-news-antlers` and `detail-blueprint-mapped` (the main model
  reviewed `review-listing` itself and found the defects). $0.71.
- **GREEN** (`--runs 3`): all three cases 3/3. $2.79.
- **Regression** (`--runs 1`): the 11 existing `review-*` cases pass;
  `review-form` failed its judge once (FAIL ×3 votes), rerun 1/1 — noise. $2.02.

## Templates skill — full suite — 2026-10-26

`--runs 1 --ablation none -j 3`, 68 cases. The first invocation hit the
session limit after 22 cases (46 runs stopped on the limit, not graded);
those 46 were rerun one case per invocation after the reset.

- **66/68** pass first time. `breadcrumbs-antlers` failed its `crumbs` judge
  once (2–1), `review-antlers-leak` its `explains-fallback` judge (2–1, the
  known split in `CLAUDE.md`); both 1/1 on rerun.
- `blueprints`, `forms` and `users` `skill-fired` graders all pass: the new
  skill does not steal their requests.
- Done means: `claude plugin validate .` passed (existing warnings),
  inline-references up to date, `claude plugin test .` 17/17.
- Cost $18.00 (first pass $6.81, rerun $11.03, judge reruns $0.16).

## Templates skill — final review — 2026-10-26

Fresh whole-branch review: no Critical, five Important, nine Minor. Each
Important got a test first:

| Finding | Test | Result on the current skill |
|---|---|---|
| Eloquent rule contradicts Project detection; entries-only sites can still wire YAML | new `templates-eloquent-entries` (fixture `eloquent-entries`) | 1/1 — wording fixed anyway (contradiction in the text); 1/1 after, `templates-eloquent` 1/1 |
| Entry-level `template:` overrides not looked for | new `detail-entry-override` | 1/1 — not reproduced, kept as guard |
| Reviewer refuses layouts (nav/breadcrumbs) | `reviewer-fired` + `reviewed-not-refused` on `nav-main-blade`, `breadcrumbs-antlers` | 1/1 each — not reproduced |
| Route/mount ownership unclear | Out of scope now carves out the wiring lines; `templates-route-change-warns` 1/1 | — |
| Trigger guard only one way | `blueprints-not-fired` on `listing-news-antlers`, `detail-news-antlers`, `nav-main-blade` | 1/1 each |

Minors are listed in `CLAUDE.md` under the templates Progress list. Cost $2.76.

## Templates skill phase 2 — RED — 2026-10-27

Nine cases (Tasks 7–11), run against the phase 1 skill (`--runs 1`). Six
runs and one judge first stopped on the session limit and were rerun.

| Case | RED | What happened |
|---|---|---|
| `search-results-antlers` | content FAIL | page built, but no search index: left `search.php` out as "PHP config", so only titles are searched |
| `search-static-cache` | 1.00 | handled caching of `?q=` |
| `not-found-blade` | skill not fired | 404 itself fine |
| `seo-meta-antlers` | 0.00 | skill not fired; edited blueprints, meta judged wrong |
| `seo-addon-present` | skill not fired | did not duplicate SEO Pro |
| `seo-missing-fields` | 0.00 | added SEO fields to blueprints unasked |
| `sitemap-antlers` | skill not fired | sitemap itself fine |
| `language-switcher-multisite` | 1.00 | |
| `language-switcher-single-site` | 0.33 | built a switcher on a one-site install |

Cost $3.79.

## Templates skill phase 2 — GREEN — 2026-10-27

`skills/templates/SKILL.md`: description triggers on search, 404, SEO meta,
sitemap and language switcher; Detect reads `search.php`, `routes/web.php`,
globals and SEO addons; stop on a language switcher for a single-site
install; an SEO rule (an addon owns meta and sitemap; else existing fields
with fallbacks, never new fields); Page wiring facts for search (the index
is wiring), 404, sitemap and `locales`.

- **GREEN** (`--runs 3`, 9 cases): 27/27. A first attempt stopped on the
  weekly limit before grading anything ($0.69) and was rerun.
- Fixes per RED failure: search index as wiring → `search-results-antlers`;
  SEO rule → `seo-meta-antlers`, `seo-missing-fields`; single-site stop →
  `language-switcher-single-site`; triggers → `not-found-blade`,
  `seo-addon-present`, `sitemap-antlers`.
- Cost $9.59.

## Templates skill phase 2 — full suite — 2026-10-27

`--runs 1`, 79 cases, one case per invocation (`-P 3`). The session limit
stopped runs twice (55, then 11 runs and one judge, all ungraded); those were
rerun after each reset.

- **76/79** pass first time.
  - `review-documented-dispatch` (judge) and `templates-static-cache`
    (`filter-works` judge): 1/1 on rerun.
  - `two-builders-asks` failed its `asks` judge twice (FAIL ×3 both times).
    The reply names both replicators, recommends one, asks which, and writes
    nothing — what the grader's PASS line asks for. Neither the case nor the
    `blueprints` skill changed on this branch; the judge seems to read the
    full plan for the recommended option as "picks one". Left open (see
    `CLAUDE.md`).
- All `skill-fired` graders pass, including `blueprints-not-fired` on the
  template cases and `templates-not-fired` on the blueprint guard.
- Done means: validate passed (existing warnings), inline-references up to
  date, `claude plugin test .` 17/17.
- Cost $22.71 ($7.42 + $11.90 + $2.66 + $0.73).
