# QA round 2026-10-25 — Antlers, flat file

Run with `docs/qa/test-protocol.md` against a real site, on a copy of its
working tree (it had uncommitted work; the original was not touched). Each
case ran headless in its own APFS clone of the copy, five at a time.

**Round:** 2026-10-25 · plugin commit `17db874` (branch
`docs/qa-test-protocol`; plugin files identical to `main`) · Claude Code
2.1.310 · profile **A** · Antlers only · Statamic 6.31 · multisite no ·
runtime available yes · largest blueprint 444 lines (`page.yaml` with an
inline 12-set replicator; no fieldsets).

Site shape: one collection (`pages`, one blueprint), one inline page builder
dispatched with `{{ partial src="blocks/{type}" }}`, one form rendered by a
generic block that loops over `{{ fields }}`, five globals, no navigations or
taxonomies, one asset container, `roles.yaml` / `groups.yaml` holding only a
commented-out example. The site has its own detailed `CLAUDE.md`. The
superpowers plugin was loaded alongside, as in daily use; it didn't interfere.

Total cost $11.70 for 31 turns.

## Results

| ID | Result | Skill(s) fired | Agent | Writes OK | Diff check | Runtime check | Mod notes | Cost | Notes |
|---|---|---|---|---|---|---|---|---|---|
| BP-1 | pass | blueprints | — | yes | — | — | — | 0.41 | Plan complete; asked about a background token (site CLAUDE.md vs siblings) |
| BP-1 T2 | pass | — | template-reviewer | yes | pass | not run (harness) | none | 0.75 | Template review section + `Bad practice`; should-fix offered, not applied |
| BP-1N | n/a | | | | | | | | site has a builder |
| BP-2 | n/a | | | | | | | | profile A |
| BP-3 | pass | blueprints | — | yes | — | — | — | 0.35 | Dutch trigger; pointed to the existing CTA set as a better fit; English CP labels kept |
| BP-4 | pass | blueprints | — | yes | — | — | — | 0.31 | Existing set found; offered to extend |
| BP-5 | pass | blueprints | — | yes | — | — | — | 0.39 | |
| BP-5 T2 | pass | — | — | yes | pass | ran | none | 0.54 | |
| BP-6 | n/a | | | | | | | | profile A |
| BP-7 | n/a | | | | | | | | no collection with several blueprints |
| BP-8 | pass | blueprints | — | yes | pass | not run (harness) | none | 0.83 | Flagged that no template shows the field |
| BP-9 | pass | blueprints | — | yes | — | — | — | 0.28 | Footer phone/address already in a global; no duplicate proposed |
| BP-10 | partial | blueprints | — | yes | — | — | — | 0.42 | `references/navigation.md` read denied; plan built from project files and said so |
| BP-11 | pass | blueprints | — | yes | — | — | — | 0.35 | Targets the asset metadata blueprint |
| BP-12 | pass | blueprints | — | yes | — | — | — | 0.29 | `blueprints`, not `users` |
| BP-13 | pass | — | — | n/a | — | — | — | 0.25 | No statamic-kit skill |
| FO-1 | pass | forms | — | yes | pass | not run (harness) | none | 0.79 | Saw that the template loops over fields: blueprint-only change, review correctly skipped |
| FO-2 | pass | forms | template-reviewer | yes | pass | not run (harness) | none | 1.07 | No new template needed (generic block); reviewer run on the existing one anyway |
| FO-3 | n/a | | | | | | | | one form |
| FO-4 | n/a | | | | | | | | forms in files |
| FO-5 | n/a | | | | | | | | site has a form |
| US-1 | n/a | | | | | | | | covered by US-5 (roles file only has a comment) |
| US-2 | pass | users | — | yes | — | — | — | 0.25 | Listed what exists; no invented handle |
| US-3 | pass | users | — | yes | — | — | — | 0.29 | No `editor` role; proposed one; all permission strings valid |
| US-4 | n/a | | | | | | | | roles in files |
| US-5 | pass | users | — | yes | pass | not run (harness) | none | 0.62 | Listed what the role cannot do; replaced the commented example, as planned |
| RV-1 | pass | template-review | template-reviewer | yes | — | — | — | 0.31 | true/false positives: 4/0. Dispatcher not read |
| RV-2 | n/a | | | | | | | | Antlers site |
| RV-3 | pass | template-review | template-reviewer | yes | — | — | — | 0.30 | true/false positives: 3/0. Dispatcher and layout not read |
| RV-4 | pass | template-review | template-reviewer | yes | — | — | — | 0.35 | true/false positives: 8/0; honeypot and CSRF correctly not reported |
| RV-5 | pass | template-review | template-reviewer | yes | — | — | — | 0.24 | Listed candidates; reviewed nothing else |
| MO-1 | pass | — | — | — | — | — | duplicate handle | 0.21 | |
| MO-2 | pass | — | — | — | — | — | tab indentation, Symfony error | 0.20 | |
| MO-3 | pass | — | — | — | — | — | set without template | 0.23 | |
| MO-4 | pass | — | — | — | — | — | partial without set | 0.20 | |
| MO-5 | pass | — | — | — | — | — | config without blueprint | 0.20 | |
| MO-6 | pass | — | — | — | — | — | none (as expected) | 0.19 | |
| MO-7 | n/a | | | | | | | | profile A |

