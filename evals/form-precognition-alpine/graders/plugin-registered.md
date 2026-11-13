---
type: llm
focus: { source: file, path: resources/js/app.js }
---

Precognition on Alpine needs the `laravel-precognition-alpine` plugin registered with `Alpine.plugin(...)` before `Alpine.start()`.
Judge the file as it is now.
PASS if the file imports `laravel-precognition-alpine` and calls `Alpine.plugin(...)` with it before `Alpine.start()`.
FAIL if the plugin is not imported, not registered, or registered after `Alpine.start()`.
