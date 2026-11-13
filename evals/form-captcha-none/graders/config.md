---
type: llm
focus: { source: file, path: config/captcha.php }
---

This is the config of the `aryehraber/statamic-captcha` addon.
PASS if it selects Turnstile (`'service' => env('CAPTCHA_SERVICE', 'Turnstile')` or `'Turnstile'`), reads `sitekey` and `secret` from env (`CAPTCHA_SITEKEY`, `CAPTCHA_SECRET`) with no real-looking key written in, and lists `contact` in `forms` (or sets `forms` to `'all'`).
FAIL if the file is missing, the service is not Turnstile, keys are hard-coded, or `contact` is not covered by `forms`.
