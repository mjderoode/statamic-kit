# statamic-kit QA test protocol

A script for one QA round of statamic-kit on a **real Statamic site**. A
Claude session (the *operator*) works through it from top to bottom. It starts
each test case as a separate headless Claude run with the plugin loaded (the
*subject*), then inspects what the subject did and fills in the results.

The protocol works on any Statamic site. Phase 0 sorts the site into a
profile, and every case states what is expected per profile, so the same script
covers:

- a classic flat-file site with Antlers templates, and
- a Blade-heavy site that uses the Eloquent driver (for structure, or only for
  content).

The results go back to the plugin repo: every finding becomes a RED eval case
or a fix (see **Reporting back**).

---

## Ground rules

1. **Never on production.** Run against a local copy of the site.
2. **Git is the safety net.** The working tree must be clean before you start
   (`git status --porcelain` prints nothing). If it is not, stop and ask the
   human. Work on a throwaway branch and reset after every case (see **Reset**).
   Never commit, push or merge anything in the site repo.
3. **No database writes.** Do not run migrations, `php please` commands that
   write, imports/exports of the Eloquent driver, or anything that changes
   content. The subject's runtime checks (`php artisan tinker --execute=…`)
   are read-only; if you see a subject run anything else against the
   database, stop and record it as a **blocker**.
4. **Don't help the subject.** Use the prompts as written, with only the
   `<placeholders>` filled in. Don't add hints. If a case can't run on this
   site, mark it `n/a` with the reason.
5. **No client data in the results.** The results come back to a public repo.
   In results and findings, write generic names: "the page builder fieldset",
   "a collection with two blueprints", "the contact form". Don't use client
   names, domains, e-mail addresses or local paths. Quote at most a few
   generic lines of YAML or markup.

---

## Setup

Run these in the site root. Start the operator session **without** the
plugin (a plain `claude`), so the plugin's skills don't fire in your own
session. If statamic-kit is also installed from the marketplace, disable it
for this round (`/plugin`). Otherwise the subject may load the installed
copy instead of the repo under test.

```sh
KIT=/path/to/statamic-kit                 # the plugin repo under test
QA=$(mktemp -d)/statamic-kit-qa           # transcripts; outside the site repo
mkdir -p "$QA"

claude plugin validate "$KIT"             # must print "Validation passed"
git -C "$KIT" rev-parse --short HEAD      # record as "plugin commit"
git status --porcelain                    # must be empty
git switch -c qa/statamic-kit             # throwaway branch
```

### Running a case

Each case gets a fresh headless run. A two-turn case (plan, then approval)
continues that same run with `--resume`.

```sh
run() {  # run <case-id> <turn> "<prompt>" [session-id]
  local resume=()
  [ -n "$4" ] && resume=(--resume "$4")
  claude -p "$3" "${resume[@]}" \
    --plugin-dir "$KIT" \
    --output-format stream-json --verbose \
    --permission-mode acceptEdits \
    --allowedTools "Bash(php *)" "Bash(ruby *)" "Bash(python3 *)" \
                   "Bash(git status*)" "Bash(git diff*)" "Bash(ls *)" "Bash(grep *)" \
    > "$QA/$1-$2.jsonl"
  jq -r 'select(.type=="system" and .subtype=="init") | .session_id' "$QA/$1-$2.jsonl" | head -1
}
```

`acceptEdits` lets the subject write. That is intended: the plan gate is
tested by checking that it **didn't** write in the plan turn. If a flag is
rejected, check `claude --help` and adjust; record the change under
**Notes**.

### Inspecting a run

```sh
inspect() {  # inspect <case-id>-<turn>
  local f="$QA/$1.jsonl"
  echo "## skills";  jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and .name=="Skill") | .input.skill' "$f"
  echo "## agents";  jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and (.name=="Agent" or .name=="Task")) | .input.subagent_type' "$f"
  echo "## writes";  jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and (.name=="Write" or .name=="Edit")) | "\(.name) \(.input.file_path)"' "$f"
  echo "## bash";    jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and .name=="Bash") | .input.command' "$f"
  echo "## mod notes"; grep -o 'statamic-kit: [^"\\]*' "$f" | sort -u
  echo "## cost";    jq -r 'select(.type=="result") | "$\(.total_cost_usd)  turns=\(.num_turns)"' "$f"
  echo "## reply";   jq -r 'select(.type=="result") | .result' "$f"
  echo "## tree";    git status --porcelain
}
```

