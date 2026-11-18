# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`__PROJECT_SLUG__` is a **Statamic 6** site. Statamic is flat-file, so there is **no
database for content**: it lives in `content/` as YAML and Markdown and is committed to
git. Git is the source of truth — anything edited in a production control panel is gone
the next time you deploy.

Stack: Statamic 6, Laravel, PHP __PHP_VERSION__, Tailwind 4 via Vite, Antlers templates.
<!-- magebox -->
Local env is MageBox at **__SITE_URL__**, CP at `/cp`.
<!-- /magebox -->
<!-- no-magebox -->
Local env is `php artisan serve` at **__SITE_URL__**, CP at `/cp`.
<!-- /no-magebox -->

Use the statamic-kit skills (`blueprints`, `forms`, `templates`) for changes.

Scaffolded with the statamic-kit `setup` skill. Everything below is the general shape; delete what stops
being true and add what this project actually does.

## Commands

```bash
<!-- magebox -->
magebox start            # bring up nginx + php-fpm for this project
<!-- /magebox -->
<!-- no-magebox -->
php artisan serve        # serve the site at __SITE_URL__
<!-- /no-magebox -->
npm run dev              # Vite dev server
npm run build            # production asset build — required after template/CSS edits
php please cache:clear   # after editing blueprints
php please stache:clear  # after editing content or the page tree by hand
php please make:user --super
```

<!-- magebox -->
**The MageBox php wrapper breaks Composer.** `~/.magebox/bin/php` has a recursion guard
that trips when an installer shells out to Composer. Run a real PHP binary instead:

```bash
export PATH="$(echo "$PATH" | tr ':' '\n' | grep -v '\.magebox/bin' | paste -sd: -)"
__PHP_BINARY__ please <command>
```
<!-- /magebox -->

If a Composer install hits GitHub rate limits, the token in `~/.composer/auth.json` is
probably expired. Use a live one:

```bash
COMPOSER_AUTH='{"github-oauth":{"github.com":"'$(gh auth token)'"}}' composer install
```

## Architecture

### The page builder is the whole site

Pages are entries in the `pages` collection using the `page` blueprint
(`resources/blueprints/collections/pages/page.yaml`). The collection sets
`template: page`, so entries do not set a template themselves. The blueprint's `page_builder` Replicator holds
every section as a set: `hero`, `page_header`, `rich_text`, `columns`, `highlights`,
`directory`, `people`, `image_band`, `video`, `cta_panels`, `form`.

`resources/views/page.antlers.html` is just a loop that maps each set to a partial:

```antlers
{{ page_builder }}
    {{ partial src="blocks/{type}" }}
{{ /page_builder }}
```

**So: one set in the blueprint = one partial in `resources/views/blocks/`, named after the
set handle.** Adding a section means adding both. Never put section markup in the layout,
and never hardcode copy into a partial — if content is being typed into a template, it
wants to be a blueprint field instead.

Sets with `enabled: false` are dropped from Antlers output automatically, so a block
switched off in the CP needs no guard in the template. That is the mechanism for a block
that exists on every page but renders on only some of them: ship it disabled and let an
editor switch it on, rather than rebuilding the content later.

Choosing between the similar blocks:

- `hero` is the full-bleed homepage banner; interior pages use `page_header`.
- `directory` is a hairline card grid — good for many short, evenly sized groups. For a
  couple of longer, uneven blocks of prose use `columns`; the grid leaves big empty cells
  and breaks the reading flow.

URL fields in the blocks (`cta_url`, `announcement.link_url`, and the button `url` in
`cta_panels`) are `link` fields, so editors can pick an entry or type a URL; the value
augments to a URL string in templates.

### Page URLs come from the structure tree

`content/trees/collections/pages.yaml` decides what exists at which URL — an entry file on
its own is not routable. Two traps, both of which cost real time:

1. **Reference entries by ID, never by slug.** `entry: about` appears to work for
   top-level pages, but any `children:` under a slug-referenced item is **silently
   flattened** — the child ends up at `/child` instead of `/parent/child`, with no error.
   Use the entry's `id` from its front matter.
2. The collection is `structure: root: true`, so **the first item is the root page (home,
   at `/`) and cannot have children**. Other pages are siblings at the top level, not
   nested under home. Nesting them throws `Root page cannot have children` as a 500 on
   every page.

After editing the tree by hand run `php please stache:clear`, not just `cache:clear`.

### Section landing pages redirect to their first child

`redirect` is a `link` field in the blueprint's sidebar tab. Setting it to `@child`
(shown as "First Child" in the CP) 302s to the first child in the tree — that is how a
`/projects` landing page sends visitors to `/projects/first-project`. Statamic resolves
this in `ResolveRedirect`; an entry with a `redirect` value and no resolvable target 404s.

### Navigation

