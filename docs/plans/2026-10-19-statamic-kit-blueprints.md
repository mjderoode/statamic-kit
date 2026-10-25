# statamic-kit `blueprints` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first `statamic-kit` component: a `blueprints` skill that creates and edits Statamic blueprints, fieldsets and page-builder blocks (plus the block's partial) by detecting and following the project's existing pattern.

**Architecture:** One skill (`skills/blueprints/SKILL.md`, lean workflow) with progressive-disclosure references in `skills/blueprints/references/`. Behaviour is pinned by a `claude plugin eval` suite: synthetic fixture projects under `evals/fixtures/`, copied into each run's workspace by a per-case `scaffold.sh`. A no-skill baseline is recorded before any skill content is written (TDD for skills), then the suite must pass with the skill.

**Tech Stack:** Claude Code plugin (skills layout), Markdown/YAML, `claude plugin validate`, `claude plugin eval` (Claude Code ≥ 2.1.269; verified on 2.1.303), Statamic 6 YAML conventions, Antlers + Blade.

**Spec:** `docs/specs/2026-10-19-statamic-kit-blueprints-design.md`

## Global Constraints

- All shipped content (skill, references, evals, README) is written in **English**.
- No Composer dependency; no reliance on Statamic Boost or any MCP server. The skill works from project files.
- Plugin name `statamic-kit`; skill directory `blueprints` → Skill id `statamic-kit:blueprints`, slash `/statamic-kit:blueprints`.
- Skill `description`: third person, starts with "Use when…", triggers only, never the workflow; must not fire on general Laravel work (migrations, controllers, Eloquent models).
- The skill writes **nothing** before the user approves the plan (spec §Workflow step 3).
- Fixtures contain **no client content, styling or brand names**; they mirror structure only.
- Real client sites are only ever touched as **copies in a temporary directory** (spec §Testing layer 2); never committed.
- Use `${CLAUDE_PLUGIN_ROOT}` for any intra-plugin path; kebab-case names.
- Done = `claude plugin validate plugins/statamic-kit` and `claude plugin validate .` both print `Validation passed`, eval suite passes, smoke test done.

## Facts established while planning (do not re-derive)

- `claude plugin eval` case = directory under `evals/` with `prompt.md` and/or `case.yaml`, plus `graders/*.md`. A directory with neither (e.g. `evals/fixtures/`, `evals/_lib/`) is **not** a case.
- Each run starts in an **empty** workspace. `context.scaffold_script` (in `case.yaml`, needs `schema_version: "1.1"` and `name`) runs a Bash script there, **only with `--scaffold`**. `$(dirname "${BASH_SOURCE[0]}")` resolves to the case directory — verified with a probe run that copied `../fixtures/demo/.` into the workspace (score 1.00).
- Grader types: `regex` (`pattern`, `flags`, `match: contains|not_contains|"count:N"`, `target: last_message|trace|files|{source: file, path}`), `tool_used` (`tool`, `input_match`, `min`, `max`), `tool_order`, `file_exists` (**only files created during the run**), `llm` (body = criteria, `focus` like `target`), `baseline`. **No custom-code graders** — YAML parse validity is graded by an `llm` judge on the file, plus regex structure checks.
- Files the scaffold created and Claude only edited are invisible to `file_exists`; grade them with `regex` on `{source: file, path: …}`.
- Bash/Write/Edit must be granted at run time: `--allow-tools Bash Write Edit`. Bash runs in the OS sandbox (writes confined to workspace).
- Default `--ablation with-without` adds a no-plugin arm automatically; graders with `arm: with-only` (e.g. `tool_used: Skill`) don't count toward the score.
- Add `evals/results/` to `.gitignore`.
- Real-site patterns the fixtures mirror:
  - Inline Antlers: `page_builder` replicator inline in `resources/blueprints/collections/pages/page.yaml`, set group `blocks`, dispatched in `resources/views/page.antlers.html` with `{{ page_builder }}{{ partial src="blocks/{type}" }}{{ /page_builder }}`, partials at `resources/views/blocks/<handle>.antlers.html`.
  - Fieldset Blade: replicator `content` inside `resources/fieldsets/<name>.yaml`, pulled into a blueprint with `- import: <name>`; groups like `content`/`media`; rendered by `resources/views/components/page-builder.blade.php` using `<x-dynamic-component :component="'blocks.'.$block['type']" :block="$block" />`; components at `resources/views/components/blocks/<handle>.blade.php` starting with `@props(['block'])` and reading `$block['field']`. CP labels Dutch.

## Review Focus

1. **Existing YAML comments and quote style in a blueprint** — a minimal edit must keep them. Pinned by grader `comment-preserved` in Task 3 case `inline-antlers-add-faq`.
2. **Requested block handle already exists** (user asks for a `hero` block on a site that has one) — the skill must flag it and not add a duplicate set. Pinned by case `duplicate-handle` in Task 3.
3. **User writes in a different language than the CP labels** (Dutch request on an English-labelled site) — labels follow the project, not the request. Pinned by the Dutch prompt + `labels-follow-project` grader in case `inline-antlers-add-faq`.
4. **No `composer.lock`, only `composer.json`** — version detection must fall back to the constraint and say so, not fail. Pinned by `no-builder` fixture shipping only `composer.json` and grader `version-fallback` in case `no-builder-proposes`.
5. **No pre-approval in the prompt** — the skill presents the plan and writes nothing. Pinned by case `no-approval-no-writes` in Task 3.

---

## File Structure

```
plugins/statamic-kit/
├── .claude-plugin/plugin.json                (exists)
├── CLAUDE.md                                 (exists; status line updated in Task 8)
├── README.md                                 (exists; updated in Task 8)
├── skills/blueprints/
│   ├── SKILL.md                              Task 4 — workflow + gate
│   └── references/
│       ├── project-detection.md              Task 4 — what to detect and how
│       ├── blueprint-yaml.md                 Task 5 — blueprint/fieldset YAML shapes
│       ├── fieldtypes.md                     Task 5 — fieldtype picks + options
│       ├── page-builder.md                   Task 5 — replicator/bard sets, groups
│       └── templates.md                      Task 5 — Antlers/Blade partials + dispatch
└── evals/
    ├── .gitignore                            Task 1 — results/
    ├── _lib/copy-fixture.sh                  Task 1 — shared scaffold helper
    ├── BASELINE.md                           Task 3 — recorded no-skill scores
    ├── fixtures/                             Task 2
    │   ├── inline-antlers/
    │   ├── fieldset-blade/
    │   ├── eloquent/
    │   ├── no-builder/
    │   └── two-builders/
    └── <case>/                               Task 3 — 11 cases
        ├── case.yaml
        ├── scaffold.sh
        ├── prompt.md
        └── graders/*.md
```

---

### Task 1: Commit scaffold and eval plumbing

