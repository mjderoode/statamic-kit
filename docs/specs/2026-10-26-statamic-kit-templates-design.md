# statamic-kit: templates skill — design

Date: 2026-10-26. Status: draft for approval.

## Intent

The kit writes structure (blueprints, forms, users) and the partial for each
page-builder set, but not the pages around them. Building a listing page, a
detail page or a navigation is the most common template work on a Statamic
site, and it is where generated code most often "works" without fitting the
site: a generic layout instead of the site's own, invented field handles, a
template that the route never picks up, pagination without links, no empty
state, a dynamic part frozen by static caching.

A `templates` skill builds those pages **the way this site already does it**:
same layout, same partials and components, same helpers, wired to the
collection so Statamic actually uses the template.

## Goals

- Build these page types in v1, in Antlers or Blade, whichever the site uses:
  1. **Listing** of a collection: pagination with links, sort order, optional
     filter by taxonomy term, an empty state.
  2. **Detail** (show) template for a collection's entries.
  3. **Taxonomy term archive**: a term page that lists its entries.
  4. **Navigation partial** with child levels and an active state.
  5. **Breadcrumbs.**
  6. **Responsive image partial** (Glide, `srcset`), reused where images are
     output.
- Reuse what the site has: its layout, card/teaser partials, image component,
  heading and class patterns. A new template is modelled on its closest
  sibling, like set partials are today.
- Wire the page so it is reachable and uses the template (see **Boundary with
  `blueprints`**).
- Plan, approval, write, verify — the same gates as `blueprints`: nothing is
  written before the user approves the plan, unless the request pre-approves it.
- After writing, the `template-reviewer` agent reviews the page templates.

## Boundary with `blueprints` (decided 2026-10-26)

`templates` **may wire existing structure**, as explicit lines in the plan:

- `template:` and `layout:` in a collection or taxonomy config, or on an entry;
- `mount:` and `route:` in a collection config;
- creating the listing page entry (e.g. `/news` in the `pages` collection) and
  adding it to the pages tree;
- a `Route::statamic(...)` line in `routes/web.php` when the site uses those.

`templates` **does not create structure**: no new collections, taxonomies,
blueprints, fieldsets or fields. When a page needs structure that does not
exist (a collection, or a field such as `excerpt` or `author`), it stops, names
what is missing and offers to do that part with the `blueprints` skill first.
It never invents a field handle in a template.

Changing an existing `route:` changes live URLs: the plan says so explicitly
(which URLs change) before asking for approval.

## Why a skill, not an agent

Writing must go through the user's approval of a plan, and an agent cannot ask
anything mid-run. The reading involved (layout, two or three sibling templates,
one blueprint) is small; measured plan runs on a real site peaked at 41–52k
context, so a mapper agent would be an extra hop for nothing. Agents are not
started unasked in Claude Code, so one would need a dispatching skill anyway.
The agent part already exists: `template-reviewer`, extended to page templates.

## Non-goals (v1)

- Search results page, 404 page, SEO meta, sitemap, language switcher. Next
  version; the IDEAS.md entry stays.
- Styling and visual design beyond copying the site's existing markup and
  classes; JavaScript filtering, Livewire, Alpine behaviour.
- Custom controllers or PHP beyond a `Route::statamic` line (the future
  `extend` skill).
- Editing content beyond creating the listing page entry.

## Anti-goals (a failure even if it technically works)

- **Generic boilerplate** that ignores the site's layout, partials or classes.
- **Invented field handles**: every variable in a template exists in the
  blueprint (or is a Statamic system variable).
- **Creating structure** (a collection, field, blueprint) instead of handing
  it to `blueprints`.
- **A template nobody reaches**: written to a path the collection's
  `template:` setting or the route does not resolve to.
- **Silent URL changes** from a route edit.
- Editing a file that is not in the approved plan.

## Site variations to handle

These come from the existing project detection plus a few page-specific ones;
the skill reuses `references/project-detection.md`.

- **Template language** from the layout and siblings, not the file tree.
- **Eloquent driver.** Collections or entries in the database: templates are
  files and may still be written, but wiring in YAML is not possible — the plan
  says to set `template:` / `mount:` / the listing page in the Control Panel
  instead. (My call; the `blueprints` skill stops entirely, but a template on
  its own is not half a feature here.)
- **Template resolution.** Entry `template:` beats the collection's
  `template:`; `template: '@blueprint'` resolves to
  `resources/views/{collection}/{blueprint}`, remappable with
  `blueprint_templates` in `config/statamic/system.php`. The skill writes the
  template where the site's setting resolves.
- **Static caching on** (`config/statamic/static_caching.php` strategy not
  `null`): dynamic parts (query-string filters, pagination via query string,
  "current" state that varies per request) need `nocache` or a note in the plan.
- **Multisite.** No hard-coded locale prefixes; links from `url`/`permalink`;
  collection and nav tags already scope to the current site.
- **No existing sibling** for a page type: follow the layout and the closest
  page template, and say so in the plan.

## Template reviewer

Today the agent reviews set and form templates and reads show/index templates
and layouts only as context. Extend its scope to the six page types above,
with these page-specific checks (added to its existing list): every variable is
a field of the collection's blueprint or a system variable; a listing has an
empty state and pagination links when paginated; one `<h1>` per page and a
heading order that fits the layout; images have alt text and dimensions;
`nocache` where static caching would freeze a dynamic part. The calling skill
handles findings exactly as `blueprints` does (must-fix in planned files, once).

## How we know it works

Same loop as every earlier step: fixtures, RED cases without the skill, then
the skill, GREEN (3/3 for new cases), full suite once, RESULTS.md. References
are written only for what RED shows Claude gets wrong — where the baseline
already does it right, the skill stays short. Then a real-site QA round with a
templates section in `docs/qa/test-protocol.md`.

## Left to the builder

Exact SKILL.md wording, the split of references into files, fixture contents
beyond what the cases need, grader wording, and the trigger phrases (English
and Dutch) — subject to the guard cases that `blueprints` and `templates` do
not steal each other's requests.
