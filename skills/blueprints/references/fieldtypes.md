# Picking a fieldtype

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
