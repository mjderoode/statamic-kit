# Page builders

A page builder is a `replicator` (or `bard`) field with `sets`.

## Edit it where it lives

- **Inline** in a blueprint → edit that blueprint.
- **In a fieldset** pulled in with `- import: <fieldset>` → edit the fieldset.
  Never copy sets into a blueprint, and never duplicate a set between builders.

## Set groups vs flat sets

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

## Placing the set: group and position

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

## Icons

Set icons come from the project's icon set and changed in Statamic 6. In order:

1. Reuse an icon name a sibling set already uses, if one fits.
2. If the project registers no custom set icons (no `Sets::useIcons(...)` in
   `app/`), any name with a file at
   `vendor/statamic/cms/resources/svg/icons/<name>.svg` is valid — check the file
   exists before using it.
3. Otherwise omit `icon`. Never use a name you have not confirmed.

## Handles

The set handle becomes the partial/component name and the stored `type`, so pick
it once: snake_case, descriptive (`faq`, `image_text`). If it already exists, stop
and offer to extend the existing set (SKILL.md step 2).

## Creating a builder from scratch

Only after the user approves the proposal:
1. Add a replicator field (e.g. `page_builder`) to the target blueprint, with one
   group and the requested set.
2. Render it in the collection's template using the project's template language
   (`templates.md` shows both dispatch patterns).
3. Create the first partial/component.
