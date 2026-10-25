# Blueprint and fieldset YAML

## Follow the file's own shape

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

## Three ways to declare a field

| Form | YAML | Use when |
|---|---|---|
| Inline | `- handle: x` + `field: { type: …, … }` | A one-off field. |
| Reference | `- handle: x` + `field: <fieldset>.<field>` (+ optional `config:` overrides) | Reuse one field from a fieldset. |
| Import | `- import: <fieldset>` (+ optional `prefix: <prefix>_`) | Pull in all of a fieldset's fields. Use `prefix` when importing the same fieldset twice or to avoid handle clashes. |

A field's `config:` override applies to references only, not to inline fields.

## Fieldset file shape

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

## Extracting repeated fields into a fieldset

1. Copy the fields **verbatim** (every option: `character_limit`, `validate`,
   `instructions`, labels) into `resources/fieldsets/<handle>.yaml`.
2. Replace the inline fields in **every** blueprint that had them with one
   `- import: <handle>` at the same position.
3. Keep handles unchanged (no `prefix`) so existing content still maps.
4. Verify each blueprint still exposes the same field handles (runtime check).

## Minimal-edit rules

- Insert; don't rewrite. Untouched lines stay byte-identical.
- Keep comments, blank lines, key order and quote style (`'single'`, `"double"`
  or bare) as found.
- Quote a value when it contains `:`, `#`, a leading special character, or is a
  YAML boolean-ish word (`yes`, `no`, `on`, `off`).