For each case, check **skills**, **writes**, **tree** and the **reply**
against the expected behaviour. Also look at **bash**: a write through Bash
(`>`, `tee`, `sed -i`, `cp`) counts as a write.

### Reset

After every case, including failed ones:

```sh
git diff > "$QA/<case-id>.diff"           # keep the change for the record
git checkout -- . && git clean -fd
git status --porcelain                    # must be empty again
```

`git clean -fd` leaves ignored files alone, so caches and logs survive. Clear
the Stache only if a case asks for it.

Some cases say **before the reset**: they build on another case's result
(for example a page builder or form that the site didn't have). Then stage
that result with `git add -A`, run the follow-up cases with the normal reset
in between (it returns to the staged state), and finish with a full reset:
`git reset -q && git checkout -- . && git clean -fd`.

---

## Phase 0 — Site profile

Fill this in before running any case. Read the files yourself; don't use the
plugin for this.

| Item | How to find it | Value |
|---|---|---|
| Statamic version | `composer.lock` → `statamic/cms` | |
| Laravel / PHP | `composer.lock` → `laravel/framework`; `php -v` | |
| Template language | Layout and page templates: `*.antlers.html` vs `*.blade.php` | Antlers / Blade / mixed |
| Eloquent driver | `statamic/eloquent-driver` in `composer.lock`; `config/statamic/eloquent-driver.php` → `driver` per type | per type: file / eloquent |
| User repository | `config/statamic/users.php` → `repository`, `tables.roles`, `tables.groups` | |
| Multisite | `config/statamic/sites.php` or `resources/sites.yaml` (more than one site) | yes / no |
| Moved paths | `config/statamic/system.php` (`blueprints_path`, `fieldsets_path`), `stache.php` store directories, `forms.php` | |
| Page builders | Grep blueprints and fieldsets for `type: replicator` / `type: bard` with `sets:` | count; inline or fieldset; groups |
| Block dispatch | Where the builder is rendered: `{{ partial src="…/{type}" }}`, `<x-dynamic-component …>`, `@include("…{$type}")`, other | pattern + partial folder |
| Largest blueprint/fieldset | `wc -l` over blueprints and fieldsets | lines |
| Collections | `content/collections/` (or moved), and which have several blueprints | |
| Forms | `resources/forms/` (or moved), templates that render them | |
| Globals, navigations, taxonomies, asset containers | config folders | |
| Runtime available | `php` and `vendor/` present; `php artisan tinker --execute='echo Statamic\Statamic::version();'` works | yes / no + why |

### Profile

Pick the profile that matches. A case's **Expected** column refers to it.

- **A — Flat file.** No Eloquent driver, or the driver only handles things the
  plugin doesn't edit. Blueprints, fieldsets, collections and taxonomies are
  YAML files. (Typical: a basic Antlers site.)
- **B — Eloquent structure.** The driver is `eloquent` for `blueprints`,
  `fieldsets`, `collections` or `taxonomies`. The plugin must **stop** for
  structure and write nothing.
- **C — Eloquent content only.** The driver is installed, but only entries,
  terms or other content are `eloquent`. Blueprints are still files. The plugin
  must continue and **mention the driver** in its plan. (Typical: a
  Blade-heavy app-like site.)

Record two more flags, because some expectations depend on them:

- **Forms in DB:** `forms` on `eloquent` in `eloquent-driver.php`. If so,
  the forms cases expect a stop.
- **Roles in DB:** `repository` is `eloquent` **and** `tables.roles` /
  `tables.groups` name a table. If so, the users cases expect a stop.
  An `eloquent` repository with `tables.roles => false` still keeps roles in
  YAML, and the cases continue as normal.

### Choose the placeholders

Fill these from the profile and use them in the prompts. Don't record their
real names in the results; describe them generically.

| Placeholder | Pick |
|---|---|
| `<collection>` | A collection with one entry blueprint (pages, news, …) |
| `<multi-collection>` | A collection with several entry blueprints (else `n/a`) |
| `<existing-set>` | The display name of an existing page-builder set |
| `<set-template>` | Path of that set's partial or component |
| `<form>` | An existing form's handle (else `n/a`) |
| `<form-template>` | Path of a template that renders a form |
| `<blueprint-file>` | A collection blueprint or fieldset file with a few fields |
| `<builder-file>` | The file that defines the page builder's sets |
| `<partial-folder>` | The folder where the builder's set templates live |
| `<missing-collection>` | A plausible collection name that doesn't exist (e.g. `news`, `events`) |

---

## Phase 1 — Cases

Each row is one case. **Applies** says on which profiles it runs. A case
marked `→ T2` has a second turn: resume the session with the given reply.

Every write case also has a **diff check**, done after the last turn. Read
`$QA/<case-id>.diff`. Untouched lines must stay unchanged: no reordering,
re-indenting, quote changes or dropped comments. New YAML follows the file's
existing style.

### Blueprints (`statamic-kit:blueprints`)

| ID | Applies | Prompt | Expected |
|---|---|---|---|
| BP-1 | A, C, has builder | `Add an FAQ block to the page builder: a list of questions, each with a question and an answer.` | Skill `blueprints` fires. The plan names the Statamic version and template language, plus the driver in profile C. It lists every file to change or create, the exact YAML, the group and position with a reason, and a partial outline in the site's template language at the path the dispatcher expects. Labels use the language of the existing labels. **No writes**; the reply ends with a question. With more than one builder: it names each one, recommends one, and doesn't write. |
| BP-1 T2 | A, C, has builder | `Approved, go ahead.` | It writes only the planned files. The partial is in `<partial-folder>`, modelled on the closest sibling. It reports a YAML parse check, and either a runtime check that ran or **"runtime check not run"** with a reason. `template-reviewer` is dispatched. The reply ends with a **Template review** section; `Bad practice` appears only as a list, never as fixes. A must-fix may be fixed only in planned files. Diff check. |
| BP-1N | A, C, no builder | Same prompt as BP-1. | Skill fires. It says the site has **no page builder** (no replicator or bard field with sets) and doesn't invent one. It proposes creating one: a replicator field on a named blueprint (or a fieldset, if the site uses fieldsets), a dispatching loop in the page template in the site's template language, and the FAQ set with its partial. It asks for confirmation. **No writes.** |
| BP-1N T2 | A, C, no builder | `Approved, go ahead.` | It writes only the proposed files. The dispatch loop is added to the existing page template without rewriting the rest. YAML parse check; runtime check or "not run". `template-reviewer` runs and says there are no siblings to compare with; the **Template review** section has no `Bad practice` list. Diff check. **Don't reset yet:** run **Without a builder** (below) first. |
| BP-2 | B | Same prompt as BP-1, plus ` I approve your plan in advance — go ahead.` | Skill fires and stops. It explains that blueprints/collections live in the database via the Eloquent driver, so YAML edits would have no effect, and points to the Control Panel. **Zero writes by any tool**: no YAML, no partial or component. Tree clean. |
| BP-3 | A, C | `Voeg een blok toe aan de page builder voor een call-to-action met een titel, een tekst en een knop.` | Skill fires on Dutch. CP labels follow the **site's** label language, not the request's (record both). Plan only, no writes. |
| BP-4 | A, C | `Add a <existing-set> block to the page builder.` | It says the set already exists and offers to extend it. No duplicate handle in any plan. No writes. |
| BP-5 | A, C | `Create a collection for vacancies with a location, hours per week and a description.` | Plan with collection config and blueprint at the **resolved** paths (moved paths named), field types that fit, and multisite settings if multisite. No writes. |
| BP-5 T2 | A, C | `Approved, go ahead.` | Files as planned; YAML parse check; runtime check or "not run" with a reason. No template review unless it wrote a template. Diff check. |
| BP-6 | B | `Create a collection for vacancies with a location, hours per week and a description. Go ahead without waiting.` | Stops as in BP-2. Zero writes. |
| BP-7 | A, C | `Add a subtitle field to the <multi-collection> blueprint.` | It lists the collection's entry blueprints and asks which one. No writes. (`n/a` without such a collection.) |
| BP-8 | A, C | `Add a subtitle field to the <collection> blueprint.` → T2 `Approved.` | T1 is a plan only. T2 writes a minimal edit in the right tab/section, following the file's style. Diff check. |
| BP-9 | A, C | `Add a global for the footer with a phone number and an address.` | Plan: global set config, blueprint and values file (per site if multisite), plus how to use it in templates. No writes. |
| BP-10 | A, C | `Add a footer navigation.` | Plan: navigation config, tree, and blueprint only if fields are needed; template usage. No writes. |
| BP-11 | A, C | `Add a photographer credit to our images.` | Skill fires. The plan targets the asset container's metadata blueprint (`resources/blueprints/assets/<container>.yaml`), and asks if there are several containers. No writes. |
| BP-12 | A, C | `Add a job title field to users.` | **`blueprints`** fires (not `users`). The plan targets the user blueprint at its resolved path. No writes. |
| BP-13 | all | `Write a Laravel migration that adds a views column to the users table.` | **No** statamic-kit skill fires. (Don't approve anything; reset.) |

#### Without a builder

On a site without a page builder, the builder cases have nothing to work on.
BP-1N T2 creates one, so use it. Right after BP-1N T2, **before the reset**:

1. Fill `<existing-set>`, `<set-template>`, `<builder-file>` and
   `<partial-folder>` from what BP-1N T2 wrote (the FAQ set).
2. Run BP-4, RV-1, RV-2 or RV-3 (whichever matches the template language),
   RV-5, MO-3 and MO-4. To keep BP-1N T2's builder between these cases,
   stage it once with `git add -A`. The normal **Reset** then goes back to
   that staged state, and `git diff` shows only the case's own change.
   When done, reset fully with `git reset -q && git checkout -- . && git
   clean -fd`.
3. In the results, mark these rows "on BP-1N builder". The reviewer has no
   siblings there, so RV-1 expects no `Bad practice` section. Record
   false positives as usual.

### Forms (`statamic-kit:forms`)

| ID | Applies | Prompt | Expected |
|---|---|---|---|
| FO-1 | A, C (forms in files) | `Add an optional phone field to the <form> form.` → T2 `Approved.` | `forms` fires (not `blueprints`). T1: a plan with the form blueprint and **every template that lists fields by hand**; no writes. T2: blueprint plus template(s) updated, label/error/old-input markup modelled on the existing fields. YAML parse check; runtime check or "not run". `template-reviewer` runs; the reply ends with **Template review**. Diff check. |
| FO-2 | A, C (forms in files) | `Create a newsletter signup form with name and email, store the submissions and email them to qa@example.com.` → T2 `Approved.` | T1: a plan with config (`store`, `honeypot`, `email`), blueprint with validation, and a template in the site's language, following the existing forms. T2: all planned files written; config and blueprint handles match. A `paired-files` note mid-run (config without blueprint yet) is fine as long as both files exist at the end. Template review section. Diff check. |
| FO-3 | A, C, ≥2 forms | `Add a field to the form.` | It asks which form and lists them. No writes. |
| FO-5 | A, C, **no forms** | `Create a contact form with name, email and message, store the submissions and email them to qa@example.com.` → T2 `Approved.` | `forms` fires. T1: it says the site has no forms to follow and uses Statamic's defaults at the **resolved** paths (`config/statamic/forms.php`, `blueprints_path`). The plan has config (`store`, `honeypot`, `email`), blueprint with validation, and a template in the site's template language, with labels, errors, old input and the honeypot. If it's unclear which page shows the form, it asks or proposes one. No writes. T2: config and blueprint both exist with matching handles; parse check; runtime check or "not run". `template-reviewer` runs (no sibling forms, so no `Bad practice`). Diff check. **Before the reset**, run RV-4 and FO-3 on this form. |
| FO-4 | forms in DB | Prompt FO-2 plus ` I approve your plan in advance.` | Stops, explains the database storage, points to the Control Panel. Zero writes. |

### Users (`statamic-kit:users`)

| ID | Applies | Prompt | Expected |
|---|---|---|---|
| US-1 | roles in files | `Add an editor role that can edit and publish <collection> entries but not delete them.` → T2 `Approved.` | `users` fires. T1: a plan with the exact YAML and the full permission list with parents (`access cp`, view → edit → publish), plus **what the role still cannot do**. No writes. T2: `roles.yaml` (resolved path) edited minimally. Parse check; runtime check via `Role::find` or "not run". Reminds the user to assign the role in the CP. Diff check. |
| US-2 | roles in files | `Let authors also publish <missing-collection>.` | It says the collection doesn't exist and lists the real ones. It doesn't invent a handle. No writes. |
| US-3 | roles in files | `Create a Marketing user group that gets the editor role.` | If `editor` doesn't exist: it asks, or offers to create it. If it does: a plan for `groups.yaml`. No writes. |
| US-5 | roles in files, **no `roles.yaml`** (or the file is empty) | Prompt US-1. → T2 `Approved.` | T1: it says no roles file exists yet. The plan creates it at the path resolved from `config/statamic/users.php` (default `resources/users/roles.yaml`), with the full YAML and the permission list as in US-1. It doesn't assume a different location. No writes. T2: file created; parse check; runtime check or "not run". Diff check. (Without `groups.yaml`, run US-3 too **before the reset**: it should plan to create `groups.yaml` the same way.) |
| US-4 | roles in DB | Prompt US-1 plus ` I approve your plan in advance.` | Stops for roles, points to the Control Panel. Zero writes. |

### Template review (`statamic-kit:template-review` + `template-reviewer`)

These cases are about **accuracy**. For each finding the reviewer reports,
open the template and the blueprint yourself and mark it **true** or
**false positive**. Also note any clear defect it missed.

| ID | Applies | Prompt | Expected |
|---|---|---|---|
| RV-1 | all | `Review the template for the <existing-set> block: <set-template>` | `template-review` fires and dispatches `statamic-kit:template-reviewer`. The report has a verdict, Must-fix / Should-fix / Suggestions, a separate section headed exactly `Bad practice`, and What I read (template, blueprint, dispatcher, siblings, layout). **No writes.** It offers fixes without applying them. |
| RV-2 | Blade | Same as RV-1 on a Blade component that loops over a grid/replicator field. | Blade rules applied: a loop without `?? []` or a guard is flagged; `{!! !!}` is accepted only for Bard or Markdown-rendered fields. Record false positives. |
| RV-3 | Antlers | Same as RV-1 on an Antlers partial. | No "missing escaping" findings for editor-filled fields and no null-guard requests on tag pairs. A handle that isn't on the set is reported as falling back to the page's value (if there is one). Record false positives. |
| RV-4 | forms exist | `Review the form template <form-template>.` | It checks labels, errors, old input and the honeypot against the form config. `name="{{ honeypot }}"` counts as present, and the form tag's CSRF token is not reported missing. No writes. |
| RV-5 | all | `Review <partial-folder>/qa-does-not-exist.<ext>` (use the site's template extension) | It says the file doesn't exist and lists candidates. **No other template is reviewed.** No writes. |

### Mods (`yaml-check`, `paired-files`)

These cases test the hooks, not the skills, so each prompt tells the subject
to work without a skill. A mod note is text starting with `statamic-kit:` in a
tool result (see `inspect` → **mod notes**). Both mods stay silent without
`php` or the site's `vendor/`. If **Runtime available** is no, expect
silence from `yaml-check` and record it.

| ID | Applies | Prompt | Expected |
|---|---|---|---|
| MO-1 | A, C | `This is a test of a hook. Don't use any skill and don't plan. With the Edit tool, add a second text field with the handle of an existing field to <blueprint-file>. Then quote exactly what the tool result said, if anything.` | `yaml-check` note: duplicate handle, naming the file and handle. The subject quotes it. |
| MO-2 | A, C | `This is a test of a hook. Don't use any skill. With the Write tool, create qa_broken.yaml in the folder of <blueprint-file>, containing a field list where one line is indented with a tab. Then quote exactly what the tool result said.` | `yaml-check` note: not valid YAML for Symfony's parser, with the parser's error. |
| MO-3 | A, C | `This is a test of a hook. Don't use any skill. With the Edit tool, add a set with handle qa_probe (one text field) to the page builder in <builder-file>, and do not create a template for it. Then quote exactly what the tool result said.` | `paired-files` note: a new set without a partial, naming `<partial-folder>` as the expected folder. (If the sets have no partials, e.g. they're rendered inline, the mod stays silent; record that.) |
| MO-4 | A, C | `This is a test of a hook. Don't use any skill. With the Write tool, create <partial-folder>/qa_orphan.<ext> with a single div. Then quote exactly what the tool result said.` | `paired-files` note: a partial with no matching set. |
| MO-5 | A, C (forms in files) | `This is a test of a hook. Don't use any skill. With the Write tool, create a form config for a form with handle qa_probe (title only), without a blueprint. Then quote exactly what the tool result said.` | `paired-files` note: a form config without its blueprint. |
| MO-6 | all | `This is a test of a hook. Don't use any skill. With the Write tool, create qa-probe.yaml in the project root with two keys that are the same. Then quote exactly what the tool result said.` | **No** `statamic-kit:` note: the file isn't Statamic YAML. |
| MO-7 | B | Run MO-1. | Record what happens. The mods don't check the driver, so a note is expected. The question is only whether it's useful or confusing on this site; write that down. |

---

## Phase 2 — Optional human check

The operator can't see the Control Panel. If a human is around, ask them to
check one write case per skill (for example BP-1 T2, FO-2 T2, US-1 T2)
**before** its reset. They open the Control Panel, check that the new block,
form or role appears and loads without an error, and add the block to a draft
entry to see it render. Record pass/fail under **Human check**. If no one is
available, write "not done".

---

## Results

Copy this into the round's report. One row per case and turn. `n/a` needs a
reason.

**Round:** date · plugin commit · Claude Code version (`claude --version`) ·
profile (A/B/C) · template language · Statamic major · multisite yes/no ·
runtime available yes/no · largest blueprint (lines)

| ID | Result | Skill(s) fired | Agent | Writes OK | Diff check | Runtime check | Mod notes | Cost | Notes |
|---|---|---|---|---|---|---|---|---|---|
| BP-1 | | | | | — | — | | | |
| BP-1 T2 | | | | | | | | | |
| BP-1N | | | | | — | — | | | |
| BP-1N T2 | | | | | | | | | |
| BP-2 | | | | | — | — | | | |
| BP-3 | | | | | — | — | | | |
| BP-4 | | | | | — | — | | | |
| BP-5 | | | | | — | — | | | |
| BP-5 T2 | | | | | | | | | |
| BP-6 | | | | | — | — | | | |
| BP-7 | | | | | — | — | | | |
| BP-8 | | | | | | | | | |
| BP-9 | | | | | — | — | | | |
| BP-10 | | | | | — | — | | | |
| BP-11 | | | | | — | — | | | |
| BP-12 | | | | | — | — | | | |
| BP-13 | | | | | — | — | | | |
| FO-1 | | | | | | | | | |
| FO-2 | | | | | | | | | |
| FO-3 | | | | | — | — | | | |
| FO-4 | | | | | — | — | | | |
| FO-5 | | | | | | | | | |
| US-1 | | | | | | | | | |
| US-2 | | | | | — | — | | | |
| US-3 | | | | | — | — | | | |
| US-4 | | | | | — | — | | | |
| US-5 | | | | | | | | | |
| RV-1 | | | | | — | — | | | true/false positives: |
| RV-2 | | | | | — | — | | | true/false positives: |
| RV-3 | | | | | — | — | | | true/false positives: |
| RV-4 | | | | | — | — | | | true/false positives: |
| RV-5 | | | | | — | — | | | |
| MO-1 | | | | | — | — | | | |
| MO-2 | | | | | — | — | | | |
| MO-3 | | | | | — | — | | | |
| MO-4 | | | | | — | — | | | |
| MO-5 | | | | | — | — | | | |
| MO-6 | | | | | — | — | | | |
| MO-7 | | | | | — | — | | | |

`Result` is `pass`, `fail`, `partial` or `n/a`. `Writes OK` means the plan
turn wrote nothing and the write turn wrote only planned files. `Runtime
check` is `ran`, `not run (reason given)`, or `claimed without running`; the
last one is always a fail.

**Human check:** …

**Notes:** flag changes, cases skipped and why, anything surprising (slow
runs, huge reads, permission prompts).

## Findings

One block per problem. Describe the site generically.

```
### <ID> — <one-line problem>
Profile: A/B/C, Antlers/Blade
Severity: blocker | important | minor
Observed: what the subject did (quote a few lines of the reply or the diff)
Expected: what this protocol says should happen
Site shape that triggers it: e.g. "builder dispatched via @include with a
  custom prefix", "roles in YAML with an eloquent user repository"
Proposed eval case: fixture shape + prompt + the grader that would catch it
```

## Reporting back

Give the human the results table and the findings. In the plugin repo, each
finding becomes a RED case first (fixture in `evals/fixtures/`, case in
`evals/<name>/`), then a fix, then GREEN and a full suite, following the
loop in `CLAUDE.md`. Log the round in `evals/RESULTS.md`. Finally, reset the
site and delete the QA branch:

```sh
git reset -q && git checkout -- . && git clean -fd
git switch - && git branch -D qa/statamic-kit
```
