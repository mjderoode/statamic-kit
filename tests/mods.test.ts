import type { On } from 'claude-code'
import { expect, test, type TestBody } from 'claude-code/testing'

// The hooks here stand for the engine: an in-memory site, and a PHP parser
// stand-in that reads JSON (valid YAML) and fails on anything else, the way
// Symfony's parser reports a parse error.

const ROOT = '/site'

type Files = Record<string, string>

const json = (value: unknown) => JSON.stringify(value, null, 2)

const blueprint = (fields: unknown[]) => json({ title: 'Page', tabs: { main: { sections: [{ fields }] } } })

const builder = (sets: Record<string, unknown>) => ({
  handle: 'page_builder',
  field: { type: 'replicator', sets: { blocks: { display: 'Blocks', sets } } },
})

const set = (fields: unknown[] = []) => ({ display: 'Set', fields })

const field = (handle: string) => ({ handle, field: { type: 'text' } })

const baseFiles = (): Files => ({
  [`${ROOT}/composer.json`]: '{"require": {"statamic/cms": "^6.0"}}',
  [`${ROOT}/vendor/autoload.php`]: '<?php',
})

const children = (files: Files, dir: string) => {
  const names = new Map<string, 'file' | 'dir'>()

  for (const path of Object.keys(files)) {
    if (!path.startsWith(dir + '/')) continue
    const [name, ...rest] = path.slice(dir.length + 1).split('/')

    if (name) names.set(name, rest.length > 0 ? 'dir' : 'file')
  }

  return [...names].map(([name, kind]) => ({ name, kind, size: 0, mtimeMs: 0, isLink: false }))
}

const parse = (text: string | undefined) => {
  if (text === undefined) return { ok: false, error: 'unreadable', line: -1 }
  if (text === '') return { ok: true, data: null }

  try {
    return { ok: true, data: JSON.parse(text) }
  } catch {
    return { ok: false, error: 'Malformed inline YAML string at line 1.', line: 1 }
  }
}

const site = (on: On, files: Files) => {
  on('fs.exists', (_, e) => ({
    value: e.path in files || Object.keys(files).some(path => path.startsWith(e.path + '/')),
  }))
  on('fs.read', (_, e) => {
    const text = files[e.path]

    if (text === undefined) throw new Error(`ENOENT: ${e.path}`)

    return { value: text }
  })
  on('fs.list', (_, e) => ({ value: children(files, e.path) }))
  on('process.run', (_, e) => {
    const texts: (string | undefined)[] =
      e.argv[3] === '--texts' ? JSON.parse(e.init?.stdin ?? '[]') : e.argv.slice(3).map(path => files[path])

    return {
      value: {
        exitCode: 0,
        stdout: JSON.stringify(texts.map(parse)),
        stderr: '',
        isStdoutTruncated: false,
        isStderrTruncated: false,
      },
    }
  })
  on('tool.call', (_, e) => {
    if (e.tool === 'Write') files[e.file_path] = e.content
    if (e.tool === 'Edit') files[e.file_path] = (files[e.file_path] ?? '').replace(e.old_string, e.new_string)

    return { result: {} }
  })
}

const notes = (result: { context?: readonly string[] }) => (result.context ?? []).join('\n')

// --- yaml check ---------------------------------------------------------

test('broken YAML in a blueprint is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/blueprints/collections/pages/page.yaml`,
    content: 'title: [Page',
  })

  expect(notes(result)).toContain('is not valid YAML')
  expect(notes(result)).toContain('resources/blueprints/collections/pages/page.yaml')
})

test('a field handle used in two tabs is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = json({
    tabs: {
      main: { sections: [{ fields: [field('title'), field('intro')] }] },
      seo: { sections: [{ fields: [field('intro')] }] },
    },
  })
  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/resources/blueprints/page.yaml`, content })

  expect(notes(result)).toContain('`intro` appears twice')
})

test('a set handle in two groups is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([
    {
      handle: 'page_builder',
      field: {
        type: 'replicator',
        sets: {
          text: { sets: { quote: set() } },
          media: { sets: { quote: set(), video: set() } },
        },
      },
    },
  ])
  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/resources/fieldsets/builder.yaml`, content })

  expect(notes(result)).toContain('set handle `quote` appears in groups `text` and `media`')
})

test('a duplicate field inside one set is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([builder({ faq: set([field('question'), field('question')]) })])
  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/resources/fieldsets/builder.yaml`, content })

  expect(notes(result)).toContain('`question` appears twice in set `faq` of `page_builder`')
})

test('a valid blueprint gets no note', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([field('title'), field('intro')])
  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/resources/blueprints/page.yaml`, content })

  expect(result.context).toBeUndefined()
})

