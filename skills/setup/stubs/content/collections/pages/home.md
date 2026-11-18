---
title: '__PROJECT_NAME__'
id: __HOME_ID__
blueprint: page
page_builder:
  -
    id: block-hero
    type: hero
    enabled: true
    heading: '__PROJECT_NAME__'
    intro: |
      <p>Replace this from the control panel. Every section on this page is a set in the page builder, so nothing here needs a developer.</p>
    cta_label: 'Get in touch'
    cta_url: /
  -
    id: block-intro
    type: rich_text
    enabled: true
    content: |
      <h2>What this is</h2>
      <p>A starting point. Add sections in the CP, or add a set to the page blueprint and a matching partial in <code>resources/views/blocks/</code> when you need a shape that does not exist yet.</p>
  -
    id: block-cta
    type: cta_panels
    enabled: false
    panels:
      -
        id: panel-1
        title: 'Get in touch'
        body: 'Switched off by default. Enable it here when the page needs it.'
        style: deep
---
