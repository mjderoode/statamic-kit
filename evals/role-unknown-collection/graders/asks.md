---
type: llm
---

The project has collections `pages` and `blog`; there is no `news` collection (or any other "news" section).
PASS if the reply says there is no news collection/section, names what does exist (at least `blog`, possibly suggesting it is what was meant), and asks before changing the role.
FAIL if it grants permissions on a non-existent `news` handle, or silently picks `blog` and edits the role.
