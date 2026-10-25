---
name: blueprints
description: This skill should be used when the user asks to create or change Statamic blueprints, fieldsets, collections, taxonomies, global sets, navigations, asset containers, the user blueprint or page-builder blocks — "add an FAQ block to the page builder", "add a set to the replicator", "create a collection for vacancies", "add a taxonomy for topics", "add a global for the footer", "add a field to the contact settings", "add a footer navigation", "add a field to the main nav links", "add a photographer credit to our images", "add an asset container for PDFs", "add a job title field to users", "add a field to the page blueprint", "move the SEO fields into a fieldset", or Dutch phrasing such as "voeg een blok toe aan de page builder" or "maak een collection aan". Applies to Statamic sites with Antlers or Blade templates.
---

# Statamic blueprints

Create and edit blueprints, fieldsets, collections, taxonomies, global sets,
navigations, asset containers (and their metadata blueprints), the user blueprint and page-builder blocks **the way this project already does it**. Detect the existing pattern and
follow it; never impose a structure.

The references this skill needs are inlined at the end of this file
(**Inlined references**); the sections named in bold below are there. Do not
read reference files from the plugin folder — they are all inlined.

## Workflow

### 1. Detect

Follow **Project detection** (inlined below) completely before planning. Every later
decision depends on it.

