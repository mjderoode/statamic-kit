# statamic-kit templates skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/statamic-kit:templates` skill that builds listing, detail, taxonomy-archive, navigation, breadcrumb and responsive-image templates the way the site already does it, wires them to existing structure, and has them reviewed by an extended `template-reviewer`.

**Architecture:** One skill (`skills/templates/SKILL.md`) with the same detect → ambiguity → plan gate → write → verify workflow as `blueprints`. Its always-needed references are inlined by `scripts/inline-references.py`; project detection is shared from `skills/blueprints/references/project-detection.md`. Behaviour is pinned by `claude plugin eval` cases on two new fixtures (Antlers and Blade) plus the existing `eloquent` fixture.

**Tech Stack:** Claude Code plugin (skills, agents), Markdown/YAML, `claude plugin eval`, Statamic 6 (Antlers + Blade), Glide.

**Spec:** `docs/specs/2026-10-26-statamic-kit-templates-design.md`

## Resuming after a break

Every task ends in a commit and a ticked line in the **Progress** list in
`CLAUDE.md` (section "Templates skill — Progress"). To pick up:

1. Read that Progress list and `git log --oneline -5`; the first unticked line is the current task.
2. `git status`: uncommitted changes mean the task was cut off mid-way. Check its steps against the files on disk and continue from the first step whose result is missing.
3. The last `evals/RESULTS.md` entry holds the latest RED/GREEN numbers.
4. An eval run cut off by a usage limit or an auth error is not a result: rerun only that case.

## Global Constraints

- Everything that ships in English; no client names or absolute local paths in skills, fixtures, plans, results or commits.
- Commit messages: subject and body only, **no** `Co-Authored-By` line.
- Eval usage counts against the user's subscription: one `--case` per invocation; `--runs 1` for RED; `--runs 3` only for new or changed cases at GREEN; `-j` at most 3; the full suite once, in Task 6. A judge-only miss in one run: rerun that case once before changing anything.
- Eval command (repo root): `claude plugin eval . --scaffold --allow-tools Bash Write Edit --ablation none --trust-plugin --case <name> --runs <n>`.
- Log every RED/GREEN result with estimated cost in `evals/RESULTS.md`.
- Edit `references/*.md`, never an inlined block; rerun `python3 scripts/inline-references.py` after reference changes.
- Skill boundary (spec "Boundary with `blueprints`"): may set `template:`, `layout:`, `mount:`, `route:`, create the listing page entry and a `Route::statamic` line; never creates collections, taxonomies, blueprints, fieldsets or fields.
- Write only references that a RED failure asked for; record in RESULTS.md which failure each reference answers.

## Review Focus

1. **A template the route never reaches** (collection uses `@blueprint`, or an entry overrides `template:`) → the file goes where that setting resolves. Test: Task 2, `detail-blueprint-mapped`.
2. **Card/teaser fields that don't exist** (listing wants an excerpt, blueprint has none) → stop and offer `blueprints`, no invented handle. Test: Task 3, `templates-missing-field`.
3. **Route change on a collection with entries** → the plan names the URLs that change before approval. Test: Task 3, `templates-route-change-warns`.
4. **Static caching freezes a dynamic part** (query-string filter) → `nocache` or an explicit note. Test: Task 3, `templates-static-cache`.
5. **`blueprints` steals a template request, or the reverse** (e.g. "create a collection" vs "build an overview page") → each fires its own skill. Test: Task 3, `templates-trigger-guard` and the full suite in Task 6.

---

### Task 1: Statamic facts, fixtures and Progress list

**Files:**
- Create: `docs/specs/2026-10-26-templates-statamic-facts.md`
- Create: `evals/fixtures/pages-antlers/`, `evals/fixtures/pages-blade/`
- Modify: `CLAUDE.md` (tick Task 1 in the "Templates skill — Progress" list, which already exists)

**Interfaces:**
- Produces: fixture names `pages-antlers`, `pages-blade`; the facts file that graders (Tasks 2–3) and references (Task 4) cite.

