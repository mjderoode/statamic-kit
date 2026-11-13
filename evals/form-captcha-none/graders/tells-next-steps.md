---
type: llm
---

PASS if Claude's final reply tells the user to install the addon with `composer require aryehraber/statamic-captcha` (unless it says it ran it successfully) and to put the Turnstile site key and secret from the Cloudflare dashboard into `.env` as `CAPTCHA_SITEKEY` and `CAPTCHA_SECRET`.
FAIL if the reply omits how to install the addon or where the keys come from and go, or claims keys it made up.