test('YAML outside a Statamic project is left alone', async ($, on) => {
  const files: Files = { '/app/composer.json': '{"require": {"laravel/framework": "^12.0"}}', '/app/vendor/autoload.php': '' }
  site(on, files)

  const result = await $.tool.call({ tool: 'Write', file_path: '/app/resources/data.yaml', content: 'a: [' })

  expect(result.context).toBeUndefined()
})

test('without the site vendor folder the check stays silent', async ($, on) => {
  const files: Files = { [`${ROOT}/composer.json`]: '{"require": {"statamic/cms": "^6.0"}}' }
  site(on, files)

  const result = await $.tool.call({ tool: 'Write', file_path: `${ROOT}/resources/blueprints/page.yaml`, content: 'a: [' })

  expect(result.context).toBeUndefined()
})

// --- paired files -------------------------------------------------------

const builderSite = (): Files => ({
  ...baseFiles(),
  [`${ROOT}/resources/blueprints/collections/pages/page.yaml`]: blueprint([
    builder({ hero: set([field('heading')]), text: set([field('body')]) }),
  ]),
  [`${ROOT}/resources/views/blocks/_hero.antlers.html`]: '<section>{{ heading }}</section>',
  [`${ROOT}/resources/views/blocks/_text.antlers.html`]: '{{ body }}',
  [`${ROOT}/resources/views/layout.antlers.html`]: '{{ template_content }}',
})

const PAGE = `${ROOT}/resources/blueprints/collections/pages/page.yaml`

const addSet = async ($: Parameters<TestBody>[0], files: Files, handle: string) => {
  const before = files[PAGE] ?? ''
  const after = blueprint([
    builder({ hero: set([field('heading')]), text: set([field('body')]), [handle]: set([field('x')]) }),
  ])

  return $.tool.call({ tool: 'Edit', file_path: PAGE, old_string: before, new_string: after })
}

test('a new set without a partial is reported, with the folder its siblings use', async ($, on) => {
  const files = builderSite()
  site(on, files)

  const result = await addSet($, files, 'faq')

  expect(notes(result)).toContain('`faq` has no partial in `resources/views/blocks/`')
  expect(notes(result)).toContain('_hero.antlers.html')
})

test('a new set whose partial exists gets no note', async ($, on) => {
  const files = builderSite()
  files[`${ROOT}/resources/views/blocks/_faq.antlers.html`] = '{{ x }}'
  site(on, files)

  const result = await addSet($, files, 'faq')

  expect(result.context).toBeUndefined()
})

test('a Blade component named in kebab case counts as the partial', async ($, on) => {
  const files = builderSite()
  files[`${ROOT}/resources/views/blocks/_hero.antlers.html`] = ''
  files[`${ROOT}/resources/views/blocks/call-to-action.blade.php`] = ''
  site(on, files)

  const result = await addSet($, files, 'call_to_action')

  expect(result.context).toBeUndefined()
})

test('a builder whose sets have no partials is never flagged', async ($, on) => {
  const files = builderSite()
  delete files[`${ROOT}/resources/views/blocks/_hero.antlers.html`]
  delete files[`${ROOT}/resources/views/blocks/_text.antlers.html`]
  site(on, files)

  const result = await addSet($, files, 'faq')

  expect(result.context).toBeUndefined()
})

test('a new partial with no set of its name is reported', async ($, on) => {
  const files = builderSite()
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/views/blocks/_gallery.antlers.html`,
    content: '{{ images }}',
  })

  expect(notes(result)).toContain('no blueprint or fieldset has a set `gallery`')
})

test('a new partial for an existing set gets no note', async ($, on) => {
  const files = builderSite()
  delete files[`${ROOT}/resources/views/blocks/_text.antlers.html`]
  files[`${ROOT}/resources/views/blocks/_quote.antlers.html`] = ''
  files[PAGE] = blueprint([builder({ hero: set(), text: set(), quote: set() })])
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/views/blocks/_text.antlers.html`,
    content: '{{ body }}',
  })

  expect(result.context).toBeUndefined()
})

test('a template outside a set folder is left alone', async ($, on) => {
  const files = builderSite()
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/views/errors/404.antlers.html`,
    content: 'Not found',
  })

  expect(result.context).toBeUndefined()
})

test('a form config without its blueprint is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/forms/quote.yaml`,
    content: json({ title: 'Quote', store: true }),
  })

  expect(notes(result)).toContain('form `quote` has a config but no blueprint')
  expect(notes(result)).toContain('resources/blueprints/forms/quote.yaml')
})