**Files:**
- Create: `plugins/statamic-kit/evals/.gitignore`
- Create: `plugins/statamic-kit/evals/_lib/copy-fixture.sh`
- Commit: existing untracked `plugins/statamic-kit/` scaffold

**Interfaces:**
- Produces: `bash evals/_lib/copy-fixture.sh <fixture-name>` — copies `evals/fixtures/<fixture-name>/.` into the current directory; exits 1 with a message if the fixture does not exist. Every case `scaffold.sh` in Task 3 calls it.

- [ ] **Step 1: Write `.gitignore`**

```
results/
```

- [ ] **Step 2: Write `evals/_lib/copy-fixture.sh`**

```bash
#!/usr/bin/env bash
# Copy a shared fixture project into the eval run's (empty) workspace.
# Usage: bash copy-fixture.sh <fixture-name>
set -euo pipefail
name="${1:?fixture name required}"
lib="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$lib/../fixtures/$name"
if [ ! -d "$src" ]; then
  echo "fixture not found: $name" >&2
  exit 1
fi
cp -R "$src/." .
```

- [ ] **Step 3: Validate the plugin still passes**

Run: `cd <repo> && claude plugin validate plugins/statamic-kit`
Expected: `✔ Validation passed` (README install-line advice is fine).

- [ ] **Step 4: Commit**

```bash
cd <repo>
git add plugins/statamic-kit
git commit -m "Add statamic-kit plugin scaffold and eval plumbing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Fixture projects

Minimal fake Statamic 6 projects: only the files the skill reads. No `vendor/`, no client content.

**Files:** (all under `plugins/statamic-kit/evals/fixtures/`)
- Create: `inline-antlers/composer.lock`, `inline-antlers/resources/blueprints/collections/pages/page.yaml`, `inline-antlers/content/collections/pages.yaml`, `inline-antlers/resources/views/page.antlers.html`, `inline-antlers/resources/views/blocks/hero.antlers.html`, `inline-antlers/resources/views/blocks/rich_text.antlers.html`
- Create: `fieldset-blade/composer.lock`, `fieldset-blade/resources/fieldsets/page_blocks.yaml`, `fieldset-blade/resources/blueprints/collections/pages/page.yaml`, `fieldset-blade/resources/blueprints/collections/articles/article.yaml`, `fieldset-blade/content/collections/pages.yaml`, `fieldset-blade/content/collections/articles.yaml`, `fieldset-blade/resources/views/default.blade.php`, `fieldset-blade/resources/views/components/page-builder.blade.php`, `fieldset-blade/resources/views/components/blocks/intro.blade.php`, `fieldset-blade/resources/views/components/blocks/image.blade.php`
- Create: `eloquent/composer.lock`, `eloquent/config/statamic/eloquent-driver.php`, `eloquent/resources/views/page.antlers.html`
- Create: `no-builder/composer.json`, `no-builder/resources/blueprints/collections/pages/page.yaml`, `no-builder/content/collections/pages.yaml`, `no-builder/resources/views/page.antlers.html`
- Create: `two-builders/composer.lock`, `two-builders/resources/blueprints/collections/pages/page.yaml`, `two-builders/content/collections/pages.yaml`, `two-builders/resources/views/page.antlers.html`, `two-builders/resources/views/blocks/hero.antlers.html`, `two-builders/resources/views/sidebar/links.antlers.html`

**Interfaces:**
- Produces: fixture names `inline-antlers`, `fieldset-blade`, `eloquent`, `no-builder`, `two-builders`, and these exact paths and handles that Task 3 graders match on:
  - `inline-antlers`: page builder field `page_builder`, group `blocks`, sets `hero`, `rich_text`; comment line `# Page builder: keep sets alphabetical inside each group.`; English labels.
  - `fieldset-blade`: fieldset `page_blocks`, replicator `content`, groups `content` (sets `intro`) and `media` (set `image`); SEO fields `meta_title`, `meta_description` duplicated inline in `pages/page.yaml` and `articles/article.yaml`; Dutch labels.
  - `two-builders`: replicators `page_builder` (group `blocks`, set `hero`) and `sidebar` (group `widgets`, set `links`).

- [ ] **Step 1: Shared `composer.lock` (Statamic 6)** — write this identical file to `inline-antlers/`, `fieldset-blade/`, `two-builders/`:

```json
{
    "_readme": ["Fixture lock file: only the packages the skill inspects."],
    "packages": [
        { "name": "laravel/framework", "version": "v13.17.0" },
        { "name": "statamic/cms", "version": "v6.2.0" }
    ],
    "packages-dev": []
}
```

- [ ] **Step 2: `inline-antlers` blueprint** — `resources/blueprints/collections/pages/page.yaml`:

```yaml
title: Page
tabs:
  main:
    display: Main
    sections:
      -
        fields:
          -
            handle: title
            field:
              type: text
              required: true
              validate:
                - required
          # Page builder: keep sets alphabetical inside each group.
          -
            handle: page_builder
            field:
              type: replicator
              display: 'Page Builder'
              instructions: 'Build the page out of blocks.'
              collapse: accordion
              sets:
                blocks:
                  display: Blocks
                  sets:
                    hero:
                      display: Hero
                      instructions: 'Full-width banner with a heading and a button.'
                      icon: hero
                      fields:
                        -
                          handle: heading
                          field:
                            type: text
                            display: Heading
                            required: true
                        -
                          handle: cta_label
                          field:
                            type: text
                            display: 'Button label'
                        -
                          handle: cta_url
                          field:
                            type: link
                            display: 'Button link'
                    rich_text:
                      display: 'Rich text'
                      instructions: 'Free-form copy.'
                      icon: text
                      fields:
                        -
                          handle: body
                          field:
                            type: bard
                            display: Body
                            save_html: true
  sidebar:
    display: Sidebar
    sections:
      -
        fields:
          -
            handle: slug
            field:
              type: slug
              localizable: true
```

- [ ] **Step 3: `inline-antlers` collection + views**

`content/collections/pages.yaml`:
```yaml
title: Pages
route: '{parent_uri}/{slug}'
structure:
  root: true
```

`resources/views/page.antlers.html`:
```antlers
{{ page_builder }}
    {{ partial src="blocks/{type}" }}
{{ /page_builder }}
```

`resources/views/blocks/hero.antlers.html`:
```antlers
{{# Hero: full-width banner. #}}
<section class="block block-hero">
    <h1>{{ heading }}</h1>
    {{ if cta_label && cta_url }}
        <a class="button" href="{{ cta_url }}">{{ cta_label }}</a>
    {{ /if }}
</section>
```

`resources/views/blocks/rich_text.antlers.html`:
```antlers
<section class="block block-rich-text">
    {{ body }}
</section>
```

- [ ] **Step 4: `fieldset-blade` fieldset** — `resources/fieldsets/page_blocks.yaml`:

