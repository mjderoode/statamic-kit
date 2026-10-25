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
