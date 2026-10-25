import type { EngineInterface, On, ToolCallResult } from 'claude-code'
import {
  analyse,
  findProject,
  isInside,
  isYaml,
  looksLikeBlueprint,
  parseTexts,
  relative,
  type Project,
} from './lib/statamic.ts'

// After Claude writes or edits Statamic YAML, parse it with the site's own
// Symfony parser (the one Statamic uses) and check blueprints and fieldsets
// for duplicate handles. Problems go back to Claude as context on the tool
// result; the user sees nothing unless Claude acts on it.

const isStatamicYaml = (project: Project, path: string) =>
  isYaml(path) &&
  [project.blueprints, project.fieldsets, project.forms, `${project.root}/resources`, `${project.root}/content`, `${project.root}/users`].some(
    dir => isInside(path, dir),
  )

export async function checkYaml($: EngineInterface, path: string): Promise<string | undefined> {
  if (!isYaml(path)) return undefined

  const project = await findProject($, path)

  if (!project || !isStatamicYaml(project, path)) return undefined

  const text = await $.fs.read(path)
  const [parsed] = (await parseTexts($, project, [text])) ?? []
  const file = relative(project, path)

  if (!parsed) return undefined

  if (!parsed.ok) {
    return `statamic-kit: \`${file}\` is not valid YAML for Statamic's parser (Symfony YAML): ${parsed.error} Statamic cannot load this file until it is fixed.`
  }

  if (!looksLikeBlueprint(parsed.data)) return undefined

  const { duplicates } = analyse(parsed.data)

  if (duplicates.length === 0) return undefined

  return `statamic-kit: \`${file}\` has duplicate handles, so one silently overrides the other in Statamic:\n${duplicates
    .map(line => `- ${line}`)
    .join('\n')}`
}

const withContext = (result: ToolCallResult, note: string | undefined): ToolCallResult =>
  note === undefined || result.deny !== undefined || result.isError === true
    ? result
    : { ...result, context: [...(result.context ?? []), note] }

export const yamlCheck = (on: On) => {
  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const result = await next(e)

    return withContext(result, await checkYaml($, e.file_path).catch(() => undefined))
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const result = await next(e)

    return withContext(result, await checkYaml($, e.file_path).catch(() => undefined))
  }).catch(($, e, next) => next(e))
}