```yaml
title: 'Pagina blokken'
fields:
  -
    handle: content
    field:
      type: replicator
      display: Inhoud
      instructions: 'Bouw de pagina op uit losse blokken.'
      collapse: accordion
      button_label: 'Blok toevoegen'
      sets:
        content:
          display: Tekst
          sets:
            intro:
              display: Introductie
              instructions: 'De opening van de pagina.'
              icon: text
              fields:
                -
                  handle: text
                  field:
                    type: textarea
                    display: Introductie
        media:
          display: Media
          sets:
            image:
              display: Afbeelding
              icon: assets
              fields:
                -
                  handle: image
                  field:
                    type: assets
                    display: Afbeelding
                    container: assets
                    max_files: 1
                -
                  handle: caption
                  field:
                    type: text
                    display: Bijschrift
```

- [ ] **Step 5: `fieldset-blade` blueprints (with duplicated SEO fields)**

`resources/blueprints/collections/pages/page.yaml`:
```yaml
title: Pagina
tabs:
  main:
    display: Inhoud
    sections:
      -
        fields:
          -
            handle: title
            field:
              type: text
              display: Titel
              required: true
          -
            import: page_blocks
  seo:
    display: SEO
    sections:
      -
        fields:
          -
            handle: meta_title
            field:
              type: text
              display: 'SEO-titel'
              character_limit: 60
          -
            handle: meta_description
            field:
              type: textarea
              display: 'SEO-omschrijving'
              character_limit: 160
```

`resources/blueprints/collections/articles/article.yaml`:
```yaml
title: Artikel
tabs:
  main:
    display: Inhoud
    sections:
      -
        fields:
          -
            handle: title
            field:
              type: text
              display: Titel
              required: true
          -
            handle: date
            field:
              type: date
              display: Datum
          -
            import: page_blocks
  seo:
    display: SEO
    sections:
      -
        fields:
          -
            handle: meta_title
            field:
              type: text
              display: 'SEO-titel'
              character_limit: 60
          -
            handle: meta_description
            field:
              type: textarea
              display: 'SEO-omschrijving'
              character_limit: 160
```

- [ ] **Step 6: `fieldset-blade` collections + views**

`content/collections/pages.yaml`:
```yaml
title: "Pagina's"
route: '{slug}'
template: default
```

`content/collections/articles.yaml`:
```yaml
title: Artikelen
route: '/artikelen/{slug}'
dated: true
template: default
```

`resources/views/default.blade.php`:
```blade
<main>
    <h1>{{ $title }}</h1>
    <x-page-builder :blocks="$content" />
</main>
```

`resources/views/components/page-builder.blade.php`:
```blade
@props(['blocks'])

@if ($blocks)
    <div {{ $attributes->merge(['class' => 'page-builder']) }}>
        @foreach ($blocks as $block)
            <x-dynamic-component :component="'blocks.'.$block['type']" :block="$block" />
        @endforeach
    </div>
@endif
```

`resources/views/components/blocks/intro.blade.php`:
```blade
@props(['block'])

<p class="block-intro">{{ $block['text'] }}</p>
```

`resources/views/components/blocks/image.blade.php`:
```blade
@props(['block'])

{{-- Afbeelding met optioneel bijschrift. --}}
<figure class="block-image">
    @if ($block['image'])
        <img src="{{ $block['image']->url() }}" alt="{{ $block['image']->alt }}">
    @endif
    @if ($block['caption'])
        <figcaption>{{ $block['caption'] }}</figcaption>
    @endif
</figure>
```

- [ ] **Step 7: Verify the eloquent-driver config shape against current docs**

Use context7 (`resolve-library-id` "Statamic eloquent driver", then `query-docs` "config/statamic/eloquent-driver.php blueprints driver setting"). Confirm the key that makes blueprints/collections database-backed. Use the confirmed shape in Step 8; if it differs from the block below, use the documented one.

- [ ] **Step 8: `eloquent` fixture**

`composer.lock`:
```json
{
    "_readme": ["Fixture lock file: only the packages the skill inspects."],
    "packages": [
        { "name": "laravel/framework", "version": "v13.17.0" },
        { "name": "statamic/cms", "version": "v6.2.0" },
        { "name": "statamic/eloquent-driver", "version": "v5.0.0" }
    ],
    "packages-dev": []
}
```

`config/statamic/eloquent-driver.php`:
```php
<?php

return [
    'connection' => env('STATAMIC_ELOQUENT_CONNECTION', ''),
    'table_prefix' => env('STATAMIC_ELOQUENT_PREFIX', ''),

    'blueprints' => [
        'driver' => 'eloquent',
    ],

    'collections' => [
        'driver' => 'eloquent',
    ],

    'entries' => [
        'driver' => 'eloquent',
    ],
];
```

`resources/views/page.antlers.html`:
```antlers
{{ page_builder }}
    {{ partial src="blocks/{type}" }}
{{ /page_builder }}
```

- [ ] **Step 9: `no-builder` fixture (composer.json only — Review Focus 4)**

`composer.json`:
```json
{
    "name": "example/site",
    "require": {
        "php": "^8.3",
        "laravel/framework": "^13.17",
        "statamic/cms": "^6.0"
    }
}
```

`resources/blueprints/collections/pages/page.yaml`:
```yaml
title: Page
tabs:
  main:
    display: Main
    sections:
      -
        fields:
          -
            handle: title
            field:
              type: text
              required: true
          -
            handle: content
            field:
              type: markdown
              display: Content
```

`content/collections/pages.yaml`:
```yaml
title: Pages
route: '{slug}'
```

`resources/views/page.antlers.html`:
```antlers
<article>
    <h1>{{ title }}</h1>
    {{ content }}
</article>
```

- [ ] **Step 10: `two-builders` fixture**

`resources/blueprints/collections/pages/page.yaml`:
```yaml
title: Page
tabs:
  main:
    display: Main
    sections:
      -
        fields:
          -
            handle: title
            field:
              type: text
              required: true
          -
            handle: page_builder
            field:
              type: replicator
              display: 'Page Builder'
              sets:
                blocks:
                  display: Blocks
                  sets:
                    hero:
                      display: Hero
                      fields:
                        -
                          handle: heading
                          field:
                            type: text
                            display: Heading
  sidebar:
    display: Sidebar
    sections:
      -
        fields:
          -
            handle: sidebar
            field:
              type: replicator
              display: 'Sidebar widgets'
              sets:
                widgets:
                  display: Widgets
                  sets:
                    links:
                      display: Links
                      fields:
                        -
                          handle: links
                          field:
                            type: grid
                            display: Links
                            fields:
                              -
                                handle: label
                                field:
                                  type: text
                              -
                                handle: url
                                field:
                                  type: link
```

`content/collections/pages.yaml`:
```yaml
title: Pages
route: '{slug}'
```

`resources/views/page.antlers.html`:
```antlers
<main>
    {{ page_builder }}{{ partial src="blocks/{type}" }}{{ /page_builder }}
</main>
<aside>
    {{ sidebar }}{{ partial src="sidebar/{type}" }}{{ /sidebar }}
</aside>
```

