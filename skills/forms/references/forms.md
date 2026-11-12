# Forms

A form is a config plus a blueprint, and almost always a hand-written template.
Mirror the existing forms.

| Part | Default path | Holds |
|---|---|---|
| Config | `resources/forms/<handle>.yaml` | `title`, `honeypot` (field name), `store` (save submissions), `email:` list |
| Blueprint | `resources/blueprints/forms/<handle>.yaml` | The form's fields, with `validate:` rules |

The forms directory moves via `forms` in `config/statamic/forms.php`.
Submissions are stored under `storage/forms/` — never edit them.

## Email entries

Each item under `email:` sends one mail: `to` (required), optional `from`,
`reply_to` (often `'{{ email }}'`), `subject`, and `html` / `text` (view names) or
`markdown: true`. Copy the shape of existing entries.

Without `html` / `text` Statamic sends a plain list of every field.

## Email templates

- **View names** in `html:` / `text:` use dot notation relative to
  `resources/views`, without extension: `html: emails.contact` →
  `resources/views/emails/contact.antlers.html` (or `.blade.php`). Follow the
  site's existing email views and folder; otherwise use `emails/<form>`, in the
  site's template language. `text:` is a plain-text view.
- **Variables:** every submitted field by handle (augmented: an `assets` field
  is an asset, checkboxes a list), a `fields` list (`display`, `handle`,
  `value`, `fieldtype`, `config`), plus `site_url`, `date`, `now`, `config`,
  `email_config` and global sets.
- **`message` is reserved.** Laravel puts its mail `Message` object in the
  view data as `message`, so `{{ message }}` / `{{ $message }}` never shows a
  field named `message`. Show that field through `fields` — Antlers
  `{{ fields }}{{ if handle == 'message' }}{{ value }}{{ /if }}{{ /fields }}`,
  Blade `collect($fields)->firstWhere('handle', 'message')['value'] ?? ''` —
  or loop over all `fields`. Say why in the plan. Renaming the field is the
  user's call: stored submissions keep the old handle.
- **Markdown mail** (`markdown: true`): the `html:` view must be **Blade**,
  wrapped in `<x-mail::message>` (with `<x-mail::panel>`,
  `<x-mail::button :url="…">`, `<x-mail::table>` as needed). **Do not indent**
  anything inside it: Laravel's Markdown parser renders a line indented four
  spaces or more as a code block. Write every line flush left, even nested
  components.

## Fields

- Put front-end validation in `validate:` (`required`, `email`, `max:…`).
- Optional fields have no `required` rule.

## Templates — update them, don't just mention them

Front-end forms usually list fields by hand. When adding a field, add its input
to every template that renders the form, matching the siblings exactly
(label, `old` value, error output). When creating a form, write a template in the
same style as the existing ones, including the success message, error output
and the honeypot input.

- **Antlers:** `{{ form:create in="<handle>" }} … {{ /form:create }}`, with
  `{{ old:<field> }}`, `{{ error:<field> }}`, `{{ if success }}`.
