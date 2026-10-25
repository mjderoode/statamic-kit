import type { EngineInterface } from 'claude-code'

// Shared helpers for the statamic-kit mods: find the Statamic project a file
// belongs to, read its configured paths, parse YAML with the site's own
// Symfony parser, and walk blueprint structure.

export type Project = {
  root: string
  blueprints: string
  fieldsets: string
  forms: string
  views: string
}

export type ParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string; line: number }

export type Builder = { path: string; sets: string[] }

const TEMPLATE = /\.(antlers\.html|antlers\.php|blade\.php|html)$/

export const isYaml = (path: string) => /\.ya?ml$/i.test(path)
export const isTemplate = (path: string) => TEMPLATE.test(path)

export const dirname = (path: string) => path.slice(0, path.lastIndexOf('/')) || '/'
export const basename = (path: string) => path.slice(path.lastIndexOf('/') + 1)

export const isInside = (path: string, dir: string) => path.startsWith(dir + '/')

export const relative = (project: Project, path: string) =>
  isInside(path, project.root) ? path.slice(project.root.length + 1) : path

// `_hero.antlers.html`, `hero-banner.blade.php` and the handle `hero_banner`
// all compare as `hero_banner`.
export const normalize = (name: string) =>
  name.replace(TEMPLATE, '').replace(/\.ya?ml$/i, '').replace(/^_/, '').replace(/-/g, '_').toLowerCase()

/**
 * The Statamic project holding `file`: the nearest folder above it with a
 * composer.json that requires statamic/cms. Undefined outside one.
 */
export async function findProject($: EngineInterface, file: string): Promise<Project | undefined> {
  let dir = dirname(file)

  for (let depth = 0; depth < 12 && dir !== '/' && dir !== ''; depth++) {
    const composer = `${dir}/composer.json`

    if (await $.fs.exists(composer)) {
      const text = await $.fs.read(composer).catch(() => '')

      return text.includes('"statamic/cms"') ? readPaths($, dir) : undefined
    }
    dir = dirname(dir)
  }

  return undefined
}

// `'blueprints_path' => resource_path('blueprints')` or `base_path('cms/x')`.
const configuredPath = (config: string, key: string, root: string, fallback: string) => {
  const match = config.match(
    new RegExp(`'${key}'\\s*=>\\s*(resource_path|base_path)\\(\\s*'([^']*)'\\s*\\)`),
  )

  if (!match) return `${root}/${fallback}`

  return match[1] === 'resource_path' ? `${root}/resources/${match[2]}` : `${root}/${match[2]}`
}

async function readPaths($: EngineInterface, root: string): Promise<Project> {
  const system = await $.fs.read(`${root}/config/statamic/system.php`).catch(() => '')
  const forms = await $.fs.read(`${root}/config/statamic/forms.php`).catch(() => '')

  return {
    root,
    blueprints: configuredPath(system, 'blueprints_path', root, 'resources/blueprints'),
    fieldsets: configuredPath(system, 'fieldsets_path', root, 'resources/fieldsets'),
    forms: configuredPath(forms, 'forms', root, 'resources/forms'),
    views: `${root}/resources/views`,
  }
}

/**
 * Parses each text with the site's own Symfony YAML parser. Undefined when
 * PHP or the site's vendor folder is not available: the caller then stays
 * silent rather than guess.
 */
export async function parseTexts(
  $: EngineInterface,
  project: Project,
  texts: string[],
): Promise<ParseResult[] | undefined> {
  return runParser($, project, ['--texts'], JSON.stringify(texts))
}

export async function parseFiles(
  $: EngineInterface,
  project: Project,
  files: string[],
): Promise<ParseResult[] | undefined> {
  return files.length === 0 ? [] : runParser($, project, files)
}

async function runParser(
  $: EngineInterface,
  project: Project,
  args: string[],
  stdin?: string,
): Promise<ParseResult[] | undefined> {
  const autoload = `${project.root}/vendor/autoload.php`

  if (!(await $.fs.exists(autoload))) return undefined

  const helper = `${$.plugin.root}/mods/lib/yaml-parse.php`
  const ran = await $.process
    .run(['php', helper, autoload, ...args], { cwd: project.root, stdin, timeoutMs: 15000 })
    .catch(() => undefined)

  if (!ran || ran.exitCode !== 0) {
    $.ui.log(`statamic-kit: YAML parser unavailable (${ran?.stderr.slice(0, 200) ?? 'php did not start'})`, {
      to: 'debug',
    })

    return undefined
  }

  try {
    return JSON.parse(ran.stdout) as ParseResult[]
  } catch {
    return undefined
  }
}

