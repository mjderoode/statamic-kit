# statamic-kit template reviewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A read-only `statamic-kit:template-reviewer` agent that reviews Antlers/Blade set templates and form templates against the site's own conventions, run automatically by `blueprints` and `forms` after they write a template, and on request.

**Architecture:** One agent file (`agents/template-reviewer.md`) holds the whole checklist and the language rules (no separate references: plugin files outside the user's project need a permission grant). The skills' Verify step dispatches it only when a template was written or changed, fixes small must-fix findings in approved files, and reports the rest. Eval cases with seeded-defect fixtures prove it.

**Tech Stack:** Claude Code plugin (agents, skills), `claude plugin eval` cases (`case.yaml`, `prompt.md`, `graders/*.md`, `scaffold.sh`), Statamic 6 Antlers and Blade fixtures.

**Spec:** `docs/specs/2026-10-24-statamic-kit-template-reviewer-design.md`

## Global Constraints

- All shipped content in English; no client names or absolute `/Users` paths in the agent, fixtures, plans or commits.
- Agent frontmatter: `name: template-reviewer`, `description`, `model: sonnet`, `color`, `tools: Read, Grep, Glob` (nothing else).
- Read-only: the agent never edits; only the calling skill fixes.
- Severity groups in the report: **must-fix**, **should-fix**, **suggestion**, plus a separate heading **Bad practice** for weaknesses every sibling shares (never must-fix, never fixed by the skill).
- Dispatch only when a skill wrote or changed a template; YAML-only changes do not start it. At most one fix-and-review round.
- Scope: set templates and form templates; show/index templates and layouts only as context.
- Eval usage counts against the user's subscription: one `--case` per invocation, `--runs 1` for RED, `--runs 3` only for the new cases at GREEN, `-j` ≤ 3; full suite once, in Task 4.
- Eval command (from the repo root): `claude plugin eval plugins/statamic-kit --scaffold --allow-tools Bash Write Edit --ablation none --trust-plugin --case <name> --runs <n>`.
- After each task, tick its line in the Progress list in `plugins/statamic-kit/CLAUDE.md` and commit (sessions get cut off). Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **The named file does not exist or is not a template** → the agent says so and reviews nothing; it does not guess another file. (Test: Task 1, `review-missing-file`.)
2. **A first block with no siblings** → no **Bad practice** section; judge against the blueprint and generic rules only. (Test: Task 1, `review-no-siblings`.)
3. **A finding in a file outside the approved plan** (e.g. the dispatching layout) → the skill lists and asks, does not edit it. (Test: Task 3, grader `layout-untouched` on `fieldset-blade-add-faq`.)
4. **Antlers scoping and missing values** (`{{ items }}` over a missing field, `scope=`) → no false "missing guard" finding. (Test: Task 1, `review-antlers-clean`.)
5. **The review loops** (fix, review, fix again) → at most two reviewer dispatches per run. (Test: Task 3, `tool_used Agent max: 2` on the write cases.)

---

### Task 1: Fixtures and cases for the reviewer on request (RED)

**Files:**
- Create: `plugins/statamic-kit/evals/fixtures/review-blade/` — Blade site modelled on `fixtures/fieldset-blade` (fieldset page builder, `components/blocks/*.blade.php` dispatched by `<x-dynamic-component>`), with three siblings (`intro`, `image`, `callout`) that share one weakness: a `textarea` field output with `{!! !!}`; every set has `icon:`; a layout with an `<x-structured-data>` component; and a new `faq` set + `components/blocks/faq.blade.php` seeded with the six QA defects (no guard on `@foreach ($block['items'])`, `default:` in YAML repeated as `?:` in Blade, `<h2>` styled as a small label while `heading` blocks use `<h2>` as section title, `<summary>` without focus style though siblings style `:focus-visible`, no FAQPage structured data, no `icon:`) and the same raw `textarea` output as the siblings.
- Create: `plugins/statamic-kit/evals/fixtures/review-antlers/` — Antlers site (`{{ partial src="blocks/{type}" }}`) with siblings and a well-made new partial that matches them (loops over a possibly missing field, `{{ if }}` guards where siblings use them).
- Create: `plugins/statamic-kit/evals/fixtures/review-form/` — copy of `fixtures/nav-forms` where `partials/contact-form.antlers.html` lacks per-field errors, old input, `<label for>` and the honeypot the other form on the site has.
- Create cases (each: `case.yaml` with `allowed_tools: [Read, Glob, Grep, Skill, Agent, Bash]`, `prompt.md`, `scaffold.sh` calling `_lib/copy-fixture.sh`, `graders/`):
  - `review-blade-defects` — prompt "Review resources/views/components/blocks/faq.blade.php."
  - `review-bad-practice` — same fixture, prompt "Check the FAQ block's template against the rest of the site."
  - `review-antlers-clean` — prompt "Review resources/views/blocks/<new>.antlers.html."
  - `review-form` — prompt "Review the contact form template."
  - `review-missing-file` — `review-blade` fixture, prompt "Review resources/views/components/blocks/pricing.blade.php." (does not exist)
  - `review-no-siblings` — new fixture `review-single` (one inline builder, one set, its single Antlers partial), prompt "Review resources/views/blocks/hero.antlers.html."

**Interfaces:**
- Produces: fixture names above; grader `reviewer-fired.md` (copy into each case):
  `type: tool_used`, `tool: Agent`, `input_match: '"subagent_type"\s*:\s*"(?:statamic-kit:)?template-reviewer"'`, `arm: with-only`.

- [ ] **Step 1: Write fixtures and cases with graders**
  - every case: `reviewer-fired`; `no-edits` / `no-writes` (`tool_used`, `max: 0`); a `regex` `not_contains`/content grader that the reviewed file is unchanged.
  - `review-blade-defects` llm: PASS if the reply names at least five of the six seeded defects with file:line and a fix; FAIL if any is invented that is not in the file.
  - `review-bad-practice` llm: PASS if the raw `textarea` output appears under a **Bad practice** heading naming the sibling files, and not under must-fix; FAIL otherwise.
  - `review-antlers-clean` llm: PASS if the verdict is `clean` or only suggestions; FAIL on any must-fix/should-fix, in particular a "missing guard" on an Antlers loop.
  - `review-form` llm: PASS if it names missing errors, old input, labels and the honeypot (compared to the site's other form).
  - `review-missing-file` llm: PASS if it says the file does not exist and reviews no other file as a substitute.
  - `review-no-siblings` llm: PASS if there is no **Bad practice** section and it says there are no siblings to compare with.
- [ ] **Step 2: RED** — run each case with `--runs 1`. Expected: `reviewer-fired` 0/1 everywhere (the agent does not exist); note which content graders the main model already passes.
- [ ] **Step 3: Commit** fixtures, cases and the RED numbers (in a new `evals/RESULTS.md` entry, costs as "estimated").

### Task 2: The agent (GREEN for Task 1)

**Files:**
- Create: `plugins/statamic-kit/agents/template-reviewer.md`
- Delete: `plugins/statamic-kit/agents/.gitkeep` if present

**Interfaces:**
- Consumes: Task 1 cases.
- Produces: agent `statamic-kit:template-reviewer`; its input contract (what a caller passes): the template path(s), the blueprint/fieldset path and set handle (or form handle), and optionally "written by skill X in this run". Its output contract: the report shape in the spec's Output section — verdict line, must-fix / should-fix / suggestion, **Bad practice**, "What I read".

- [ ] **Step 1: Verify the language rules against Statamic 6 docs** (context7 or statamic.dev): Antlers escaping default and raw output, Antlers behaviour on a missing/null field in a tag pair and `{{ if }}`, Bard rendering in Blade (augmented value vs `save_html`), form tag variables for errors/old input/honeypot in Antlers and Blade. Note each rule with its source in the commit message, not in the agent.
- [ ] **Step 2: Write the agent** — frontmatter per Global Constraints; `description` triggers on "review/check this template/partial/component/form template" and states it is read-only; body: what to read first (the template, its blueprint/fieldset or form blueprint, the dispatcher, two or three closest siblings, the layout for site helpers), the seven checks from the spec in order, the shared-weakness rule (all siblings do it → **Bad practice**), the anti-goals as explicit "do not report" rules, the missing-file and no-siblings rules, and the report template.
- [ ] **Step 3: Validate** — `claude plugin validate plugins/statamic-kit` → "Validation passed" (existing warnings only).
- [ ] **Step 4: GREEN** — each Task 1 case with `--runs 3`. Expected: all graders 3/3. A judge-only miss in one run: rerun that case once before changing the agent.
- [ ] **Step 5: Commit** the agent and a RESULTS.md GREEN line.

### Task 3: Wire the reviewer into `blueprints` and `forms`

**Files:**
- Modify: `plugins/statamic-kit/skills/blueprints/SKILL.md` (### 5. Verify)
- Modify: `plugins/statamic-kit/skills/forms/SKILL.md` (### 5. Verify)
- Modify: `case.yaml` of the template-writing cases — `inline-antlers-add-faq`, `fieldset-blade-add-faq`, `custom-paths-add-faq`, `set-group-placement`, `set-group-tie`, `form-add-field`, `new-form`, `duplicate-handle` — add `Agent` to `allowed_tools`, and `user-add-field` (YAML only).
- Create graders: `reviewer-fired.md` + `reviewer-max-two.md` (`tool_used Agent`, same `input_match`, `max: 2`) in `inline-antlers-add-faq`, `fieldset-blade-add-faq`, `form-add-field`; `reviewer-not-fired.md` (`max: 0`) in `user-add-field`; `reports-review.md` (llm: the final reply says what the reviewer found and what was changed, or that it came back clean; Bad practice items are listed, not fixed) and `layout-untouched.md` (regex: `resources/views/components/page-builder.blade.php` and `default.blade.php` unchanged) in `fieldset-blade-add-faq`.

**Interfaces:**
- Consumes: agent name and input contract from Task 2.

- [ ] **Step 1: Add the graders and `Agent` to `allowed_tools`**; RED with `--runs 1` on `inline-antlers-add-faq`, `fieldset-blade-add-faq`, `form-add-field`, `user-add-field`. Expected: `reviewer-fired` 0/1, `reviewer-not-fired` 1/1.
- [ ] **Step 2: Add to each Verify step** a "Template review" block: only if this run wrote or changed a template, dispatch `statamic-kit:template-reviewer` with the template path(s), the blueprint/fieldset (or form) path and handle; then fix small must-fix findings in files that were in the approved plan, review once more at most, and report: what the reviewer found, what was changed, the **Bad practice** list for the user to decide on, and anything else as a question. Never fix Bad practice items or files outside the plan.
- [ ] **Step 3: Run** `python3 plugins/statamic-kit/scripts/inline-references.py --check` → "up to date" (Verify is outside the inlined block; rerun the script if not).
- [ ] **Step 4: GREEN** — the four cases with `--runs 3`, then the other five modified cases with `--runs 1`. Expected: all pass.
- [ ] **Step 5: Commit** with a RESULTS.md entry.

### Task 4: Docs and full suite

**Files:**
- Modify: `plugins/statamic-kit/README.md` (Components table: `statamic-kit:template-reviewer` row)
- Modify: `plugins/statamic-kit/CLAUDE.md` (Status line, Roadmap "Then:" item done, Progress ticked; QA protocol note: next round covers the reviewer and needs no `--add-dir`)
- Modify: `plugins/statamic-kit/evals/RESULTS.md`

- [ ] **Step 1: Full suite once** — `claude plugin eval plugins/statamic-kit --scaffold --allow-tools Bash Write Edit --runs 1 --ablation none -j 3 --trust-plugin`. Expected: every case 1.00. Rerun only cases that stopped on infrastructure errors (usage limit, auth), one `--case` at a time.
- [ ] **Step 2: Done means** — `claude plugin validate plugins/statamic-kit`, `claude plugin validate .`, inline-references `--check`.
- [ ] **Step 3: Update docs and commit.**
