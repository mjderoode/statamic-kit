# No-skill baseline — 2026-10-19

Run: `claude plugin eval . --scaffold --allow-tools Bash Write Edit --runs 1 --ablation none -j 4`
(no skill present; Claude Code 2.1.303, default model; cost $1.63). Scores exclude the
`skill-fired` grader, which cannot pass without the skill.

| Case | Score | Failing graders | Observed mistake |
|---|---|---|---|
| inline-antlers-add-faq | 1.00 | — | None: set in the right group, English labels despite the Dutch prompt, comment kept, partial created. |
| fieldset-blade-add-faq | 1.00 | — | None: edited the fieldset, Dutch labels, Blade component. |
| new-collection-vacancies | 1.00 | — | None. |
| extract-seo-fieldset | 1.00 | — | None. |
| new-taxonomy-topics | 1.00 | — | None. |
| eloquent-stops | 0.67 | `no-writes` | Detected the Eloquent driver and did not touch the blueprint, but still **wrote the block partial** — half a feature that renders nothing. |
| no-builder-proposes | 1.00 | — | None: said there is no page builder and proposed one. |
| two-builders-asks | 0.00 | `asks`, `no-writes`, `no-edits` | **Picked `page_builder` on its own** and wrote the set and partial without asking which replicator was meant. |
| no-approval-no-writes | 0.00 | `presents-plan`, `no-writes`, `no-edits` | **Implemented immediately** without presenting a plan or waiting for approval. |
| duplicate-handle | 1.00 | — | None: noticed the existing `hero` set and extended it. |
| trigger-negative-migration | 1.00 | — | n/a (trigger case). |

## What this means for the skill

Claude already writes correct Statamic YAML and follows sibling patterns on these
fixtures. The baseline failures are all **judgement/gating** failures:

1. No plan-then-approve gate before editing blueprints.
2. No "ask when ambiguous" stop when several page builders exist.
3. The Eloquent stop is incomplete: it skips the YAML but still writes a partial.

So the skill's weight belongs in the workflow and gates (SKILL.md and
project-detection), and the content references stay lean: they cover the
pattern-following rules that keep this behaviour reliable on unfamiliar sites,
not general Statamic knowledge Claude already has.
