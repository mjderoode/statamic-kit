---
type: llm
---

Statamic facts: with `markdown: true` on an email entry, its `html:` key names a **Blade** view (dot notation, relative to `resources/views`, no extension) that wraps the content in `<x-mail::message>` and may use `<x-mail::panel>`. Laravel's Markdown parser renders any line indented four spaces or more as a code block, so the Markdown inside the components must not be indented. Submitted values are available as variables (`$name`, `$email`, `$motivation`).
Judge the email view Claude wrote (its Write/Edit content in the transcript).
PASS if all hold: the view is a `.blade.php` file at the path the `html:` value resolves to; it uses `<x-mail::message>` and an `<x-mail::panel>` with the motivation; it shows the name and email; and no Markdown content line inside the components is indented by four or more spaces.
FAIL if the view is Antlers, the path does not match the `html:` value, the components are missing, or content lines are indented (as is usual in HTML/Blade) so they would render as code.