test('a form with both files gets no note', async ($, on) => {
  const files = baseFiles()
  files[`${ROOT}/resources/forms/quote.yaml`] = json({ title: 'Quote' })
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/blueprints/forms/quote.yaml`,
    content: json({ tabs: { main: { sections: [{ fields: [field('name')] }] } } }),
  })

  expect(result.context).toBeUndefined()
})

test('custom blueprint paths from config are followed', async ($, on) => {
  const files = baseFiles()
  files[`${ROOT}/config/statamic/system.php`] = "'blueprints_path' => base_path('cms/blueprints'),"
  files[`${ROOT}/config/statamic/forms.php`] = "'forms' => base_path('cms/forms'),"
  site(on, files)

  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/cms/forms/quote.yaml`,
    content: json({ title: 'Quote' }),
  })

  expect(notes(result)).toContain('cms/blueprints/forms/quote.yaml')
})

// --- upload rules (yaml check) ------------------------------------------

const upload = (handle: string, type: 'assets' | 'files', validate: unknown) => ({
  handle,
  field: { type, display: handle, validate },
})

const FORM_BLUEPRINT = `${ROOT}/resources/blueprints/forms/contact.yaml`

// A site with the contact form's config, so only the upload rule can speak.
const formSite = (): Files => ({ ...baseFiles(), [`${ROOT}/resources/forms/contact.yaml`]: json({ title: 'Contact' }) })

test('max: as a size on an assets field is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([field('name'), upload('photos', 'assets', ['image', 'max:5120'])])
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_BLUEPRINT, content })

  expect(notes(result)).toContain('`photos`')
  expect(notes(result)).toContain('max:5120')
  expect(notes(result)).toContain('max_filesize:5120')
})

test('a pipe-separated min: on a files field is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([upload('cv', 'files', 'required|min:100|mimes:pdf')])
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_BLUEPRINT, content })

  expect(notes(result)).toContain('min:100')
  expect(notes(result)).toContain('min_filesize')
})

test('an upload field inside a set is checked too', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = blueprint([builder({ gallery: set([upload('images', 'assets', ['max:2048'])]) })])
  const result = await $.tool.call({ tool: 'Write', file_path: PAGE, content })

  expect(notes(result)).toContain('`page_builder.gallery.images`')
})

test('a small max: on an upload field (a file count) gets no note', async ($, on) => {
  const files = formSite()
  site(on, files)

  const content = blueprint([upload('photos', 'assets', ['max:3', 'max_filesize:5120'])])
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_BLUEPRINT, content })

  expect(result.context).toBeUndefined()
})

test('max: on a text field gets no note', async ($, on) => {
  const files = formSite()
  site(on, files)

  const content = blueprint([{ handle: 'message', field: { type: 'textarea', validate: ['max:5000'] } }])
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_BLUEPRINT, content })

  expect(result.context).toBeUndefined()
})

// --- template check -----------------------------------------------------

const FORM_VIEW = `${ROOT}/resources/views/partials/application-form.blade.php`

test('a hand-written form with a file input and no enctype is reported', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = `<form method="POST" action="{{ route('statamic.forms.submit', 'application') }}">
    @csrf
    <input type="file" name="cv">
</form>`
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_VIEW, content })

  expect(notes(result)).toContain('enctype="multipart/form-data"')
  expect(notes(result)).toContain('resources/views/partials/application-form.blade.php')
})

test('a file input added by Edit to a form without enctype is reported', async ($, on) => {
  const files = baseFiles()
  files[FORM_VIEW] = `<form method="POST" action="/!/forms/application">
    <input type="text" name="name">
</form>`
  site(on, files)

  const result = await $.tool.call({
    tool: 'Edit',
    file_path: FORM_VIEW,
    old_string: '<input type="text" name="name">',
    new_string: '<input type="text" name="name">\n    <input type=file name="cv[]" multiple>',
  })

  expect(notes(result)).toContain('enctype')
})

test('a form with enctype gets no note', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = `<form method="POST" enctype="multipart/form-data" action="/!/forms/application">
    <input type="file" name="cv">
</form>`
  const result = await $.tool.call({ tool: 'Write', file_path: FORM_VIEW, content })

  expect(result.context).toBeUndefined()
})

test('the form tag and forms without a file input get no note', async ($, on) => {
  const files = baseFiles()
  site(on, files)

  const content = `{{ form:create in="contact" }}
    <input type="file" name="photos[]" multiple>
{{ /form:create }}
<s:form:create in="quote"><input type="file" name="plan"></s:form:create>
<form method="GET" action="/search"><input type="search" name="q"></form>`
  const result = await $.tool.call({
    tool: 'Write',
    file_path: `${ROOT}/resources/views/contact.antlers.html`,
    content,
  })

  expect(result.context).toBeUndefined()
})
