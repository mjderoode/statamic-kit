import type { EngineInterface, On } from 'claude-code'
import {
  analyse,
  findProject,
  isInside,
  isYaml,
  looksLikeBlueprint,
  parseTexts,
  relative,
  withContext,
  type Project,
} from './lib/statamic.ts'

// After Claude writes or edits Statamic YAML, parse it with the site's own
// Symfony parser (the one Statamic uses) and check blueprints and fieldsets
// for duplicate handles, and for `max:`/`min:` rules that read like a size on
// upload fields (`assets`, `files`), where Laravel counts files instead.
// Problems go back to Claude as context on the tool result; the user sees
// nothing unless Claude acts on it.

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

  const { duplicates, uploads } = analyse(parsed.data)
  const notes: string[] = []

  if (duplicates.length > 0) {
    notes.push(
      `statamic-kit: \`${file}\` has duplicate handles, so one silently overrides the other in Statamic:\n${duplicates
        .map(line => `- ${line}`)
        .join('\n')}`,
    )
  }

  if (uploads.length > 0) {
    notes.push(
      `statamic-kit: \`${file}\` limits upload fields with \`max:\`/\`min:\`, which count files there, not size, so no size limit applies:\n${uploads
        .map(
          u =>
            `- \`${u.path}\` (${u.type}): \`${u.rule}\` allows ${u.kind === 'max' ? 'up to' : 'at least'} ${u.value} files; for size use \`${u.kind}_filesize:${u.value}\` (kilobytes); for a file count use \`max_files\` in the field config`,
        )
        .join('\n')}`,
    )
  }

  return notes.length > 0 ? notes.join('\n\n') : undefined
}

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