- [ ] **Step 1: Verify against the Statamic 6 docs** (context7 `/websites/statamic_dev`, else statamic.dev) and write each fact with its source URL: template resolution order (entry → collection, `@blueprint`, `blueprint_templates`); mount and the index-route rule (Statamic creates no listing page); `collection` tag `paginate`/`as`/`sort`/`no_results` and the `paginate` pair (Antlers) and the Blade equivalents in Statamic 6; filtering by term (`taxonomy:` parameter or the term's `entries`); taxonomy term route and `show`/`index` templates when attached to a collection; `nav` tag with `children`, `is_current`/`is_parent`; `nav:breadcrumbs`; `glide` tag/pair for `srcset`, asset `alt`; `nocache` tag and Blade equivalent; static caching strategies and query strings.
- [ ] **Step 2: Build `pages-antlers`** (flat file, `composer.lock` with `statamic/cms` 6.x, no `vendor/`): structured `pages` collection with a `home` entry and tree; dated `news` collection, `route: '/news/{slug}'`, no `mount`, no `template`, three entries; news blueprint with `title`, `date`, `intro` (textarea), `image` (assets, max 1), `topics` (terms), `content` (markdown); `topics` taxonomy attached to `news` with three terms; `main` navigation with a two-level tree; `layout.antlers.html` with a header that hard-codes three links; `partials/card.antlers.html` used by the home page; a `page.antlers.html` sibling. No image partial, no breadcrumbs, no news templates.
- [ ] **Step 3: Build `pages-blade`** (same base, Blade): `vacancies` collection with `route: '/vacancies/{slug}'`, `template: '@blueprint'`, blueprint `vacancy` (`title`, `location`, `hours` integer, `image`, `content` bard) and three entries; `layouts/default.blade.php`; `components/card.blade.php` and `components/picture.blade.php` (Glide `srcset`); `main` navigation with a two-level tree; `config/statamic/static_caching.php` with `'strategy' => 'half'`.
- [ ] **Step 4: Check** every YAML file in both fixtures parses (`python3 -c 'import yaml,sys;[yaml.safe_load(open(f)) for f in sys.argv[1:]]' $(find evals/fixtures/pages-* -name '*.yaml')`) → no output.
- [ ] **Step 5: Commit** facts file and fixtures; tick Task 1.

### Task 2: Page-type cases (RED)

**Files:** one directory per case under `evals/`, each with `case.yaml` (`allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]`, `max_turns: 40`, `timeout_seconds: 600`), `prompt.md`, `scaffold.sh` (`bash "$here/../_lib/copy-fixture.sh" <fixture>`), `graders/`.

**Interfaces:**
- Consumes: fixtures and facts from Task 1.
- Produces: grader `skill-fired.md` for this skill, copied into every case:
  `type: tool_used`, `tool: Skill`, `input_match: '"skill"\s*:\s*"(?:statamic-kit:)?templates"'`, `arm: with-only`.

Every prompt ends with "I approve your plan in advance — go ahead without waiting for me." Every case has `skill-fired` and a `regex` grader that no blueprint or fieldset file was written.

| Case | Fixture | Prompt | Content graders |
|---|---|---|---|
| `listing-news-antlers` | pages-antlers | "Build an overview page for the news at /news, 10 per page." | listing page entry exists and `news` gets `mount:` to it; template uses `paginate` and outputs pagination links; has an empty state; reuses `partials/card` (llm) |
| `detail-news-antlers` | pages-antlers | "Make the detail page for news articles." | template at the path `news` resolves to and `template:` set if needed; only handles from the news blueprint (llm); extends the site layout like `page.antlers.html` |
| `detail-blueprint-mapped` | pages-blade | "Make the detail page for vacancies." | file at `resources/views/vacancies/vacancy.blade.php` (the `@blueprint` path); uses `x-picture`; no `template:` edit |
| `taxonomy-archive-topics` | pages-antlers | "Add a page per topic that lists its news articles." | term `show` template at the path the facts file names; lists entries filtered by the term; empty state |
| `nav-main-blade` | pages-blade | "Build the main navigation with dropdowns for subpages." | uses the `main` nav with children and an active state; replaces the layout's hard-coded links only if the plan said so (llm) |
| `breadcrumbs-antlers` | pages-antlers | "Add breadcrumbs to all pages." | `nav:breadcrumbs`; included from the layout; current page not a link (llm) |
| `image-partial-antlers` | pages-antlers | "Make a reusable responsive image partial and use it in the cards." | new partial with Glide `srcset`, alt from the asset, width/height; `partials/card` now uses it |

- [ ] **Step 1: Write the seven cases** with the graders above (regex for paths and tag names from the facts file; llm graders with explicit PASS/FAIL lines like `evals/new-collection-vacancies/graders/fieldtypes.md`).
- [ ] **Step 2: RED** — each case with `--runs 1`. Expected: `skill-fired` 0/1 everywhere (no skill yet). Record per case which content graders the baseline already passes.
- [ ] **Step 3: Commit** cases and a RESULTS.md entry "Templates skill — RED (page types)"; tick Task 2.

### Task 3: Gate and boundary cases (RED)

**Files:** as Task 2.

| Case | Fixture | Prompt | Graders |
|---|---|---|---|
| `templates-plan-gate` | pages-antlers | "Build an overview page for the news." (no pre-approval) | `tool_used` Write/Edit `max: 0`; llm: a plan naming files, wiring lines and template outline, ending in a question |
| `templates-missing-field` | pages-antlers | "Show the author's name on the news detail page." (pre-approved) | no file written; llm: says `author` does not exist and offers the `blueprints` skill; no invented handle |
| `templates-route-change-warns` | pages-blade | "Put the vacancies under /jobs." (no pre-approval) | no writes; llm: plan names the URLs that change |
| `templates-static-cache` | pages-blade | "Let visitors filter the vacancies overview by location with a query string." (pre-approved) | llm: `nocache` around the dynamic part, or the plan/summary states the static-caching consequence |
| `templates-eloquent` | eloquent | "Make the detail page for pages." (pre-approved) | no YAML written; llm: template written or planned, wiring pointed to the Control Panel |
| `templates-multisite` | multisite | "Add breadcrumbs to all pages." (pre-approved) | regex `not_contains` hard-coded `/nl/` or `/en/`; llm: links from `url` |
| `templates-trigger-guard` | pages-antlers | "Add a subtitle field to the news blueprint." (pre-approved) | grader `templates-not-fired` (`tool_used` Skill, templates match, `max: 0`) and the `blueprints` `skill-fired` grader |

- [ ] **Step 1: Write the seven cases** with the graders above.
- [ ] **Step 2: RED** — each case with `--runs 1`; record results. `templates-trigger-guard` is expected to pass already (it guards against a regression in Task 4).
- [ ] **Step 3: Commit** with a RESULTS.md entry; tick Task 3.

### Task 4: The skill (GREEN)

**Files:**
- Create: `skills/templates/SKILL.md`
- Create: `skills/templates/references/<topic>.md` — only for RED failures; expected candidates: `wiring.md` (resolution, mount, route, listing entry), `listings.md` (pagination, empty state, filtering, archives), `navigation.md` (nav, breadcrumbs), `images.md` (Glide partial), `static-caching.md`.
- Modify: `scripts/inline-references.py` — add `"skills/templates/SKILL.md": [BP + "project-detection.md", <the new references that every run needs>]`.

**Interfaces:**
- Consumes: the facts file (Task 1); cases (Tasks 2–3).
- Produces: skill `statamic-kit:templates`; its Verify step's reviewer dispatch is added in Task 5.

- [ ] **Step 1: Write SKILL.md** — frontmatter `name: templates` and a `description` that triggers on listing/overview/archive/detail/show page, navigation, menu, breadcrumbs and responsive image requests (English and Dutch, e.g. "maak een overzichtspagina"), and says structure requests go to `blueprints`. Workflow: 1 Detect (Project detection + layout, sibling page templates, the collection's blueprint, template resolution, static caching, multisite; Eloquent rule from the spec); 2 Stop on ambiguity (missing structure → offer `blueprints`; several candidate collections or navs → ask); 3 Plan gate (files, wiring lines, URLs that change, template outline, conventions followed; same no-write rule and wording as `blueprints` step 3); 4 Write (model on closest sibling, reuse partials/components); 5 Verify (YAML parses, the template path is the one the collection resolves to, every variable is a blueprint handle or system variable). Out of scope: the spec's non-goals.
- [ ] **Step 2: Write the references** RED asked for, citing the facts file; run `python3 scripts/inline-references.py` then `--check` → up to date.
- [ ] **Step 3: Validate** — `claude plugin validate .` → "Validation passed".
- [ ] **Step 4: GREEN** — every Task 2 and Task 3 case with `--runs 3`. Expected: all graders 3/3. A failing grader: fix the skill or reference, rerun that case only.
- [ ] **Step 5: Commit** with a RESULTS.md GREEN entry naming which reference fixed which RED failure; tick Task 4.

### Task 5: Reviewer on page templates

**Files:**
- Modify: `agents/template-reviewer.md` (description and scope: the six page types; the page checks from the spec's "Template reviewer" section)
- Modify: `skills/templates/SKILL.md` (Verify: "Template review" block, same wording and rules as in `skills/blueprints/SKILL.md` step 5)
- Create: case `review-listing` on a new fixture `review-listing` (copy of `pages-antlers` plus a seeded `news/index.antlers.html` with: no empty state, pagination without links, a second `<h1>`, `{{ summary }}` which is not in the blueprint, `<img>` without alt)
- Modify: `case.yaml` of `listing-news-antlers` and `detail-blueprint-mapped` — add `Agent` to `allowed_tools`; graders `reviewer-fired.md` and `reviewer-max-two.md` (copy from `evals/inline-antlers-add-faq/graders/`)

- [ ] **Step 1: RED** — `review-listing` (prompt "Review resources/views/news/index.antlers.html."; graders: `reviewer-fired`, no edits, llm PASS if at least four of the five seeded defects are named with line and fix and nothing is invented) and the two modified cases, `--runs 1`. Expected: reviewer reports out of scope or misses page checks; `reviewer-fired` 0/1 on the two write cases.
- [ ] **Step 2: Extend the agent and the Verify step.**
- [ ] **Step 3: GREEN** — the three cases with `--runs 3`; then the six existing `review-*` cases with `--runs 1` (no regression).
- [ ] **Step 4: Commit** with a RESULTS.md entry; tick Task 5.

### Task 6: Full suite, docs, QA protocol

**Files:**
- Modify: `README.md` (Components table: `/statamic-kit:templates` row; reviewer row mentions page templates)
- Modify: `CLAUDE.md` (Status, Progress ticked, "Next up")
- Modify: `IDEAS.md` (section 2: what shipped, what stays for later)
- Modify: `docs/qa/test-protocol.md` (a templates section: one prompt per page type plus the missing-field and route-change gates, with expected behaviour and a results row each)
- Modify: `evals/RESULTS.md`

- [ ] **Step 1: Full suite once** — `claude plugin eval . --scaffold --allow-tools Bash Write Edit --runs 1 --ablation none -j 3 --trust-plugin`. Expected: every case 1.00; in particular the `blueprints` and `forms` `skill-fired` graders still pass. Rerun infrastructure stops one case at a time; a single judge-only miss gets one rerun.
- [ ] **Step 2: Done means** — `claude plugin validate .` → "Validation passed"; `python3 scripts/inline-references.py --check` → up to date; `claude plugin test .` → passes.
- [ ] **Step 3: Update the docs** listed above.
- [ ] **Step 4: Commit**; tick Task 6. Ask the user before bumping `version` in `.claude-plugin/plugin.json` (that ships a release).
