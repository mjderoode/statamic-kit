---
type: llm
focus: trace
---

Judge the files Claude created for the new footer global set.
PASS if all hold: a global set config `content/globals/<handle>.yaml` with a `title`; a blueprint `resources/blueprints/globals/<same handle>.yaml` with a text-like field for the footer text and one for the copyright line; if Claude created a values file it is at `content/globals/default/<same handle>.yaml` (matching the existing `content/globals/default/contact.yaml` layout) and is valid YAML; English labels; the reply shows template usage in Antlers (`{{ <handle>:<field> }}`); the existing `contact` global is untouched.
FAIL if the handles differ between files, the blueprint is not under `resources/blueprints/globals/`, a values file is placed elsewhere, or `contact` was changed.