/** Every file below `dir` (no vendor/node_modules), capped. */
export async function listFiles(
  $: EngineInterface,
  dir: string,
  keep: (path: string) => boolean,
  limit = 3000,
): Promise<string[]> {
  const found: string[] = []

  await walkFiles($, dir, 0, keep, limit, found)

  return found
}

async function walkFiles(
  $: EngineInterface,
  current: string,
  depth: number,
  keep: (path: string) => boolean,
  limit: number,
  found: string[],
): Promise<void> {
  if (depth > 8 || found.length >= limit) return

  const entries = await $.fs.list(current).catch(() => [])

  for (const entry of entries) {
    const path = `${current}/${entry.name}`

    if (entry.kind === 'dir') {
      if (entry.name !== 'node_modules' && entry.name !== 'vendor') {
        await walkFiles($, path, depth + 1, keep, limit, found)
      }
    } else if (keep(path) && found.length < limit) {
      found.push(path)
    }
  }
}

// PHP's json_encode writes an empty map as `[]`, so lists and maps are both
// read through this.
const values = (x: unknown): unknown[] =>
  Array.isArray(x) ? x : x !== null && typeof x === 'object' ? Object.values(x) : []

const entries = (x: unknown): [string, unknown][] =>
  x !== null && typeof x === 'object' && !Array.isArray(x) ? Object.entries(x) : []

const record = (x: unknown): Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {}

/** True for parsed YAML shaped like a blueprint or fieldset. */
export const looksLikeBlueprint = (data: unknown) => {
  const root = record(data)

  return 'tabs' in root || 'sections' in root || Array.isArray(root.fields)
}

// The top-level field lists: a fieldset's `fields`, or every section's
// `fields` under `tabs` (Statamic 4+) or `sections` (older blueprints).
const topLevelFields = (data: unknown): unknown[] => {
  const root = record(data)
  const sectionsOf = (x: unknown) => values(x).flatMap(section => values(record(section).fields))

  return [
    ...values(root.fields),
    ...values(root.tabs).flatMap(tab => sectionsOf(record(tab).sections)),
    ...sectionsOf(root.sections),
  ]
}

// A replicator's or Bard's `sets`: grouped (Statamic 4+: group → sets) or flat.
const setsOf = (sets: unknown): { group?: string; handle: string; fields: unknown[] }[] => {
  const list = entries(sets)
  const isGrouped = list.length > 0 && list.every(([, value]) => 'sets' in record(value))

  return isGrouped
    ? list.flatMap(([group, value]) =>
        entries(record(value).sets).map(([handle, set]) => ({ group, handle, fields: values(record(set).fields) })),
      )
    : list.map(([handle, set]) => ({ handle, fields: values(record(set).fields) }))
}

/**
 * Duplicate field handles (per scope: the whole blueprint, a set, a grid)
 * and duplicate set handles across a builder's groups, plus every builder
 * (replicator or Bard with sets) and its set handles.
 */
export const analyse = (data: unknown): { duplicates: string[]; builders: Builder[] } => {
  const duplicates: string[] = []
  const builders: Builder[] = []

  const scope = (items: unknown[], where: string, path: string) => {
    const seen = new Set<string>()

    for (const item of items) {
      const handle = record(item).handle

      if (typeof handle !== 'string') continue
      if (seen.has(handle)) duplicates.push(`field handle \`${handle}\` appears twice in ${where}`)
      seen.add(handle)

      const field = record(record(item).field)
      const here = path ? `${path}.${handle}` : handle

      if (Array.isArray(field.fields) || entries(field.fields).length > 0) {
        scope(values(field.fields), `\`${here}\``, here)
      }

      if ('sets' in field) {
        const sets = setsOf(field.sets)
        const groups = new Map<string, string | undefined>()

        for (const set of sets) {
          if (groups.has(set.handle)) {
            duplicates.push(
              `set handle \`${set.handle}\` appears in groups \`${groups.get(set.handle)}\` and \`${set.group}\` of \`${here}\``,
            )
          }
          groups.set(set.handle, set.group)
          scope(set.fields, `set \`${set.handle}\` of \`${here}\``, `${here}.${set.handle}`)
        }
        builders.push({ path: here, sets: [...groups.keys()] })
      }
    }
  }

  scope(topLevelFields(data), 'the top-level fields', '')

  return { duplicates, builders }
}
