# statamic-kit: template reviewer agent — design

Date: 2026-10-24. Status: draft for approval.

## Intent

The `blueprints` and `forms` skills write Antlers partials and Blade components.
They already model new templates on the closest sibling, but the skill that
writes a template is a weak judge of it. QA on a real Statamic 6 Blade site
showed a generated FAQ partial that followed the site's design system well and
still had six weaker points: a `@foreach` with no guard for missing data, the
same default text in both the YAML and the template, an `<h2>` styled as a
small label (a false entry in the heading outline), no focus styling on
`<summary>`, a missed `FAQPage` structured-data opportunity on a site that has
its own structured-data component, and a set without the `icon:` every sibling
had.

A read-only reviewer agent gives a second look in its own context. It reads the
template, the blueprint behind it, sibling templates and the site's
conventions, and returns findings. It changes nothing.

## Goals

- Catch the mistakes above, and their kin, in templates the skills generate.
- Judge a template against **this site's** conventions first, generic best
  practice second.
- Keep the main conversation's context small: the reviewer reads siblings,
  blueprints and layout files itself and returns only findings.
- Also usable on request: "review the templates for the page builder", "check
  this partial".
- **Scope:** page-builder set templates (Antlers partials, Blade components)
  and form templates. Collection show/index templates and layouts are out of
  scope for now; the reviewer reads them only as context.

## Non-goals

- Editing files. The reviewer only reports; the calling skill (or the user)
  decides.
- Styling or visual design review (colours, spacing, taste).
- Reviewing PHP, JS, CSS or controllers.
- Whole-site audits of hundreds of templates in one go. Scope is the templates
  named, or those a skill just wrote.

## Anti-goals (a failure even if it technically works)

- **Nagging about the site's own choices.** If every sibling does X, a new
  template doing X is not a defect. It may be reported, but marked as
  under **Bad practice** (see Output), never as must-fix.
- **Long generic checklists** in the output. Only findings that apply, each
  with file, line and a concrete fix.
- **False alarms on language rules**, e.g. flagging a missing null guard in an
  Antlers loop where Antlers already handles a missing value, or demanding
  escaping the site never uses for trusted CMS content.

## What it checks

Ordered by severity class. The builder writes the exact checklist; these are the
required topics.

1. **Field coverage and handles.** Every variable is a real handle on the set
   (or its grid/replicator rows) in the blueprint; every blueprint field is
   rendered or obviously intentionally omitted.
2. **Data robustness.** Loops and nested access survive missing or empty data
   (old entries, imports) in the template language's own terms — in Blade a
   `@foreach` over a possibly-null value; in Antlers only where Antlers does
   not already cope.
3. **Output and escaping.** Raw output (`{!! !!}`, Antlers raw modifiers) only
   for fields that store HTML (Bard, rendered Markdown) and consistent with
   siblings; Bard rendered the way the site renders Bard elsewhere.
4. **Semantics and accessibility.** Heading levels fit the page outline (a
   label styled small is not a heading), interactive elements have focus
   styles where the site provides them elsewhere, images have alt text from a
   field, link text is meaningful.
5. **Consistency with siblings.** Same wrapper, tokens/utilities, component
   use, comment style; no classes or frameworks the siblings don't use.
6. **Forms** (form templates only). Validation errors shown per field and
   old input kept, `<label for>` linked to each input, required fields
   marked, the honeypot and CSRF handled the way the site's other forms do,
   every blueprint field rendered when fields are listed by hand.
7. **Missed opportunities.** Site helpers not used (structured-data component,
   image component), duplicated defaults between YAML and template, a set
   lacking keys every sibling set has (e.g. `icon:`).

## Output

A short report the caller can act on:

- One line verdict: `clean` or `N findings (M must-fix)`.
- Findings about what the new or changed template introduces, grouped by
  severity: **must-fix** (broken or wrong output, unsafe raw output),
  **should-fix** (robustness, accessibility, missed site helper),
  **suggestion**.
- A separate heading **Bad practice** (user's choice): points that are not
  OK but match how the rest of the site does it. Each names the practice, the
  sibling files that do the same, and the risk in one sentence. The skill
  never fixes these on its own (that would make the new template the odd one
  out); they are listed for the user to decide on site-wide.
- Each finding: file:line, what is wrong, why it matters here, the concrete
  fix (a short snippet in the template's language).
- What it read to judge (blueprint, siblings, layout), so the caller can trust
  the verdict.

## Decided

- **Agent, not a skill step** (user's choice): `agents/template-reviewer.md`,
  invoked as `statamic-kit:template-reviewer`.
- **Read-only**: tools limited to Read, Grep, Glob.
- **When it runs** (user's choice): automatically in the Verify step of
  `blueprints` and `forms`, but **only when the skill wrote or changed a
  template**; a YAML-only change does not start it. Also on request.
- **Fixing findings** (user's choice): the skill fixes small must-fix
  findings itself, only in files that were in the approved plan, and then
  reports them plainly ("the reviewer found X; I changed Y"). Anything larger,
  or in another file, is listed and asked about. At most one fix-and-review
  round, so it cannot loop.
- **Templates in scope** (user's choice): set templates and form templates;
  not show/index templates.
- **No page-builder split** for now: the reviewer works on templates whichever
  skill wrote them. Revisit only if the skills grow too large.
- **Shipped content in English**; no client names or local paths in the
  agent, fixtures or commits.

## My calls (not discussed; check these)

- **Shared weaknesses outrank severity.** When every sibling already does the
  same thing — including raw output of a field that does not store HTML — the
  finding goes under **Bad practice**, with a sentence on the risk, never must-fix.
  Must-fix is reserved for what the new template introduces.
- **Model:** `sonnet` — review needs judgement, but not the main model's cost.
- **Its knowledge lives in the agent file itself.** Reading plugin reference
  files from outside the user's project needs a permission grant (see
  `evals/RESULTS.md`, 2026-10-21/22), so the checklist and the Antlers/Blade
  rules it needs are written into `agents/template-reviewer.md`, not into
  separate references.
- **Eval cost:** existing write cases will now also start the reviewer. Only
  the cases that write templates are rerun when the wiring lands; the full
  suite runs once before the final commit.

## Constraints

- Follows the plugin's conventions in `plugins/statamic-kit/CLAUDE.md`: full
  agent frontmatter (`name`, `description`, `model`, `color`, least-privilege
  `tools`), validated with `claude plugin validate`.
- Eval loop as for the skills: fixtures and RED cases first, then the agent,
  then GREEN. Eval runs count against the user's subscription usage: run only
  the affected cases, the full suite once before the final commit.
- Statamic 6, Antlers and Blade; verify language rules (Antlers escaping and
  missing-value behaviour, Bard rendering in Blade) against the Statamic 6
  docs during the build rather than from memory.

## Left to the builder

- The exact checklist wording and the agent's description/trigger phrasing.
- Fixture design: at least one Blade and one Antlers fixture with seeded
  defects matching the six QA observations, plus a clean template that must
  come back `clean` (guards the anti-goals), and a **Bad practice** case.
- Graders: findings named (llm judge), no edits by the agent, the skill
  dispatching the agent after writing a template, must-fix fixed within scope.
- How the skills' Verify step words the dispatch.