**30 pass, 1 partial** of 31 turns run. No plan turn wrote anything, and no
write turn touched a file outside its plan.

**Runtime checks.** "Not run (harness)" means the subject tried the right
`tinker` command but the harness denied it (see **Harness notes**). Every
subject said so instead of claiming the check. The operator then ran the same
read-only checks on each result: the new set, field, form fields and role all
load in Statamic. A new collection (BP-5) only showed up after
`php please stache:clear`; the subject's own `Blueprint::find` check passed,
and it told the user to clear the cache.

**Human check:** not done.

## Findings

### BP-10 — navigation reference not readable
Profile: A, Antlers
Severity: minor
Observed: "I couldn't read the skill's `references/navigation.md` (permission
was denied), so this plan is based on the project's own files." The plan was
still sound: it proposed a field on the existing menu global, with a native
navigation as the alternative.
Expected: the reference is read. In an interactive session the user gets a
permission prompt for it; headless, it is denied.
Site shape that triggers it: any navigation request.
Proposed fix: inline `navigation.md` (and check `globals.md`,
`entry-blueprints.md`, `fieldtypes.md` the same way) into the blueprints
SKILL.md, or accept the prompt. Eval: none needed; the eval sandbox allows the
read.

### RV-1, RV-3, RV-4 — reviewer skips the dispatcher and layout
Profile: A, Antlers
Severity: minor
Observed: "It didn't open `page.antlers.html` and relied on CLAUDE.md's
description of how that file loads each block." RV-3 also skipped the layout.
The findings were still correct here.
Expected: the agent's **Read first** list has the dispatcher (step 3) and the
layout (step 5).
Site shape that triggers it: a site `CLAUDE.md` that describes the block
dispatch.
Proposed eval case: a review fixture with a `CLAUDE.md` describing the
dispatch, where the dispatcher passes a variable under a different name than
the `CLAUDE.md` text suggests (for example `scope="block"`). Grader: the
report uses the real variable and lists the dispatcher under What I read.

### RV-4 / FO-2 — unescaped old input rated must-fix
Profile: A, Antlers
Severity: minor (calibration)
Observed: `value="{{ old }}"` was reported as must-fix reflected XSS. That's
technically true: Statamic passes `old()` through unchanged and Antlers
doesn't escape. But the form tag adds a CSRF token, so another site can't
make a visitor's browser submit the payload, and only self-XSS remains.
Expected: true positive; the agent's rule says visitor input goes through
`| sanitize`. The rating could mention the CSRF limit.
Proposed change: none required. Optionally, add a line to the agent: weigh
exploitability (CSRF-protected form → should-fix) when rating visitor-input
escaping.

### FO-2 — reviewer dispatched without a template change
Profile: A, Antlers
Severity: note
Observed: the forms skill wrote config and blueprint only (the site's
generic form block renders any form), then dispatched the reviewer on that
existing template. The skill says the review runs only when the run wrote or
changed a template. The review was useful: it found the escaping issue, and
the skill correctly asked before touching a file outside the plan.
Proposed change: make it official. When a new form will be rendered by an
existing generic template, review that template.

## Harness notes (fed back into the protocol)

- **php path.** The site's `CLAUDE.md` tells Claude to use an absolute PHP
  binary, so `Bash(php *)` didn't match and most runtime checks were denied.
  The protocol now asks for the site's PHP binary in the allowlist.
- **Clones instead of resets.** One APFS clone (`cp -cR`) per case makes cases
  independent and lets them run in parallel; no reset step is needed. Added
  to the protocol as an option.
- Subjects tried a few writes outside the project (temporary verify
  scripts) and `please cache:clear`. All were denied; none affected a result.
