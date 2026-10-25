# Roles, groups and permissions

| Part | Default path | Shape |
|---|---|---|
| Roles | `resources/users/roles.yaml` | map: `<handle>: { title, permissions: [..] }` |
| Groups | `resources/users/groups.yaml` | map: `<handle>: { title, roles: [<role handle>, ..] }` |
| Defaults for new users | `config/statamic/users.php` | `new_user_roles`, `new_user_groups` |

The paths move via `repositories.file.paths.roles` / `.groups` in
`config/statamic/users.php`. Roles/groups move to the database only when
`repository` is `eloquent` and `tables.roles` / `tables.groups` is a table name;
with `false` (the default) they stay in the YAML files even though users are in
the database.

`super` grants everything. Never add it unless the user asks for a super admin.

## Permission strings

Use Statamic's exact wording; `{x}` is an existing handle. Indentation is the
hierarchy: **a child only works when every parent above it is also granted**,
and nothing works without `access cp`.

```
access cp
configure sites | configure fields | configure form fields | manage preferences
access {site} site                         (multisite only)
configure collections
view {collection} entries
  edit {collection} entries
    create {collection} entries
    delete {collection} entries
    publish {collection} entries
    reorder {collection} entries
    edit other authors {collection} entries
      publish other authors {collection} entries
      delete other authors {collection} entries
configure navs
view {nav} nav
  edit {nav} nav
configure globals
edit {global} globals
configure taxonomies
view {taxonomy} terms
  edit {taxonomy} terms
    create {taxonomy} terms
    delete {taxonomy} terms
configure asset containers
view {container} assets
  upload {container} assets
  edit {container} folders
  edit {container} assets
    move {container} assets
    rename {container} assets
    delete {container} assets
view users
  edit users
    create users
    delete users
    change passwords
    assign user groups
    assign roles
edit user groups
edit roles
impersonate users
configure forms
view {form} form submissions
  delete {form} form submissions
view updates | configure addons
```

Handles come from the project: collections `content/collections/*.yaml`, navs
`content/navigation/*.yaml`, globals `content/globals/*.yaml`, taxonomies
`content/taxonomies/*.yaml`, asset containers `content/assets/*.yaml`, forms
`resources/forms/*.yaml` (honour moved paths, see project-detection).

## Writing

- Mirror the file: quote style (`'access cp'`), order, comments.
- A role "that can do X but not Y": grant X with all its parents; leave Y and
  its children out; mention what the role still cannot do.
- Groups list role handles that exist in `roles.yaml`.
- A commented-out example block may be replaced by the first real entry.
