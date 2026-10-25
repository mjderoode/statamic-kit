# Navigation

A navigation is up to three files. Mirror existing navigations.

| Part | Default path | Holds |
|---|---|---|
| Config | `content/navigation/<handle>.yaml` | `title`, `collections` (which collections' entries can be linked), `max_depth`, optional `root: true`, `select_across_sites` |
| Tree | `content/trees/navigation/<handle>.yaml` (multisite: `content/trees/navigation/<site>/<handle>.yaml`) | `tree:` — the actual links (content; created in the CP) |
| Blueprint | `resources/blueprints/navigation/<handle>.yaml` | Extra fields per nav item (optional; may not exist yet) |

Directories move via `stores.navigation.directory` and `stores.nav-trees.directory`
in `config/statamic/stache.php`.

## Adding a field to nav items

The field goes in the navigation's **blueprint**. If the navigation has no
blueprint yet, create `resources/blueprints/navigation/<handle>.yaml` with the
normal blueprint shape. Never edit the tree — it holds editors' links.

## Creating a navigation

1. Config with `title`, `collections` and `max_depth` as requested
   ("one level deep" = `max_depth: 1`).
2. Optionally an empty tree (`tree: []`) at the tree path; links are added in the CP.
3. A blueprint only if extra fields were asked for.

## Template usage — include it in the summary

- **Antlers:** `{{ nav:<handle> }} … {{ url }} {{ title }} {{ <field> }} … {{ /nav:<handle> }}`;
  `{{ children }}` for nested levels. Use a new field where the loop renders links.
- **Blade:** follow how the project already renders navigation (a view
  component, `Statamic::tag('nav:<handle>')`, …).
