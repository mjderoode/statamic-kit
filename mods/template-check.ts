import type { EngineInterface, On, ToolCallResult } from 'claude-code'
import { findProject, isInside, isTemplate, isYaml, listFiles, relative, type Project } from './lib/statamic.ts'

// After Claude writes or edits a Statamic template, check what the browser
// would silently get wrong:
//
// - a hand-written `<form>` with a file input but no
//   `enctype="multipart/form-data"`: the browser then sends only the file
//   name and the upload never arrives. Statamic's form tag
//   (`{{ form:create }}`, `<s:form:create>`) adds the enctype itself, so it
//   is never flagged;
// - Markdown indented four spaces or more inside `<x-mail::message>`, which
//   Laravel's Markdown parser renders as a code block;
// - `{{ message }}` / `{{ $message }}` in a form's email view, where
//   `message` is Laravel's mail Message object, not the submitted field.
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

const MAIL_MESSAGE = /<x-mail::message\b[^>]*>([\s\S]*?)<\/x-mail::message\s*>/g
const INDENTED = /^( {4,}|\t)\S/

/** Line numbers of lines indented four spaces or more inside a mail message. */
export const indentedMailLines = (text: string): number[] =>
  [...text.matchAll(MAIL_MESSAGE)].flatMap(match => {
    const start = lineOf(text, (match.index ?? 0) + match[0].indexOf('>') + 1)

    return (match[1] ?? '')
      .split('\n')
      .map((line, offset) => (INDENTED.test(line) ? start + offset : 0))
      .filter(line => line > 0)
  })

const MESSAGE_OUTPUT = /\{\{\s*\$?message\s*(\}\}|\|)|\{!!\s*\$message\s*!!\}/

const stripTemplateSuffix = (path: string) => path.replace(/\.(antlers\.html|antlers\.php|blade\.php|html)$/, '')

// The views named by `html:` / `text:` in any form config, as paths without
// their template suffix.
async function emailViews($: EngineInterface, project: Project): Promise<Set<string>> {
  const views = new Set<string>()

  for (const config of await listFiles($, project.forms, isYaml, 200)) {
    const text = await $.fs.read(config).catch(() => '')

    for (const match of text.matchAll(/^\s*(?:html|text):\s*['"]?([\w.\-/]+)/gm)) {
      views.add(`${project.views}/${(match[1] ?? '').replace(/\./g, '/')}`)
    }
  }

  return views
}

export async function checkTemplate($: EngineInterface, path: string): Promise<string | undefined> {
  if (!isTemplate(path)) return undefined

  const project = await findProject($, path)

  if (!project || !isInside(path, project.root)) return undefined

  const text = await $.fs.read(path)
  const file = relative(project, path)
  const notes: string[] = []
  const forms = formsMissingEnctype(text)
  const indented = indentedMailLines(text)

  if (forms.length > 0) {
    notes.push(
      `statamic-kit: \`${file}\` has a <form> with a file input but no \`enctype="multipart/form-data"\` (line ${forms.join(
        ', ',
      )}), so the browser sends only the file name and the upload never reaches Statamic. Add the enctype to the <form> tag, or render the form with Statamic's form tag, which adds it.`,
    )
  }

  if (indented.length > 0) {
    notes.push(
      `statamic-kit: \`${file}\` has lines indented four spaces or more inside <x-mail::message> (line ${indented.join(
        ', ',
      )}); Laravel's Markdown parser renders them as a code block. Write them flush left.`,
    )
  }

  if (MESSAGE_OUTPUT.test(text) && isInside(path, project.views) && (await emailViews($, project)).has(stripTemplateSuffix(path))) {
    notes.push(
      `statamic-kit: \`${file}\` is a form email view and outputs \`message\`, which there is Laravel's mail Message object, not the submitted field. Show the field through the \`fields\` list (its entry with handle \`message\`) instead.`,
    )
  }

  return notes.length > 0 ? notes.join('\n\n') : undefined
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