- **Blade:** follow the project's route — e.g. a `<form method="POST"
  action="{{ route('statamic.forms.submit', '<handle>') }}">` with `@csrf`, errors
  from `$errors->getBag('form.<handle>')`, success from
  `session('form.<handle>.success')`.

## File uploads

**Pick the fieldtype by what happens to the file afterwards:**

| Fieldtype | Use when | What happens |
|---|---|---|
| `files` | The file only has to reach someone by email (a CV, an attachment) | Attached to the email, then **deleted**; a stored submission keeps no file. Held meanwhile on `file_uploads_disk` / `file_uploads_path` (`config/statamic/system.php`, default the private `local` disk) |
| `assets` | The file must be kept and seen in the Control Panel | Stored in an asset container: `container: <handle>` (must exist), optional `folder:` |

When the request does not say whether files are kept, propose `files`.
Personal uploads (CVs, IDs, photos of people) in an `assets` container on a
public disk are reachable by URL: say so in the plan and propose a private
container.

**Count, size and type — never `max:`/`min:` for size.** On upload fields
`max:` and `min:` count *files*, so `max:5120` allows 5120 files and limits
nothing.

| Want | Write |
|---|---|
| One file / up to N | `max_files: 1` / `max_files: N` (field config, not `validate:`) |
| Max size | `max_filesize:<kilobytes>` in `validate:` (5 MB = `max_filesize:5120`) |
| Min size | `min_filesize:<kilobytes>` |
| File types | `mimes:pdf,doc,docx` (or `mimetypes:application/pdf`); images: `image`, optionally `dimensions:…` |

**Email.** Add `attachments: true` to each `email:` entry that should carry
the uploads.

**Template.**

- The form tag (`{{ form:create }}`, `<s:form:create>`) adds
  `enctype="multipart/form-data"` itself once the form has an upload field. A
  hand-written `<form>` (Blade posting to `statamic.forms.submit`) does
  **not**: add `enctype="multipart/form-data"` or the upload never arrives.
- `<input type="file" name="<handle>">` for one file;
  `name="<handle>[]" multiple` for several. Add `accept=` matching the
  allowed types (`.pdf,.doc,.docx`, `image/*`). Label and error output like
  the sibling fields; there is no `old` value for a file.

## Submitting without a page reload

Keep the normal form working without JavaScript (server-rendered errors and
success message stay); the script only improves it. Check how the layout
loads JavaScript (a `{{ vite }}` / `@vite` tag, `resources/js/app.js`) and
whether the site uses Alpine (`package.json`); say in the plan if the layout
loads no script at all.

**Plain AJAX (no Alpine, or the user wants no Precognition):**

- `fetch(form.action, { method: 'POST', body: new FormData(form), headers: {
  'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } })`.
  Post the form's own `action` (the `/!/forms/` prefix is configurable in
  `config/statamic/routes.php`) and `FormData` from the form: it carries
  `_token`, `_params` (both required), the honeypot and any files. Without the
  header Statamic answers with a redirect, not JSON.
- **Success:** status 200, `{ success: true, submission_created, submission,
  redirect }`. A tripped honeypot also returns `success: true` (with
  `submission_created: false`) — show the thank-you message either way.
- **Validation error:** status **400**, `{ error: { <handle>: '<first
  message>' }, errors: ['<all messages>'] }`. **`error` is the per-field
  object, `errors` the flat list** — read field messages from `error`.
  `fetch` does not reject on a 400: branch on `response.status === 400` /
  `response.ok`, and treat other failures (network, 419 expired token, 500)
  as a general error.
- Clear old errors before each submit; put each message where the
  server-rendered error for that field goes, with the same markup.

**Precognition (live validation, site already uses Alpine):**

- Use Statamic's driver on the form tag: `{{ form:create in="<handle>"
  js="alpine_precognition" }}` (Blade: `<s:form:create … js="alpine_precognition">`).
  It builds the Alpine `$form('post', <action>, {…})` object under `form`,
  including the errors of a failed normal submit. Do **not** write your own
  `x-data="… $form(…)"` instead, and plain `js="alpine"` is not Precognition.
- Hand-written inputs: `x-model="form.<handle>"` and
  `@change="form.validate('<handle>')"`; errors from
  `form.invalid('<handle>')` / `form.errors.<handle>`.
- For submit-by-AJAX as well: `js="alpine_precognition:form:<component>"`
  with `@submit.prevent="submit"`, and an `Alpine.data('<component>', data =>
  ({ ...data, submit() { this.form.submit().then(() => this.form.reset()) } }))`.
- Install: `laravel-precognition-alpine` in `package.json`, then
  `import Precognition from 'laravel-precognition-alpine'` and
  `Alpine.plugin(Precognition)` **before** `Alpine.start()`. Tell the user to
  run `npm install` and rebuild assets.

## Spam protection and captchas

Keep the honeypot in every case; a captcha adds to it.

Statamic has no built-in captcha. Use an addon — **never hand-write captcha
verification** (no own listener, middleware or `siteverify` call), and never
create a config file that may already exist in the real project
(`config/services.php`): add to it, or use the addon's own config.

1. **Detect** in `composer.lock` / `composer.json`: `aryehraber/statamic-captcha`
   (reCAPTCHA v2, hCaptcha, Cloudflare Turnstile, ALTCHA) is the common one;
   follow any other captcha addon the site already uses the same way.
2. **Addon installed:** read `config/captcha.php`. A form is verified only
   when its handle is in `forms` (or `forms` is `'all'`) — **add every new
   protected form's handle**, or its captcha is never checked. Copy the
   template markup of a form that already has the captcha.
3. **No addon:** propose `aryehraber/statamic-captcha` in the plan. Steps:
   `composer require aryehraber/statamic-captcha` (run it only when the
   environment can; otherwise tell the user), then `php please vendor:publish
   --tag=captcha-config` or write `config/captcha.php`:
   `'service' => env('CAPTCHA_SERVICE', '<Turnstile|Recaptcha|Hcaptcha|Altcha>')`,
   `'sitekey' => env('CAPTCHA_SITEKEY', '')`,
   `'secret' => env('CAPTCHA_SECRET', '')`, `'forms' => ['<handle>']`.
   Add the env names (empty) to `.env.example` if the site has one. **Never
   invent keys**: tell the user to create them (Cloudflare dashboard for
   Turnstile, Google reCAPTCHA admin, hCaptcha dashboard) and set
   `CAPTCHA_SITEKEY` / `CAPTCHA_SECRET` in `.env`.
4. **Templates:** `{{ captcha:head }}` in the layout's `<head>` (once);
   inside the form tag `{{ captcha }}` plus the error like the other fields:
   Antlers `{{ if error:captcha }}…{{ error:captcha }}…{{ /if }}`; Blade
   `<s:captcha />` / `<s:captcha:head />` and
   `$errors->getBag('form.<handle>')->first('captcha')`. Shared form
   templates: wrap it in `{{ if {captcha:is_enabled form="<handle>"} }}`.
   AJAX submissions carry the token in `FormData` automatically.
