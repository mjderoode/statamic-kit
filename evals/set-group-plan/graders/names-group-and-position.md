---
type: llm
---

The page builder has three set groups: `text` (heading, rich_text, quote), `media` (image, gallery, audio) and `layout` (columns, spacer).
PASS if the reply presents a plan that puts the new video set in the `media` group, names that group explicitly in words, explicitly states the set's position within the group (last, i.e. after `audio`), and asks for approval before writing.
FAIL if the set goes in another group, the group is not named, the position within the group is not stated in words (a YAML fragment alone does not count), or the reply claims to have made changes.