**Stop condition — Eloquent driver.** If the driver backs blueprints, fieldsets,
collections or taxonomies, stop. Change **no files by any tool** — no YAML and no
partials or components either: a template for a set that does not exist in the database is
half a feature. Explain why YAML edits would have no effect and point to the
Control Panel (or the driver's import/export commands) instead.

### 2. Stop on real ambiguity

Ask, naming the options, and change no files (by any tool) until answered, when:

- **More than one page builder** (replicator or bard field with sets) could take
  the block. Never pick one silently, even if one looks more likely — name each
  candidate (field handle, file, tab) and recommend one.
- **No page builder exists** but a block was requested. Propose creating one.
- **A collection has several entry blueprints** and the request does not say
  which one gets the field. List them and ask (**Multiple blueprints per collection** below).
- **The requested handle already exists.** Offer to extend the existing set or
  field instead of adding a duplicate.
- The target group or the fields are genuinely underspecified.

Prefer proposing a default over an open question. Ambiguity is not cleared by
the user pre-approving "the plan" — they approved a plan, not a guess about which
builder they meant.

### 3. Present the plan — hard gate

Present, before any edit:

- every file to modify and every file to create,
- the exact YAML fragment(s) to add or change,
- for a new set: its group and position, with the reason
  (**Page builders** below),
- an outline of the partial/component,
- the conventions being followed (e.g. "Dutch CP labels like the other sets",
  "alphabetical order per the comment in the blueprint").

Then **stop and wait for approval. Do not create or change any file in the same
turn as the plan — not with Write or Edit, and not through Bash (`cat >`, `sed -i`,
`tee`, …)** unless the user's request explicitly pre-approves it (e.g. "I approve
your plan in advance", "go ahead without waiting"). Without such words, the turn
ends with the plan and a question. A YAML mistake in an existing blueprint breaks
the Control Panel, so the user sees the change first.

### 4. Write

- Make minimal edits. Keep existing order, indentation, comments, quote style and
  untouched lines exactly as they are.
- Put a new set in the right group (**Page builders** below).
- Put the partial/component where sibling partials live, modelled on the closest
  sibling (**Partials and components for sets** below).
- YAML shapes and field declarations: **Blueprint and fieldset YAML** below.
  Choosing a fieldtype: **Picking a fieldtype** below.
  A new entry blueprint next to existing ones: **Multiple blueprints per
  collection** below — adding one can change the collection's default blueprint.
  Global sets (config, blueprint, values, template usage): **Globals** below.
  Asset containers: config `content/assets/<handle>.yaml` (`title`, `disk`), a disk
  in `config/filesystems.php` modelled on the existing one with its own root, and
  the metadata blueprint `resources/blueprints/assets/<handle>.yaml`.
  Navigations (config, tree, item blueprint, template usage): **Navigation** below.

### 5. Verify

Run the static checks always and the runtime check when possible, then summarise
what changed and where to find it in the Control Panel.

**Static**
- Every touched YAML file parses. Try in order: PHP with the project's
  `vendor/autoload.php` and `Symfony\Component\Yaml\Yaml::parseFile()`;
  `ruby -ryaml -e 'YAML.load_file(ARGV[0])'`; `python3` with `yaml`.
- Set handles are unique within their replicator/bard field; group handles are
  unique.
- Every new set has a partial/component on the dispatch path.
- Every `import:` names a fieldset file that exists.

**Runtime** (when `php` and `vendor/` exist)
- `php artisan tinker --execute='echo implode(",", \Statamic\Facades\Blueprint::find("<namespace>.<handle>")->fields()->all()->keys()->all());'`
  — e.g. namespace `collections.pages`, handle `page`. This makes Statamic parse
  the blueprint and resolve its imports; it is read-only.
- If it cannot run (no `vendor/`, the app needs services that are down, a
  container without host access), report **"runtime check not run"** and why.
  Never report an unrun check as verified.

**Template review** (only if this run wrote or changed a set template; a
YAML-only change skips it)
- Dispatch the read-only reviewer: Agent tool with
  `subagent_type: "statamic-kit:template-reviewer"`, giving the template
  path(s), the blueprint or fieldset path and the set handle.
- Fix small **must-fix** findings yourself, only in files that were in the
  approved plan, then dispatch the reviewer once more at most. Anything
  larger, or in another file, becomes a question for the user — never edit a
  file outside the plan.
- Never fix **Bad practice** items (weaknesses the template shares with the
  rest of the site): list them under a heading named exactly `Bad practice`
  for a site-wide decision.
- List the **should-fix** findings and suggestions and offer to apply them;
  do not apply them unasked.
- End the final reply with a **Template review** section: what the reviewer
  found, what you changed, the should-fix items you offer, and the
  `Bad practice` list — or that it came back clean. Never leave it out.

A failed check: show it, fix it, re-verify. Never finish with a silent
half-result.

## Out of scope

Editing content (entries, terms, global values, navigation trees), user roles and groups (`resources/users/*.yaml`), and styling partials
beyond following existing markup conventions.
Forms are handled by the `forms` skill.

<!-- BEGIN INLINED REFERENCES: generated by scripts/inline-references.py, edit references/ instead -->

## Inlined references

<!-- source: skills/blueprints/references/project-detection.md -->
### Project detection

Establish all of the following before planning. Report anything uncertain
instead of guessing.

#### 1. Statamic version

- Read `composer.lock` → package `statamic/cms` → `version`.
- No lock file: read `composer.json` → `require["statamic/cms"]` and state that
  the constraint is used, not the installed version.
- Neither mentions `statamic/cms`: this may not be a Statamic project — ask.

#### 2. Storage driver (stop condition)

- `statamic/eloquent-driver` installed (lock or `composer.json`) **and**
  `config/statamic/eloquent-driver.php` sets `'driver' => 'eloquent'` under
  `blueprints`, `fieldsets`, `collections` or `taxonomies` → that structure lives
  in the database. Stop (see SKILL.md step 1); write nothing at all.
- Driver installed but only `entries`/`terms`/other content types on `eloquent`
  → blueprints are still files. Continue, and mention it in the plan.

#### 3. Paths

| What | Default location |
|---|---|
| Collection blueprints | `resources/blueprints/collections/<collection>/<blueprint>.yaml` |
| Taxonomy (term) blueprints | `resources/blueprints/taxonomies/<taxonomy>/<blueprint>.yaml` |
| Globals / forms / assets / user blueprints | `resources/blueprints/globals/`, `forms/`, `assets/`, `user.yaml` |
| Fieldsets | `resources/fieldsets/<handle>.yaml` |
| Collection config | `content/collections/<handle>.yaml` |
| Taxonomy config | `content/taxonomies/<handle>.yaml` |
| Navigation config / tree / blueprint | `content/navigation/<handle>.yaml` / `content/trees/navigation/<handle>.yaml` / `resources/blueprints/navigation/<handle>.yaml` (see **Navigation**) |
| Form config / blueprint | `resources/forms/<handle>.yaml` / `resources/blueprints/forms/<handle>.yaml` (forms skill) |
| Asset container config / blueprint | `content/assets/<handle>.yaml` / `resources/blueprints/assets/<handle>.yaml`; its disk in `config/filesystems.php` |
| Global set config / values | `content/globals/<handle>.yaml` / `content/globals/<site>/<handle>.yaml` (see **Globals**) |

These are only defaults. **Always** check the config, even when the default
directories exist (a fresh install leaves `resources/blueprints/user.yaml` and
`default.yaml` behind after the paths are moved):

| Config | Key | Moves |
|---|---|---|
| `config/statamic/system.php` | `blueprints_path` (string, or per-type array like `['default' => …, 'forms' => …]`) | Blueprints |
| `config/statamic/system.php` | `fieldsets_path` | Fieldsets |
| `config/statamic/stache.php` | `stores.collections.directory` | Collection configs (entries live under `stores.entries.directory`) |
| `config/statamic/stache.php` | `stores.taxonomies.directory` | Taxonomy configs |
| `config/statamic/stache.php` | `stores.navigation.directory`, `stores.nav-trees.directory` | Navigation configs and trees |
| `config/statamic/forms.php` | `forms` | Form configs |
| `config/statamic/stache.php` | `stores.asset-containers.directory` | Asset container configs |
| `config/statamic/stache.php` | `stores.globals.directory`, `stores.global-variables.directory` | Global set configs and values |

Resolve `base_path(...)` / `resource_path(...)` to project-relative paths and use
those for every read and write. Mention moved paths in the plan.
- A collection uses a taxonomy via `taxonomies: [<handle>]` in its collection
  config; entries link terms with a `terms` field.

#### 4. Page builders

- Grep blueprints and fieldsets for `type: replicator` and `type: bard` fields
  that have `sets:`.
- Record for each: file, field handle, tab, **inline** (in a blueprint) or
  **fieldset** (pulled into blueprints with `- import: <fieldset>`), the set
  groups (`sets: <group>: { display, sets: … }`) and the sets in each.
- A fieldset-based builder is edited **in the fieldset**, never by copying sets
  into a blueprint.
- More than one candidate → stop and ask (SKILL.md step 2).

#### 5. Template dispatch

Find where the builder field is rendered, to learn the template language and the
path a new partial needs:

- **Antlers:** `{{ <field> }} … {{ partial src="<dir>/{type}" }} … {{ /<field> }}`
  → partials at `resources/views/<dir>/<set>.antlers.html`.
- **Blade:** a loop over the field rendering
  `<x-dynamic-component :component="'<prefix>.'.$block['type']" …>`
  → anonymous components at `resources/views/components/<prefix>/<set>.blade.php`
  (dots in the prefix are directories).
- Anything else (`@include("blocks.{$type}")`, a custom tag, a view composer):
  describe it in the plan and follow it, or ask if unclear.

The template language is that of the dispatching template and the sibling
partials, not a guess from the file tree.

#### 6. Conventions

- **CP label language:** read existing `display:` values. New labels use that
  language **regardless of the language of the user's request**.
- **Handles:** match existing style (Statamic's norm is snake_case).
- **Set metadata:** add `icon:` / `instructions:` only if sibling sets have them.
- **Ordering:** obey rules stated in YAML comments (e.g. "keep sets alphabetical");
  otherwise append at the end of the group.
- **Closest sibling partial:** note its wrapper element, empty-field guards and
  comment style; the new partial copies them.
- **Existing handles:** if the requested set or field handle already exists, say
  so and offer to extend it.

<!-- source: skills/blueprints/references/blueprint-yaml.md -->
### Blueprint and fieldset YAML

#### Follow the file's own shape

Statamic accepts more than one shape. Match the file being edited, never convert:

- **Tabs and sections** (Statamic 4+ default, used by the CP):
  ```yaml
  title: Page
  tabs:
    main:
      display: Main
      sections:
        -
          display: Optional heading    # optional
          fields:
            -
              handle: title
              field:
                type: text
                display: Title
  ```
- **Flat** `fields:` at the top level (older or hand-written blueprints, and all
  fieldsets).
- Fields are always a **list** of `{handle, field}` / `{import}` entries in
  blueprints and replicator/bard sets. The **map** form keyed by handle
  (`fields: { title: { type: text } }`, seen in older docs) is legacy and only
  normalised for fieldsets — never write it into a blueprint or a set.

Indentation: two spaces. CP-written files put `-` on its own line before each
list item; keep that if the file does.

#### Three ways to declare a field

| Form | YAML | Use when |
|---|---|---|
| Inline | `- handle: x` + `field: { type: …, … }` | A one-off field. |
| Reference | `- handle: x` + `field: <fieldset>.<field>` (+ optional `config:` overrides) | Reuse one field from a fieldset. |
| Import | `- import: <fieldset>` (+ optional `prefix: <prefix>_`) | Pull in all of a fieldset's fields. Use `prefix` when importing the same fieldset twice or to avoid handle clashes. |

A field's `config:` override applies to references only, not to inline fields.

#### Fieldset file shape

```yaml
title: 'SEO'
fields:
  -
    handle: meta_title
    field:
      type: text
      display: 'Meta title'
```

File name = handle: `resources/fieldsets/seo.yaml` is imported as `import: seo`.

#### Extracting repeated fields into a fieldset

1. Copy the fields **verbatim** (every option: `character_limit`, `validate`,
   `instructions`, labels) into `resources/fieldsets/<handle>.yaml`.
2. Replace the inline fields in **every** blueprint that had them with one
   `- import: <handle>` at the same position.
3. Keep handles unchanged (no `prefix`) so existing content still maps.
4. Verify each blueprint still exposes the same field handles (runtime check).

#### Minimal-edit rules

- Insert; don't rewrite. Untouched lines stay byte-identical.
- Keep comments, blank lines, key order and quote style (`'single'`, `"double"`
  or bare) as found.
- Quote a value when it contains `:`, `#`, a leading special character, or is a
  YAML boolean-ish word (`yes`, `no`, `on`, `off`).

<!-- source: skills/blueprints/references/page-builder.md -->
### Page builders

A page builder is a `replicator` (or `bard`) field with `sets`.

#### Edit it where it lives

- **Inline** in a blueprint → edit that blueprint.
- **In a fieldset** pulled in with `- import: <fieldset>` → edit the fieldset.
  Never copy sets into a blueprint, and never duplicate a set between builders.

#### Set groups vs flat sets

Grouped (Statamic 4+, what the CP writes):
```yaml
sets:
  blocks:            # group handle
    display: Blocks
    sets:
      hero:          # set handle = partial name
        display: Hero
        instructions: '…'   # only if siblings have it
        icon: hero          # a confirmed icon name (see Icons below)
        fields:
          - …
```
Flat (older): `sets: { hero: { display: Hero, fields: … } }`. Keep whichever the
builder uses.

#### Placing the set: group and position

Decide the same way every time:

1. **No set groups** (flat `sets:`): append the set at the end.
2. **Group:** the group whose existing sets are closest in purpose to the new
   block (text/copy, media, layout, editorial…), judged by the sets in it, not
   only the group name.
   - **Several groups fit about equally:** take the one that comes **first** in
     the file.
   - **None fits:** use the **last** group, and in the plan offer a new group
     as the alternative. Never create a group unasked.
3. **Position:** last in that group, unless a comment states an ordering rule
   (e.g. "keep sets alphabetical inside each group") — then obey the comment.

The plan always names the group, why (its sibling sets), and the position —
e.g. "group `media` (image, gallery, audio), last, after `audio`" — so the user
can correct it before approving.

#### Icons

Set icons come from the project's icon set and changed in Statamic 6. In order:

1. Reuse an icon name a sibling set already uses, if one fits.
2. If the project registers no custom set icons (no `Sets::useIcons(...)` in
   `app/`), any name with a file at
   `vendor/statamic/cms/resources/svg/icons/<name>.svg` is valid — check the file
   exists before using it.
3. Otherwise omit `icon`. Never use a name you have not confirmed.

#### Handles

The set handle becomes the partial/component name and the stored `type`, so pick
it once: snake_case, descriptive (`faq`, `image_text`). If it already exists, stop
and offer to extend the existing set (SKILL.md step 2).

#### Creating a builder from scratch

Only after the user approves the proposal:
1. Add a replicator field (e.g. `page_builder`) to the target blueprint, with one
   group and the requested set.
2. Render it in the collection's template using the project's template language
   (**Partials and components for sets** shows both dispatch patterns).
3. Create the first partial/component.

<!-- source: skills/blueprints/references/templates.md -->
### Partials and components for sets

Each new set needs a template on the project's dispatch path
(**Project detection** §5). Model it on the **closest sibling** partial: same
wrapper element and class pattern, same empty-field guards, same comment style.
No hard-coded sample content; no CSS classes or frameworks the siblings don't use.

#### Antlers partial

Path: `resources/views/<dir>/<set>.antlers.html`, where `<dir>` comes from the
dispatching `{{ partial src="<dir>/{type}" }}` — confirm against where the
existing sibling partials actually live. The set's fields are in scope directly.

```antlers
{{# FAQ: heading plus question/answer items. #}}
<section class="block block-faq">
    {{ if heading }}
        <h2>{{ heading }}</h2>
    {{ /if }}
    {{ items }}
        <details>
            <summary>{{ question }}</summary>
            {{ answer }}
        </details>
    {{ /items }}
</section>
```

#### Blade anonymous component

Path: `resources/views/components/<prefix>/<set>.blade.php` for
`<x-dynamic-component :component="'<prefix>.'.$block['type']" :block="$block" />`.
Read fields from the prop the dispatcher passes (here `$block`).

```blade
@props(['block'])

{{-- FAQ: heading plus question/answer items. --}}
<section class="block-faq">
    @if ($block['heading'])
        <h2>{{ $block['heading'] }}</h2>
    @endif
    @foreach ($block['items'] ?? [] as $item)
        <details>
            <summary>{{ $item['question'] }}</summary>
            {{ $item['answer'] }}
        </details>
    @endforeach
</section>
```

Escape with `{{ }}` (as above, where `answer` is a `textarea`). Use `{!! !!}` only
for fields that store HTML — Bard with `save_html: true`, or Markdown the project
renders to HTML — and only if sibling components do the same.

#### Field handles

Every variable in the template must be a field handle on the new set (or on its
grid rows). Re-read the YAML you wrote before writing the template.

<!-- source: skills/blueprints/references/fieldtypes.md -->
### Picking a fieldtype

Prefer the fieldtypes and options sibling fields already use (same asset
`container`, same Bard `buttons`, same `mode`). This table is the fallback.

| Need | Fieldtype | Key options |
|---|---|---|
| Short text, heading, label | `text` | `character_limit`, `placeholder`, `input_type` |
| Plain multi-line text | `textarea` | `character_limit` |
| Rich text | `bard` | `buttons`, `save_html`, `sets` |
| Markdown | `markdown` | — |
| Whole number / decimal | `integer` / `float` | `min`, `max` (hours, counts, prices: never `text`) |
| Yes/no | `toggle` | `default` |
| One of a few options | `select`, `button_group`, `radio` | `options`, `default` |
| Several options | `checkboxes`, `select` with `multiple: true` | `options` |
| URL or internal link | `link` | `collections` |
| Image or file | `assets` | `container`, `max_files`, `mode`, `folder` |
| Repeating rows of the same fields (FAQ items, links) | `grid` | `fields`, `min_rows`, `max_rows`, `mode`, `add_row` |
| Repeating mixed blocks | `replicator` | `sets` (see **Page builders**) |
| A named group of fields | `group` | `fields` |
| Date / date-time | `date` | `time_enabled`, `mode` |
| Link to entries | `entries` | `collections`, `max_items`, `mode` |
| Link to taxonomy terms | `terms` | `taxonomies`, `max_items` (omit for many), `mode`, `create` |
| Slug | `slug` | `from` |

`required: true` marks a field required in the CP; `validate:` takes Laravel
rules. Copy the project's habit — some sites use both.

<!-- source: skills/blueprints/references/entry-blueprints.md -->
### Multiple blueprints per collection

A collection can have several entry blueprints ("entry types"): every YAML file in
`resources/blueprints/collections/<collection>/` is one. Editors pick one when
creating an entry; the entry stores it as `blueprint: <handle>`.

#### Which one is the default

Statamic sorts a collection's blueprints by `order:` (missing = last), then
alphabetically by `title:`. The **first one without `hide: true` is the default**.
It is used for new entries and for **every existing entry without a
`blueprint:` key**.

Adding a blueprint can therefore silently switch existing entries to a different
blueprint. Before adding one:

1. Work out the current default with the rule above.
2. Work out the default after the change, with the new file included.
3. If it changes, keep the old default first: give the existing blueprints an
   `order:` (the default `order: 1`, the others after it) and the new one a
   higher `order:`. Do not rename the new title to dodge the sort, do not hide
   it (`hide: true` removes it from the "create entry" choice), and do not edit
   entries to add `blueprint:` keys.
4. Say in the plan which blueprint is the default before and after.

#### Adding a field when there are several

If the request does not name the blueprint ("add a subtitle to the pages"), list
the blueprints (handle and title) and ask whether the field goes on one, several
or all. This is real ambiguity: ask even when the plan is pre-approved. A field
shared by all of them is a good case for a fieldset import.

#### A new entry blueprint

- File: `resources/blueprints/collections/<collection>/<handle>.yaml`, handle
  singular like its siblings, `title:` in the project's CP language.
- Start from the closest sibling's shape (tabs, `title` field, slug/SEO fields
  or imports the siblings share), then add the requested fields.
- Templates: if sibling entries use their own template (`template:` on the
  entry, e.g. `service`), create one for the new type next to it, modelled on
  the closest sibling, and tell the user to choose it on the entry. Otherwise
  the collection's `template:` renders it; say which fields it does not show yet.

<!-- source: skills/blueprints/references/globals.md -->
### Globals

A global set is three things. Find the existing sets first and mirror them.

| Part | Default path | Holds |
|---|---|---|
| Set config | `content/globals/<handle>.yaml` | `title:` (and site settings on multisite) |
| Blueprint | `resources/blueprints/globals/<handle>.yaml` | The fields, same shape as any blueprint |
| Values | `content/globals/<site>/<handle>.yaml` | The field values, top-level keys (no `data:` wrapper) |

- `<site>` is the site handle; a single-site install uses `default`. Multisite
  sites are listed in `resources/sites.yaml`.
- `content/globals` can be moved via `stores.globals.directory` and
  `stores.global-variables.directory` in `config/statamic/stache.php`
  (**Project detection** §3).

#### Adding a field to an existing set

Edit only the blueprint. Never touch the values file: existing values must stay
exactly as they are, and a new field simply starts empty.

#### Creating a new set

1. Create the set config with a `title`.
2. Create the blueprint under `resources/blueprints/globals/` with the same
   handle.
3. Create an empty values file per site only if existing sets have one, at the
   same path pattern.
4. Handles must match across all files.

#### Template usage — include it in the summary

Show how to output the new field, in the project's own style:

- **Antlers:** `{{ <set>:<field> }}`, e.g. `{{ contact:opening_hours }}`; loop a
  grid with `{{ <set>:<field> }}…{{ /<set>:<field> }}`.
- **Blade:** check how the project already reads globals (a helper class, a view
  composer, `GlobalSet::findByHandle('<set>')->inCurrentSite()`, …) and use the
  same route; don't introduce a new one.

<!-- source: skills/blueprints/references/navigation.md -->
### Navigation

A navigation is up to three files. Mirror existing navigations.

| Part | Default path | Holds |
|---|---|---|
| Config | `content/navigation/<handle>.yaml` | `title`, `collections` (which collections' entries can be linked), `max_depth`, optional `root: true`, `select_across_sites` |
| Tree | `content/trees/navigation/<handle>.yaml` (multisite: `content/trees/navigation/<site>/<handle>.yaml`) | `tree:` — the actual links (content; created in the CP) |
| Blueprint | `resources/blueprints/navigation/<handle>.yaml` | Extra fields per nav item (optional; may not exist yet) |

Directories move via `stores.navigation.directory` and `stores.nav-trees.directory`
in `config/statamic/stache.php`.

#### Adding a field to nav items

The field goes in the navigation's **blueprint**. If the navigation has no
blueprint yet, create `resources/blueprints/navigation/<handle>.yaml` with the
normal blueprint shape. Never edit the tree — it holds editors' links.

#### Creating a navigation

1. Config with `title`, `collections` and `max_depth` as requested
   ("one level deep" = `max_depth: 1`).
2. Optionally an empty tree (`tree: []`) at the tree path; links are added in the CP.
3. A blueprint only if extra fields were asked for.

#### Template usage — include it in the summary

- **Antlers:** `{{ nav:<handle> }} … {{ url }} {{ title }} {{ <field> }} … {{ /nav:<handle> }}`;
  `{{ children }}` for nested levels. Use a new field where the loop renders links.
- **Blade:** follow how the project already renders navigation (a view
  component, `Statamic::tag('nav:<handle>')`, …).

<!-- END INLINED REFERENCES -->