The main menu is a Statamic navigation, `main`: `content/navigation/main.yaml` holds the
config and `content/trees/navigation/main.yaml` the tree. Editors change it under
Navigation in the CP. It is rendered with `{{ nav:main }}` in
`resources/views/partials/sidebar.antlers.html`. Like the page tree, the nav tree
references entries by **id**, never by slug. After editing it by hand run
`php please stache:clear`.

### Forms

A form is **two files**, and putting the fields in the wrong one fails silently — the
form renders with a submit button and no inputs:

- `resources/forms/<handle>.yaml` — config only: title, `honeypot`, `store`, `email`
- `resources/blueprints/forms/<handle>.yaml` — the fields, in normal `tabs → sections →
  fields` blueprint shape

The `form` page-builder set stores a `form` fieldtype, which augments to a
`Statamic\Forms\Form` **object**, not a string. The tag therefore needs the handle bound
as a variable: `{{ form:create :in="form_handle:handle" }}`. Passing `in="{ form_handle }"`
throws "A form handle is required on Form tags".

Wrap the form region in `{{ nocache }}`. Success messages and validation errors come from
the session, so under static caching a cached page shows neither. Re-filled values are
output as `{{ old | sanitize }}`. Required fields are marked in the template from the
blueprint's `validate` rules. The default `success_message` lives only in the `form` set
in the page blueprint; do not repeat it in the partial.

For a checkbox whose label is a full sentence, keep `display` short and put the sentence in
`instructions` — validation messages interpolate `display`, so a sentence there produces
"The I consent to… field must be accepted."

Submissions land under Tools → Forms and in `storage/forms/`.
<!-- magebox -->
Mail goes to MageBox's Mailpit — **SMTP is on port 1025**, not the 2525 a generated
`.env` ships with. Inbox at http://localhost:8025.
<!-- /magebox -->
<!-- no-magebox -->
Mail goes to `storage/logs/laravel.log` (`MAIL_MAILER=log`); set a real mailer in `.env`
when notifications should be delivered.
<!-- /no-magebox -->

The scaffolded `contact` form has its `email:` block commented out, because a failed send
is a **500 on the visitor's submit**, not a logged warning — the submission is stored and
then the request dies.
<!-- magebox -->
Mailpit runs in Docker, so it is down whenever Docker is.
<!-- /magebox -->
Switch notifications on only once mail is genuinely reachable, and if a form starts 500ing on
submit while the submission still appears in the CP, this is why.

### Custom modifiers

`app/Modifiers/` is auto-registered — generate with `php please make:modifier Name`, then
use it as `snake_case` in Antlers. `AutoLink` (`{{ lines | auto_link | nl2br }}`) escapes a
block of text and links any emails, URLs and bare domains in it; the `directory` block
relies on it so contact details can stay a plain textarea in the CP. It also understands
`[label](/url)` for when the target differs from the visible text. Each pass runs only
outside existing anchors, so a match can never be re-linked by a later pass.

### Globals are named to dodge Antlers collisions

There are two globals: `social` (profiles) and `brand` (logo, wordmark). They are *not*
called `navigation` or `site` — `{{ site }}` is Statamic's built-in site variable and
`{{ navigation }}` is its nav tag, so those handles are unreachable in templates. The menu
is not a global; see Navigation.

Global data lives in `content/globals/default/*.yaml` (Statamic 6 puts values under the
site handle); the files directly in `content/globals/` only carry the title.

### Styling

Brand tokens are declared in `@theme` in `resources/css/site.css` — use `bg-brand`,
`text-accent`, `bg-deep`, `text-ink`, `text-mute` and the `text-display` / `text-section`
sizes rather than raw hex. `.rule-accent` draws the short accent bar above section
headings. Restyling the site means changing that one `@theme` block, not the partials.

Tailwind 4 has no config file; it compiles from a source scan, and `@source "../views"`
plus `@source "../../content"` in `site.css` are what make Antlers templates and content
visible to it. **Rebuild after adding utility classes** or they will not appear.

Fonts start as the system stack. To self-host, put woff2 files in `public/fonts`, add
`@font-face` rules to `site.css` and point `--font-sans` / `--font-display` at them.
Don't reach for the Google Fonts CDN.

### Images

Source images live in `public/assets` and are managed through the `assets` container.
Templates use Glide for responsive variants (`{{ glide:field width="960" format="webp" }}`)
— don't commit pre-generated size variants, Glide handles them at request time.

Alt text belongs to the asset, not the block: `image_band` has no `alt` field of its own,
and templates read the asset's `alt`. Fill it in under Assets in the CP.

## Conventions

- Keep sections editable. If content is being hardcoded into a partial, it probably wants
  to be a blueprint field instead.
- New blocks get a set in the blueprint *and* a partial named after the handle. Nothing
  else needs to change.
- Content changes are commits. `content/` is tracked on purpose.

## Local access

- Site: __SITE_URL__
- CP: __SITE_URL__/cp
<!-- magebox -->
- Mailpit: http://localhost:8025
<!-- /magebox -->
