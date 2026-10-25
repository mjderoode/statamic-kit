---
type: llm
---

PASS if the reply reports at least five of these six problems in the FAQ template or its set, each tied to a place in the file (line or quoted code) with a concrete fix:
1. `@foreach ($block['items'] ...)` has no guard for missing/null items;
2. the default 'Veelgestelde vragen' is set both as `default:` in the fieldset and as `?:` in the template;
3. the `<h2>` is styled as a small label (`ui-label`) while the `heading` block uses `<h2>` as a section title, so it adds a false heading to the outline (the `callout` block uses `<p class="ui-label">`);
4. `<summary>` has no focus style, while the site styles focus (`focus-visible:` on the callout link);
5. no FAQPage structured data although the site has an `<x-structured-data>` component / `@stack('structured-data')`;
6. the `faq` set has no `icon:` while every other set has one.
FAIL if fewer than five are reported, or if it reports a problem that is not actually in the files.