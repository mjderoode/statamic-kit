import type { EngineInterface, On, ToolCallResult } from 'claude-code'
import { findProject, isInside, isTemplate, relative } from './lib/statamic.ts'

// After Claude writes or edits a Statamic template, check what the browser
// would silently get wrong:
//
// - a hand-written `<form>` with a file input but no
//   `enctype="multipart/form-data"`: the browser then sends only the file
//   name and the upload never arrives. Statamic's form tag
//   (`{{ form:create }}`, `<s:form:create>`) adds the enctype itself, so it
//   is never flagged.
//
// Problems go back to Claude as context on the tool result.

const FORM = /<form\b([^>]*)>([\s\S]*?)(?:<\/form\s*>|$)/gi
const FILE_INPUT = /<input\b[^>]*\btype\s*=\s*["']?file\b/i
const ENCTYPE = /\benctype\s*=/i

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length

/** Line numbers of hand-written forms with a file input and no enctype. */
export const formsMissingEnctype = (text: string): number[] =>
  [...text.matchAll(FORM)]
    .filter(([, attributes = '', body = '']) => FILE_INPUT.test(body) && !ENCTYPE.test(attributes))
    .map(match => lineOf(text, match.index ?? 0))

export async function checkTemplate($: EngineInterface, path: string): Promise<string | undefined> {
  if (!isTemplate(path)) return undefined

  const project = await findProject($, path)

  if (!project || !isInside(path, project.root)) return undefined

  const lines = formsMissingEnctype(await $.fs.read(path))

  if (lines.length === 0) return undefined

  return `statamic-kit: \`${relative(project, path)}\` has a <form> with a file input but no \`enctype="multipart/form-data"\` (line ${lines.join(
    ', ',
  )}), so the browser sends only the file name and the upload never reaches Statamic. Add the enctype to the <form> tag, or render the form with Statamic's form tag, which adds it.`
}

const withContext = (result: ToolCallResult, note: string | undefined): ToolCallResult =>
  note === undefined || result.deny !== undefined || result.isError === true
    ? result
    : { ...result, context: [...(result.context ?? []), note] }

export const templateCheck = (on: On) => {
  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const result = await next(e)

    return withContext(result, await checkTemplate($, e.file_path).catch(() => undefined))
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const result = await next(e)

    return withContext(result, await checkTemplate($, e.file_path).catch(() => undefined))
  }).catch(($, e, next) => next(e))
}
