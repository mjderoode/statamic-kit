import type { EngineInterface, On, ToolCallResult } from 'claude-code'
import {
  analyse,
  basename,
  dirname,
  findProject,
  isInside,
  isTemplate,
  isYaml,
  listFiles,
  normalize,
  parseFiles,
  parseTexts,
  relative,
  type Builder,
  type Project,
} from './lib/statamic.ts'

// Statamic features that need two files, checked after Claude writes one:
//
// - a page-builder set needs a partial named after its handle, in the folder
//   where the builder's other sets keep theirs;
// - a new partial in such a folder needs a set with its name;
// - a form needs its config (`resources/forms/<handle>.yaml`) and its
//   blueprint (`resources/blueprints/forms/<handle>.yaml`).
//
// The folder is learned from the site itself, so a builder whose sets have no
// partials (rendered inline, say) is never flagged. Gaps go back to Claude as
// context on the tool result.

const NOTE = 'statamic-kit'
const IF_NEXT = 'If you are creating it as part of this change, carry on.'

// The folders holding a template for each handle: normalized name → folders.
async function indexTemplates($: EngineInterface, project: Project) {
  const index = new Map<string, Set<string>>()

  for (const path of await listFiles($, project.views, isTemplate)) {
    const name = normalize(basename(path))
    const folders = index.get(name) ?? new Set<string>()

    folders.add(dirname(path))
    index.set(name, folders)
  }

  return index
}

// The folder where most of a builder's existing sets have their partial, if
// at least half of them do.
const partialFolder = (existing: string[], index: Map<string, Set<string>>) => {
  const counts = new Map<string, number>()

  for (const set of existing) {
    for (const folder of index.get(normalize(set)) ?? []) counts.set(folder, (counts.get(folder) ?? 0) + 1)
  }

  const [best] = [...counts].sort((a, b) => b[1] - a[1])

  return best && best[1] >= Math.ceil(existing.length / 2) ? best[0] : undefined
}

async function exampleIn($: EngineInterface, folder: string, sets: string[]) {
  const names = new Set(sets.map(normalize))
  const files = await $.fs.list(folder).catch(() => [])

  return files.find(file => names.has(normalize(file.name)))?.name
}

/** New sets in a blueprint or fieldset whose partial is missing. */
export async function checkSets(
  $: EngineInterface,
  project: Project,
  path: string,
  before: string,
): Promise<string | undefined> {
  const after = await $.fs.read(path)
  const parsed = await parseTexts($, project, [before, after])

  if (!parsed || !parsed[1]?.ok) return undefined

  const old = parsed[0]?.ok ? analyse(parsed[0].data).builders : []
  const builders = analyse(parsed[1].data).builders
  const oldSets = (builder: Builder) => new Set(old.find(o => o.path === builder.path)?.sets ?? [])
  const changed = builders
    .map(builder => ({ builder, added: builder.sets.filter(set => !oldSets(builder).has(set)) }))
    .filter(({ added }) => added.length > 0)

  if (changed.length === 0) return undefined

  const index = await indexTemplates($, project)
  const gaps: string[] = []

  for (const { builder, added } of changed) {
    const existing = builder.sets.filter(set => !added.includes(set))
    const folder = existing.length > 0 ? partialFolder(existing, index) : undefined

    if (!folder) continue

    const missing = added.filter(set => !index.get(normalize(set))?.has(folder))

    if (missing.length === 0) continue

    const example = await exampleIn($, folder, existing)

    gaps.push(
      `- \`${builder.path}\`: ${missing.map(set => `\`${set}\``).join(', ')} ${
        missing.length === 1 ? 'has' : 'have'
      } no partial in \`${relative(project, folder)}/\`${example ? ` (the other sets' partials look like \`${example}\`)` : ''}`,
    )
  }

  return gaps.length === 0
    ? undefined
    : `${NOTE}: new page-builder sets without a template, so they render nothing on the site:\n${gaps.join(
        '\n',
      )}\n${IF_NEXT}`
}

/** A new partial in a set-partials folder with no set of that name. */
export async function checkPartial(
  $: EngineInterface,
  project: Project,
  path: string,
): Promise<string | undefined> {
  const folder = dirname(path)
  const siblings = (await $.fs.list(folder).catch(() => []))
    .filter(file => file.kind === 'file' && isTemplate(file.name) && `${folder}/${file.name}` !== path)
    .map(file => normalize(file.name))

  if (siblings.length < 2) return undefined

  const yamlFiles = [
    ...(await listFiles($, project.blueprints, isYaml, 300)),
    ...(await listFiles($, project.fieldsets, isYaml, 300)),
  ]
  const parsed = (await parseFiles($, project, yamlFiles)) ?? []
  const sets = new Set(
    parsed.flatMap(result => (result.ok ? analyse(result.data).builders.flatMap(b => b.sets.map(normalize)) : [])),
  )
  const matching = siblings.filter(name => sets.has(name)).length

  if (matching < 2 || matching < siblings.length / 2) return undefined

  const name = normalize(basename(path))

  if (sets.has(name)) return undefined

  return `${NOTE}: \`${relative(project, path)}\` sits with the page-builder set partials, but no blueprint or fieldset has a set \`${name}\`, so nothing renders it. ${IF_NEXT}`
}

/** A form config without its blueprint, or the other way round. */
export async function checkForm(
  $: EngineInterface,
  project: Project,
  path: string,
): Promise<string | undefined> {
  const formBlueprints = `${project.blueprints}/forms`
  const name = basename(path)
  const [here, there, missingKind] =
    dirname(path) === project.forms
      ? ['config', `${formBlueprints}/${name}`, 'blueprint']
      : dirname(path) === formBlueprints
        ? ['blueprint', `${project.forms}/${name}`, 'config']
        : []

  if (!there || (await $.fs.exists(there))) return undefined

  return `${NOTE}: form \`${normalize(name)}\` has a ${here} but no ${missingKind}; Statamic needs both (\`${relative(
    project,
    there,
  )}\`). ${IF_NEXT}`
}

async function check($: EngineInterface, path: string, existed: boolean, before: string) {
  const project = await findProject($, path)

  if (!project) return undefined

  if (isYaml(path)) {
    const notes = [
      isInside(path, project.blueprints) || isInside(path, project.fieldsets)
        ? await checkSets($, project, path, before)
        : undefined,
      await checkForm($, project, path),
    ].filter(note => note !== undefined)

    return notes.length > 0 ? notes.join('\n\n') : undefined
  }

  return !existed && isTemplate(path) && isInside(path, project.views)
    ? checkPartial($, project, path)
    : undefined
}

const withContext = (result: ToolCallResult, note: string | undefined): ToolCallResult =>
  note === undefined || result.deny !== undefined || result.isError === true
    ? result
    : { ...result, context: [...(result.context ?? []), note] }

const isRelevant = (path: string) => isYaml(path) || isTemplate(path)

export const pairedFiles = (on: On) => {
  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    if (!isRelevant(e.file_path)) return next(e)

    const existed = await $.fs.exists(e.file_path).catch(() => true)
    const before = existed ? await $.fs.read(e.file_path).catch(() => '') : ''
    const result = await next(e)

    return withContext(result, await check($, e.file_path, existed, before).catch(() => undefined))
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    if (!isRelevant(e.file_path)) return next(e)

    const before = await $.fs.read(e.file_path).catch(() => '')
    const result = await next(e)

    return withContext(result, await check($, e.file_path, true, before).catch(() => undefined))
  }).catch(($, e, next) => next(e))
}