`resources/views/blocks/hero.antlers.html`:
```antlers
<section class="block block-hero"><h1>{{ heading }}</h1></section>
```

`resources/views/sidebar/links.antlers.html`:
```antlers
<ul>{{ links }}<li><a href="{{ url }}">{{ label }}</a></li>{{ /links }}</ul>
```

- [ ] **Step 11: Check every fixture YAML parses**

Run:
```bash
cd <repo>/plugins/statamic-kit/evals/fixtures
for f in $(find . -name '*.yaml'); do ruby -ryaml -e 'YAML.load_file(ARGV[0])' "$f" && echo "ok $f" || echo "FAIL $f"; done
```
Expected: `ok` for every file. (If `ruby` is unavailable: `python3 -c 'import sys,yaml;yaml.safe_load(open(sys.argv[1]))'`; if neither has YAML, `php -r` with `symfony/yaml` from any local Laravel project's `vendor/autoload.php`.)

- [ ] **Step 12: Commit**

```bash
cd <repo>
git add plugins/statamic-kit/evals/fixtures
git commit -m "Add statamic-kit eval fixtures

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Eval cases and no-skill baseline (RED)

Every case directory under `plugins/statamic-kit/evals/` has `case.yaml`, `scaffold.sh`, `prompt.md`, `graders/`. Write-cases pre-approve the plan in the prompt (spec §Testing). `scaffold.sh` is always:

```bash
#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" <FIXTURE>
```
with `<FIXTURE>` replaced by the fixture name listed per case. `case.yaml` is always:

```yaml
schema_version: "1.1"
name: <case-name>
tags: [<tags>]
context:
  scaffold_script: scaffold.sh
```

Every case also gets `graders/skill-fired.md` (excluded from the score in two-arm runs):
```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:statamic-kit:)?blueprints"'
arm: with-only
---
```
(Case 10 inverts it — see there.)

**Files:** Create the 11 case directories below.

**Interfaces:**
- Consumes: `evals/_lib/copy-fixture.sh` (Task 1); fixture names, paths and handles (Task 2).
- Produces: suite command used by Tasks 6–7:
  `cd <repo> && claude plugin eval plugins/statamic-kit --scaffold --trust-plugin --allow-tools Bash Write Edit --no-publish`

#### Case 1 — `inline-antlers-add-faq` (fixture `inline-antlers`, tags `[write, page-builder]`)

`prompt.md` (Dutch request on an English site — Review Focus 3):
```markdown
---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Voeg een FAQ-blok toe aan de page builder: een kop en een lijst met vragen en antwoorden. Je hoeft niet op mijn akkoord te wachten — ik keur je plan bij voorbaat goed, voer het meteen uit.
```

`graders/set-in-group.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: 'blocks:\n\s+display: Blocks\n\s+sets:[\s\S]*\n\s{20}faq:\n'
---
```

`graders/partial-created.md`:
```markdown
---
type: file_exists
path: resources/views/blocks/faq.antlers.html
---
```

`graders/existing-sets-kept.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '\n\s+(hero|rich_text):\n'
match: "count:2"
---
```

`graders/comment-preserved.md` (Review Focus 1):
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '# Page builder: keep sets alphabetical inside each group\.'
---
```

`graders/labels-follow-project.md`:
```markdown
---
type: llm
focus: { source: file, path: resources/blueprints/collections/pages/page.yaml }
---

The file is a Statamic blueprint. A new set with handle `faq` was added under the `blocks` set group.
PASS if all of these hold: the file is valid YAML; the `faq` set has a `display` label and field `display` labels written in English (matching the existing English labels such as "Hero" and "Button label"), not Dutch; the `faq` set contains a heading field and a repeating structure (grid, replicator or similar) for question/answer pairs; the `hero` and `rich_text` sets are unchanged.
FAIL if the YAML is invalid, any new label is Dutch, the question/answer structure is missing, or an existing set was altered.
```

`graders/partial-shape.md`:
```markdown
---
type: llm
focus: { source: file, path: resources/views/blocks/faq.antlers.html }
---

PASS if this is an Antlers template (not Blade) that renders the FAQ block's heading and loops over the question/answer items using the same field handles the blueprint defines, and contains no hard-coded sample content.
FAIL if it uses Blade syntax, is empty, or uses field names that would not exist on the set.
```

#### Case 2 — `fieldset-blade-add-faq` (fixture `fieldset-blade`, tags `[write, page-builder]`)

`prompt.md`:
```markdown
---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add an FAQ block to the page builder: a heading and a list of questions with answers. No need to wait for my approval — I approve your plan in advance, go ahead and make the changes.
```

`graders/edited-fieldset.md`:
```markdown
---
type: regex
target: { source: file, path: resources/fieldsets/page_blocks.yaml }
pattern: '\n\s+faq:\n'
---
```

`graders/blueprints-untouched.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: 'faq'
match: not_contains
---
```

`graders/component-created.md`:
```markdown
---
type: file_exists
path: resources/views/components/blocks/faq.blade.php
---
```

`graders/dutch-labels.md`:
```markdown
---
type: llm
focus: { source: file, path: resources/fieldsets/page_blocks.yaml }
---

PASS if the file is valid YAML, a set with handle `faq` was added inside one of the existing set groups (`content` or `media`) or a new clearly-named group, its `display` and field `display` labels are Dutch (matching existing labels like "Introductie" and "Afbeelding"), and the existing `intro` and `image` sets are unchanged.
FAIL if the YAML is invalid, labels are English, or existing sets changed.
```

`graders/component-shape.md`:
```markdown
---
type: llm
focus: { source: file, path: resources/views/components/blocks/faq.blade.php }
---

PASS if this is a Blade anonymous component that declares `@props(['block'])`, reads fields as `$block['…']` using handles that exist on the new `faq` set, and loops over the question/answer items.
FAIL if it uses Antlers syntax, reads variables that would not exist, or contains hard-coded sample content.
```

#### Case 3 — `new-collection-vacancies` (fixture `inline-antlers`, tags `[write, collection]`)

`prompt.md`:
```markdown
---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Create a collection for job vacancies with a title, location and hours per week. I approve your plan in advance — go ahead without waiting for me.
```

`graders/collection-file.md`:
```markdown
---
type: file_exists
path: content/collections/*.yaml
---
```

`graders/blueprint-file.md`:
```markdown
---
type: file_exists
path: resources/blueprints/collections/*/*.yaml
---
```

`graders/fieldtypes.md`:
```markdown
---
type: llm
focus: trace
---

Judge the files Claude wrote for the new vacancies collection.
PASS if Claude created both a collection config under `content/collections/` and a blueprint under `resources/blueprints/collections/<same handle>/`, the blueprint has a title field, a location field (text or similar) and an hours field using a numeric fieldtype (`integer` or `float`), labels are English like the rest of the project, and the YAML is valid.
FAIL if either file is missing, the handles of the two files don't match, hours is a plain text field, or the YAML is invalid.
```

