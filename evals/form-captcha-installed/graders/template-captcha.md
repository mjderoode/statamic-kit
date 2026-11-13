---
type: llm
focus: { source: file, path: resources/views/partials/newsletter-form.antlers.html }
---

The site uses the `aryehraber/statamic-captcha` addon: a form template needs `{{ captcha }}` inside the form tag and `{{ if error:captcha }}…{{ /if }}` for its error, like the contact form.
Judge the file as it is now.
PASS if it is a `newsletter` form (`form:create in="newsletter"` or similar) that renders `{{ captcha }}` inside the form tag, shows the `error:captcha` message, and has a honeypot input.
FAIL if `{{ captcha }}` or the captcha error is missing, or there is no honeypot.
