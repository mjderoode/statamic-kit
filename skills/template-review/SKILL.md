---
name: template-review
description: This skill should be used when the user asks to review or check a Statamic Antlers or Blade template for a page-builder block (set partial or component) or a form — "review the FAQ block's template", "check this partial", "is this component OK?", "review the contact form template", "check the template against the rest of the site", or Dutch phrasing such as "review dit template" or "klopt deze partial?". Not for writing or changing templates (that is the blueprints or forms skill), and not for PHP, CSS, JS, layouts or show/index templates.
---

# Review a Statamic template

The review itself is done by the read-only `statamic-kit:template-reviewer`
agent, in its own context. This skill only hands the work over and relays the
result.

1. **Dispatch the agent.** Call the Agent tool with
   `subagent_type: "statamic-kit:template-reviewer"`. In the prompt, give the
   template path(s) exactly as the user named them (relative to the project
   root) and, if the user named it, the set or form handle. Do not read the
   templates yourself first and do not pre-judge them: the agent finds the
   blueprint, the dispatcher and the siblings.
2. **Relay the report** as the agent returned it — verdict, Must-fix,
   Should-fix, Suggestions, **Bad practice**, What I read — in plain words.
   Keep the **Bad practice** section separate and keep its heading exactly
   `Bad practice` (the user's name for it), even when you rephrase the rest:
   those are weaknesses the template shares with the rest of the site, for a
   site-wide decision.
3. **Change nothing.** Offer to apply fixes; edits go through the `blueprints`
   or `forms` skill's plan-and-approve flow.

If the agent says a named file does not exist, pass that on and offer the
candidates it listed. Do not review another file instead.