#### Case 4 — `extract-seo-fieldset` (fixture `fieldset-blade`, tags `[write, fieldset]`)

`prompt.md`:
```markdown
---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

The SEO fields are duplicated across blueprints. Move them into a reusable fieldset. I approve your plan in advance — go ahead.
```

`graders/fieldset-created.md`:
```markdown
---
type: file_exists
path: resources/fieldsets/*.yaml
---
```

`graders/page-imports.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: 'import: (?!page_blocks)\w+'
---
```

`graders/article-imports.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/articles/article.yaml }
pattern: 'import: (?!page_blocks)\w+'
---
```

`graders/inline-seo-removed.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: 'handle: meta_title'
match: not_contains
---
```

`graders/no-fields-lost.md`:
```markdown
---
type: llm
focus: trace
---

PASS if the new fieldset contains both `meta_title` (with `character_limit: 60`) and `meta_description` (with `character_limit: 160`) and their Dutch display labels, both `pages/page.yaml` and `articles/article.yaml` import it in place of the inline fields, and every file is valid YAML.
FAIL if a field, a character limit or a label was lost, or one blueprint still has the inline fields.
```

#### Case 5 — `eloquent-stops` (fixture `eloquent`, tags `[guard]`)

`prompt.md`:
```markdown
---
max_turns: 25
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add an FAQ block to the page builder. I approve your plan in advance — go ahead.
```

`graders/no-writes.md`:
```markdown
---
type: tool_used
tool: Write
min: 0
max: 0
---
```

`graders/no-edits.md`:
```markdown
---
type: tool_used
tool: Edit
min: 0
max: 0
---
```

`graders/explains.md`:
```markdown
---
type: llm
---

PASS if the reply explains that this site stores blueprints/collections in the database via the Statamic Eloquent driver, so editing YAML files would have no effect, and suggests a way forward (e.g. the Control Panel or a migration path).
FAIL if it claims to have added the block or does not mention the Eloquent driver.
```

#### Case 6 — `no-builder-proposes` (fixture `no-builder`, tags `[guard]`)

`prompt.md`:
```markdown
---
max_turns: 25
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add an FAQ block to the page builder.
```

`graders/no-writes.md` and `graders/no-edits.md`: same as Case 5.

`graders/proposes.md`:
```markdown
---
type: llm
---

PASS if the reply says the project has no page builder (no replicator/bard field with sets), and proposes creating one — e.g. a replicator on the pages blueprint plus a dispatching template — asking for confirmation before doing so.
FAIL if it invents an existing page builder or writes files.
```

`graders/version-fallback.md` (Review Focus 4):
```markdown
---
type: regex
target: trace
pattern: 'composer\.json'
---
```

#### Case 7 — `two-builders-asks` (fixture `two-builders`, tags `[guard]`)

`prompt.md`:
```markdown
---
max_turns: 25
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add a quote block.
```

`graders/no-writes.md` and `graders/no-edits.md`: same as Case 5.

`graders/asks.md`:
```markdown
---
type: llm
---

PASS if the reply names both replicators (`page_builder` and `sidebar`) and asks which one the quote block belongs in.
FAIL if it picks one without asking or writes files.
```

#### Case 8 — `no-approval-no-writes` (fixture `inline-antlers`, tags `[guard]`) — Review Focus 5

`prompt.md`:
```markdown
---
max_turns: 25
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add an FAQ block to the page builder: a heading and a list of questions with answers.
```

`graders/no-writes.md` and `graders/no-edits.md`: same as Case 5.

`graders/presents-plan.md`:
```markdown
---
type: llm
---

PASS if the reply presents a concrete plan — which files will change or be created (the pages blueprint and a `blocks/faq.antlers.html` partial), the YAML for the new set, and the conventions followed — and asks for approval before writing.
FAIL if it claims to have made changes, or gives only a vague description without files and YAML.
```

#### Case 9 — `duplicate-handle` (fixture `inline-antlers`, tags `[guard]`) — Review Focus 2

`prompt.md`:
```markdown
---
max_turns: 25
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add a hero block to the page builder with a heading and a background image. I approve your plan in advance — go ahead.
```

`graders/single-hero.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: '\n\s+hero:\n'
match: "count:1"
---
```

`graders/flags-existing.md`:
```markdown
---
type: llm
---

PASS if the reply points out that a `hero` set already exists and either asks whether to extend it (add the background image field) or extends the existing set instead of adding a second one.
FAIL if it silently adds a second hero-like set (e.g. `hero_2`) or ignores the existing one.
```

#### Case 11 — `new-taxonomy-topics` (fixture `inline-antlers`, tags `[write, taxonomy]`)

`prompt.md`:
```markdown
---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---

Add a taxonomy for page topics. Each topic has a name and a short description, and pages should be taggable with one or more topics. I approve your plan in advance — go ahead.
```

`graders/taxonomy-file.md`:
```markdown
---
type: file_exists
path: content/taxonomies/*.yaml
---
```

`graders/term-blueprint.md`:
```markdown
---
type: file_exists
path: resources/blueprints/taxonomies/*/*.yaml
---
```

`graders/pages-linked.md`:
```markdown
---
type: regex
target: { source: file, path: resources/blueprints/collections/pages/page.yaml }
pattern: 'type: terms'
---
```

`graders/taxonomy-correct.md`:
```markdown
---
type: llm
focus: trace
---

Judge the files Claude wrote for the new topics taxonomy.
PASS if all hold: a taxonomy config exists under `content/taxonomies/<handle>.yaml`; a term blueprint exists under `resources/blueprints/taxonomies/<same handle>/` with a title field and a description field (textarea or similar); the pages blueprint got a `terms` field pointing at that taxonomy handle allowing multiple terms; the pages collection config (`content/collections/pages.yaml`) lists the taxonomy under `taxonomies:` if Claude judged that needed, or Claude explained why not; labels are English; all YAML is valid; the existing page builder is untouched.
FAIL if any file is missing, the handles don't match across files, the page builder changed, or the YAML is invalid.
```

#### Case 10 — `trigger-negative-migration` (no fixture, tags `[trigger]`)

No `case.yaml`/`scaffold.sh`. `prompt.md`:
```markdown
---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Write a Laravel migration that adds a nullable `published_at` timestamp column to the `orders` table. Just show me the code.
```

`graders/skill-not-fired.md` (replaces `skill-fired.md`):
```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:statamic-kit:)?blueprints"'
min: 0
max: 0
arm: both
---
```

`graders/answers.md`:
```markdown
---
type: regex
pattern: 'timestamp\(.published_at.\)->nullable\(\)'
---
```

- [ ] **Step 1: Write all 11 case directories exactly as above.** `chmod +x` every `scaffold.sh`.

- [ ] **Step 2: Load-check the suite with one cheap run**

