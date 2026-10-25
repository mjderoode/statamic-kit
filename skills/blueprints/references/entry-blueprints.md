# Multiple blueprints per collection

A collection can have several entry blueprints ("entry types"): every YAML file in
`resources/blueprints/collections/<collection>/` is one. Editors pick one when
creating an entry; the entry stores it as `blueprint: <handle>`.

## Which one is the default

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

## Adding a field when there are several

If the request does not name the blueprint ("add a subtitle to the pages"), list
the blueprints (handle and title) and ask whether the field goes on one, several
or all. This is real ambiguity: ask even when the plan is pre-approved. A field
shared by all of them is a good case for a fieldset import.

## A new entry blueprint

- File: `resources/blueprints/collections/<collection>/<handle>.yaml`, handle
  singular like its siblings, `title:` in the project's CP language.
- Start from the closest sibling's shape (tabs, `title` field, slug/SEO fields
  or imports the siblings share), then add the requested fields.
- Templates: if sibling entries use their own template (`template:` on the
  entry, e.g. `service`), create one for the new type next to it, modelled on
  the closest sibling, and tell the user to choose it on the entry. Otherwise
  the collection's `template:` renders it; say which fields it does not show yet.
