---
type: llm
---

Statamic facts: in an email view, `message` is a reserved word — Laravel puts its mail `Message` object in the view data under `message`, so `{{ message }}` (Antlers) or `$message` (Blade) does not output the submitted field. The contact form has a field with the handle `message`. Safe ways to show it: the `fields` loop (`{{ fields }} … {{ value }} … {{ /fields }}`), picking the `message` entry from `fields`, or renaming the field (only with the user's agreement, since stored submissions keep the old handle).
Judge the email view Claude wrote (its Write/Edit content in the transcript) and its final reply.
PASS if the view shows name, email and the message without reading the `message` variable directly (it uses the `fields` loop or picks the value from `fields`), is in the site's template language (Antlers) at the path the `html:` value resolves to, and the reply mentions why `message` needs this. Renaming the field without asking is a FAIL.
FAIL if the view outputs `{{ message }}` / `$message` for the field, or the field was renamed unasked.