Run: `cd <repo> && claude plugin eval plugins/statamic-kit --scaffold --trust-plugin --allow-tools Bash Write Edit --no-publish --runs 1 --case trigger-negative-migration --ablation none`
Expected: the case loads and runs (score may be anything). The runner validates every case file at load time, so any `invalid case.yaml` or unknown-frontmatter-key error for another case shows up here too — fix it and re-run until the run starts cleanly. Step 3's full run must list all 11 cases.

- [ ] **Step 3: Run the no-skill baseline (RED)**

The skill does not exist yet, so the with-plugin arm is effectively a baseline.
Run: `cd <repo> && claude plugin eval plugins/statamic-kit --scaffold --trust-plugin --allow-tools Bash Write Edit --no-publish --runs 1 --ablation none --json plugins/statamic-kit/evals/results/baseline.json`
Expected: several cases below 1.0 — at least the guard cases 5–9 (no gate, no Eloquent check, no duplicate check). If **every** case already scores 1.0, stop and report: the skill's value must then be re-scoped with Mitchell.

- [ ] **Step 4: Record `evals/BASELINE.md`**

Write a table: case | score | failing graders | what Claude did wrong (one line each, from the JSON and report). This file drives Task 5's "observed mistakes" sections.

```markdown
# No-skill baseline — 2026-10-19

Run: `claude plugin eval plugins/statamic-kit --scaffold --allow-tools Bash Write Edit --runs 1 --ablation none` (no skill present).

| Case | Score | Failing graders | Observed mistake |
|---|---|---|---|
| inline-antlers-add-faq | … | … | … |
```
(Fill every row from the actual run — one row per case, no blanks.)

- [ ] **Step 5: Commit**

```bash
cd <repo>
git add plugins/statamic-kit/evals
git commit -m "Add statamic-kit blueprints eval suite and no-skill baseline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `SKILL.md` and `project-detection.md`

**Files:**
- Create: `plugins/statamic-kit/skills/blueprints/SKILL.md`
- Create: `plugins/statamic-kit/skills/blueprints/references/project-detection.md`
- Delete: `plugins/statamic-kit/skills/.gitkeep`

**Interfaces:**
- Consumes: case names and suite command (Task 3).
- Produces: reference filenames Task 5 must create exactly: `references/blueprint-yaml.md`, `references/fieldtypes.md`, `references/page-builder.md`, `references/templates.md`.

- [ ] **Step 1: Read the live skill spec**

Read `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/skill-development/SKILL.md` and its `references/`. If anything below conflicts with it (frontmatter keys, description rules), the live file wins.

- [ ] **Step 2: Write `SKILL.md`**

```markdown
---
name: blueprints
description: Use when creating or changing Statamic blueprints, fieldsets or page-builder blocks — adding a block or set to a replicator or bard page builder, creating a collection or taxonomy with its fields, adding or changing fields on a blueprint, or moving repeated fields into a fieldset. Also triggers on phrasing like "add an FAQ block", "new collection for vacancies", "voeg een blok toe aan de page builder".
---

# Statamic blueprints

Create and edit blueprints, fieldsets and page-builder blocks **the way this
project already does it**. Never impose a structure; detect it and follow it.

## Workflow

1. **Detect.** Follow `references/project-detection.md`. Do not skip steps;
   every later decision depends on what you find. If the Eloquent driver backs
   blueprints or collections, stop here: explain that YAML edits would have no
   effect and suggest the Control Panel instead. Write nothing.
2. **Clarify only real ambiguity.** Two page builders, an unclear target group,
   underspecified fields, or a requested handle that already exists. Propose a
   default rather than asking an open question. If no page builder exists and
   one was asked for, propose creating one — do not guess.
3. **Present the plan, then stop.** List files to modify and create, the exact
   new YAML fragments, the partial outline, and the conventions you follow
   ("Dutch labels like the other sets"). **Write nothing until the user
   approves.** A prompt that explicitly pre-approves the plan counts as approval;
   still show the plan first.
4. **Write.** Minimal edits: keep existing order, indentation, comments and
   quote style. Put a new set in the right group. Put the partial where sibling
   partials live, modelled on the closest sibling. Details:
   `references/blueprint-yaml.md`, `references/fieldtypes.md`,
   `references/page-builder.md`, `references/templates.md`.
5. **Verify.** Static checks always; runtime check when possible (see below).
   Then summarise what changed and where to find it in the Control Panel.

## Verify

- Every YAML file you touched parses. Try, in order: `php` with the project's
  `vendor/autoload.php` and `Symfony\Component\Yaml\Yaml::parseFile`;
  `ruby -ryaml`; `python3` with `yaml`. If none is available, say so.
- Set handles are unique within their replicator; group handles are unique.
- Every new set has a partial/component on the dispatch path.
- Every `import:` names a fieldset file that exists.
- Runtime, when PHP and `vendor/` exist: `php please stache:clear`, then
  `php please blueprint:list` or loading the page in the CP. If you cannot run
  it, **say "runtime check not run" and why** — never report it as verified.
- A failed check: show it, fix it, re-verify. Never finish with a silent
  half-result.

## Out of scope

Editing entries/content, globals/forms/navigation beyond their blueprint, and
styling partials beyond following existing markup conventions.
```

- [ ] **Step 3: Verify the runtime command**

Use context7 (`resolve-library-id` "Statamic", `query-docs` "php please commands list blueprints stache clear"). If `blueprint:list` does not exist in Statamic 6, replace that phrase in `SKILL.md` with the documented command that loads blueprints, or drop it and keep "loading the page in the CP".

- [ ] **Step 4: Write `references/project-detection.md`**

```markdown
# Project detection

Establish all of the following before planning. Report anything uncertain.

## 1. Statamic version

- Read `composer.lock` → package `statamic/cms` → `version`.
- No lock file: read `composer.json` → `require.statamic/cms` constraint and
  say you are using the constraint, not the installed version.
- Neither: this may not be a Statamic project — ask.

## 2. Storage driver (stop condition)

- `statamic/eloquent-driver` in `composer.lock`/`composer.json`, **and**
  `config/statamic/eloquent-driver.php` sets `'driver' => 'eloquent'` for
  `blueprints` or `collections` → blueprints/collections live in the database.
  Stop: YAML edits would be ignored.
- Driver installed but only `entries` on eloquent → blueprints are still files;
  continue, and mention it.

## 3. Paths

- Blueprints: `resources/blueprints/` (collections under
  `collections/<collection>/<blueprint>.yaml`, taxonomies under
  `taxonomies/<taxonomy>/`, globals under `globals/`, forms under `forms/`).
- Fieldsets: `resources/fieldsets/<handle>.yaml`.
- Collections config: `content/collections/<handle>.yaml`.
- Taxonomies config: `content/taxonomies/<handle>.yaml`; term blueprints under
  `resources/blueprints/taxonomies/<handle>/`. A collection opts into a taxonomy
  via `taxonomies: [<handle>]` in its collection config; entries link terms with
  a `terms` field.
- If these directories are missing, grep `config/statamic/` for a custom path
  before concluding.

## 4. Page builder

- Grep blueprints and fieldsets for `type: replicator` and `type: bard` fields
  that have `sets:`.
- For each, record: file, field handle, whether it is **inline** in a blueprint
  or in a **fieldset** that blueprints pull in with `import:`, the set groups
  (`sets: <group>: display/sets`) and the sets in each.
- A fieldset-based builder is edited **in the fieldset**, never by copying sets
  into a blueprint.
- More than one candidate → ask which one, naming each.

## 5. Template dispatch

Find where the builder field is rendered:
- Antlers: `{{ <field> }} … {{ partial src="<dir>/{type}" }} … {{ /<field> }}`
  → partials at `resources/views/<dir>/<set>.antlers.html`.
- Blade: a loop over the field rendering
  `<x-dynamic-component :component="'<prefix>.'.$block['type']" …>`
  → components at `resources/views/components/<prefix>/<set>.blade.php`
  (dots in the prefix are directories).
- Something else → describe it and ask.
Template language = the language of the dispatching template and sibling partials.

## 6. Conventions

- CP label language: read existing `display:` values. New labels use that
  language **regardless of the language of the user's request**.
- Handle style (snake_case is Statamic's norm), whether sets carry `icon:` and
  `instructions:`, ordering rules stated in YAML comments.
- The closest sibling partial: its wrapper element, how it guards empty fields,
  comment style. Model the new partial on it.
- Existing handles: if the requested set/field handle already exists, say so and
  offer to extend it instead of adding a duplicate.
```

- [ ] **Step 5: Validate**

Run: `cd <repo> && rm plugins/statamic-kit/skills/.gitkeep && claude plugin validate plugins/statamic-kit`
Expected: `✔ Validation passed`.

- [ ] **Step 6: Quick trigger check (cheap)**

Run: `claude plugin eval plugins/statamic-kit --scaffold --trust-plugin --allow-tools Bash Write Edit --no-publish --runs 1 --ablation none --case 'no-approval-no-writes'`
Expected: `skill-fired` ✓ and `no-writes`/`no-edits` ✓. If the skill does not fire, sharpen the description's trigger phrases and re-run.

- [ ] **Step 7: Commit**

```bash
cd <repo>
git add -A plugins/statamic-kit/skills
git commit -m "Add blueprints skill workflow and project detection reference

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Content references

**Files:**
- Create: `plugins/statamic-kit/skills/blueprints/references/blueprint-yaml.md`
- Create: `plugins/statamic-kit/skills/blueprints/references/fieldtypes.md`
- Create: `plugins/statamic-kit/skills/blueprints/references/page-builder.md`
- Create: `plugins/statamic-kit/skills/blueprints/references/templates.md`

**Interfaces:**
- Consumes: filenames from Task 4; `evals/BASELINE.md` (Task 3).

- [ ] **Step 1: Verify the facts against current Statamic docs**

For each fact below, run a context7 `query-docs` against the Statamic docs library (resolve "Statamic" first). Correct any fact the docs contradict before writing; note Statamic 5 vs 6 differences if the docs state any.
- Blueprint shape `tabs: <tab>: display, sections: [ {display?, fields: [...]} ]`.
- Field entry forms: inline `{handle, field: {type, …}}`; reference `{handle, field: '<fieldset>.<field>'}`; import `{import: <fieldset>, prefix?: <prefix>_}`.
- Fieldset shape `title`, `fields: [...]`.
- Replicator set groups: `sets: <group>: {display, icon?, sets: <set>: {display, instructions?, icon?, fields: [...]}}`.
- Bard sets use the same `sets` structure as replicator.
- Collection config keys: `title`, `route`, `structure`, `dated`, `template`, `sort_dir`; blueprint selection by directory `resources/blueprints/collections/<handle>/`.
- Taxonomy config file `content/taxonomies/<handle>.yaml` keys; term blueprint location `resources/blueprints/taxonomies/<handle>/`; collection `taxonomies:` key; `terms` fieldtype options (`taxonomies`, `max_items`, `mode`).
- Antlers replicator loop exposes `type` and set fields; `{{ partial src="blocks/{type}" }}` resolves `resources/views/blocks/<type>.antlers.html`.
- Blade: replicator values iterate as arrays/values with `type` key.

- [ ] **Step 2: Write `blueprint-yaml.md`** — sections, in this order: "Blueprint file shape" (annotated example of tabs/sections/fields), "Three ways to declare a field" (inline / reference / import with `prefix`, when to use each), "Fieldset file shape", "Where files live" (one table mirroring project-detection §3), "Minimal-edit rules" (keep order, two-space indentation, `-` on its own line before each field if the file does that, keep comments and quote style, don't reformat untouched lines), "Observed mistakes" (one bullet per YAML-related failure in `evals/BASELINE.md`, phrased as a rule).

- [ ] **Step 3: Write `fieldtypes.md`** — a table: need → fieldtype → key options. Rows at minimum: short text → `text` (`character_limit`, `placeholder`); long plain text → `textarea`; rich text → `bard` (`buttons`, `save_html`, `sets`); markdown → `markdown`; number → `integer`/`float` (`min`, `max`); yes/no → `toggle`; choice → `select`/`button_group`/`radio` (`options`); link/URL → `link`; image/file → `assets` (`container`, `max_files`, `mode`); repeated rows → `grid` (`fields`, `min_rows`, `max_rows`); repeated mixed blocks → `replicator`; grouped fields → `group`; date → `date` (`time_enabled`); relation → `entries`/`terms` (`collections`/`taxonomies`, `max_items`). Then "Copy the project's options": prefer options sibling fields already use (e.g. the same `container`). Then "Observed mistakes" from the baseline.

- [ ] **Step 4: Write `page-builder.md`** — "Inline vs fieldset builders" (edit where it lives; never copy sets between), "Set groups" (put the set in the group whose existing sets are closest in purpose; create a new group only when none fits, and say so in the plan), "Set anatomy" (`display`, `instructions`, `icon` only if siblings have them), "Ordering" (follow stated rules in YAML comments; otherwise append to the group), "Duplicate handles" (extend vs new), "Creating a builder from scratch" (replicator field on the pages blueprint + dispatch template in the project's template language; always a proposal first), "Observed mistakes".

- [ ] **Step 5: Write `templates.md`** — "Antlers partial" (example for a set with `heading` + grid `items`; `{{ if }}` guards; loop syntax `{{ items }}…{{ /items }}`; comment `{{# #}}`), "Blade component" (`@props(['block'])`, `$block['field']`, `@foreach ($block['items'] as $item)`, `{{-- --}}`, `@if` guards), "Follow the sibling" (copy wrapper element and guard style from the closest sibling; no hard-coded sample content; no new CSS framework classes beyond what siblings use), "Dispatch paths" (the two patterns from project-detection §5), "Observed mistakes".

- [ ] **Step 6: Validate**

Run: `cd <repo> && claude plugin validate plugins/statamic-kit`
Expected: `✔ Validation passed`.

- [ ] **Step 7: Commit**

```bash
cd <repo>
git add plugins/statamic-kit/skills/blueprints/references
git commit -m "Add blueprints skill content references

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Make the suite pass (GREEN)

**Files:**
- Modify: `plugins/statamic-kit/skills/blueprints/SKILL.md` and `references/*.md` as needed
- Create: `plugins/statamic-kit/evals/RESULTS.md`

- [ ] **Step 1: Full run with baseline arm**

Run: `cd <repo> && claude plugin eval plugins/statamic-kit --scaffold --trust-plugin --allow-tools Bash Write Edit --no-publish --runs 3 --json plugins/statamic-kit/evals/results/green.json`
Expected: every case score 1.0 in the with-plugin arm; exit 0.

- [ ] **Step 2: For each failing case, fix the skill — not the grader**

Read the failing grader's verdict in the report. Change `SKILL.md`/references to address the cause, re-run only that case with `--case <name> --runs 3`. Change a grader only if it is provably wrong about correct output (e.g. a regex too strict about indentation that the minimal-edit rule allows); record any such change in `RESULTS.md`.

- [ ] **Step 3: Re-run the full suite** (command from Step 1). Expected: all 1.0.

- [ ] **Step 4: Write `evals/RESULTS.md`**

Table: case | with-plugin score | baseline-arm score | delta, plus the date, Claude Code version (`claude --version`) and model. Note any grader changes from Step 2.

- [ ] **Step 5: Commit**

```bash
cd <repo>
git add plugins/statamic-kit/skills plugins/statamic-kit/evals/RESULTS.md
git commit -m "Make blueprints eval suite pass

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Smoke test on real-site copies (local only, nothing committed)

**Files:** none in the repo. Work in the session scratchpad.

- [ ] **Step 1: Copy both sites**

```bash
S=$(mktemp -d)/smoke
rm -rf "$S" && mkdir -p "$S"
rsync -a --exclude node_modules --exclude .git --exclude storage/framework/cache <path-to-site-a>/ "$S/site-a/"
rsync -a --exclude node_modules --exclude .git --exclude storage/framework/cache <path-to-site-b>/ "$S/site-b/"
```
(If the session scratchpad path differs, use the current one; never run in the original directories.)

- [ ] **Step 2: Run three real requests against the copies**

```bash
cd "$S/site-a" && claude -p --plugin-dir <repo>/plugins/statamic-kit --permission-mode acceptEdits --allowedTools "Bash(php please:*)" "Bash(php -r:*)" "Add a testimonials block to the page builder: quote, name and role. I approve the plan in advance."
cd "$S/site-b" && claude -p --plugin-dir <repo>/plugins/statamic-kit --permission-mode acceptEdits --allowedTools "Bash(php please:*)" "Bash(php -r:*)" "Voeg een blok 'kader' toe aan de page builder: een kop en een tekst. Ik keur het plan bij voorbaat goed."
cd "$S/site-b" && claude -p --plugin-dir <repo>/plugins/statamic-kit "Add an FAQ block."
```
Expected: first two write the set + partial/component following each site's pattern and run the runtime check; the third presents a plan and writes nothing (and may flag that the site's builder is the `article_blocks` fieldset).

- [ ] **Step 3: Runtime check by hand**

```bash
cd "$S/site-a" && php please stache:clear && git diff --no-index <path-to-site-a>/resources "$S/site-a/resources" | head -120
cd "$S/site-b" && php please stache:clear && git diff --no-index <path-to-site-b>/resources "$S/site-b/resources" | head -120
```
Expected: `stache:clear` succeeds; diffs touch only the builder file and one new partial/component each. If a site needs services (DB, magebox) for `php please`, record "runtime check not run" and why.

- [ ] **Step 4: Report findings to Mitchell** — what worked, what didn't, diffs summarised. Fix any skill issue found (back to Task 6 Step 2 for that case, adding a fixture/case if the failure isn't covered), then delete `$S`.

---

### Task 8: Ship: marketplace, README, CLAUDE.md

**Files:**
- Modify: `<repo>/.claude-plugin/marketplace.json`
- Modify: `plugins/statamic-kit/README.md`
- Modify: `plugins/statamic-kit/CLAUDE.md`

- [ ] **Step 1: Add the marketplace entry** (append to `plugins[]`):

```json
{
  "name": "statamic-kit",
  "source": "./plugins/statamic-kit",
  "description": "All-in-one Statamic toolkit: /statamic-kit:blueprints creates blueprints, fieldsets and page-builder blocks (with partials) following your project's own patterns.",
  "author": {
    "name": "Mitchell de Roode",
    "email": "developer@mitsol.nl"
  }
}
```

- [ ] **Step 2: Update README** — replace the "Status: scaffold" line with an install section and a component list:

```markdown
## Install

```
/plugin install statamic-kit --marketplace mjderoode/claude-plugins
```

## Components

| Component | What it does |
|---|---|
| `/statamic-kit:blueprints` | Creates and edits blueprints, fieldsets and page-builder blocks, including the block's Antlers or Blade partial, by detecting and following the project's existing pattern. Presents a plan and waits for approval before writing. |

Works standalone from your project files — no Composer package needed. Runs fine
alongside [Statamic Boost](https://statamic.com/addons/chrisvasey/statamic-boost).
Sites using the Eloquent driver for blueprints/collections are detected and not edited.
```
Keep the existing Layout and Development sections; add `claude plugin eval plugins/statamic-kit --scaffold --allow-tools Bash Write Edit` to Development.

- [ ] **Step 3: Update `CLAUDE.md`** — replace "Status: scaffold. No components exist yet; what goes in is still to be decided." with "Status: v0.1 — `blueprints` skill shipped (see `docs/specs/2026-10-19-statamic-kit-blueprints-design.md`). Next candidates: template review agent, then mods." Remove the "Caveat: not yet in the marketplace" section.

- [ ] **Step 4: Validate both**

Run:
```bash
cd <repo>
claude plugin validate plugins/statamic-kit
claude plugin validate .
```
Expected: both `✔ Validation passed`, and no README install-line advice.

- [ ] **Step 5: Install from the local marketplace and smoke-test the slash command**

Run: `claude plugin marketplace add <repo>` (skip if already added), `claude plugin install statamic-kit@mitchell-plugins`, then in a copy of a fixture: `cd $(mktemp -d) && cp -R <repo>/plugins/statamic-kit/evals/fixtures/inline-antlers/. . && claude -p "/statamic-kit:blueprints add an FAQ block"`
Expected: a plan is presented; nothing written.

- [ ] **Step 6: Commit**

```bash
cd <repo>
git add .claude-plugin/marketplace.json plugins/statamic-kit/README.md plugins/statamic-kit/CLAUDE.md
git commit -m "Register statamic-kit in the marketplace

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
