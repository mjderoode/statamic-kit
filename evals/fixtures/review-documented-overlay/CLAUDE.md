# CLAUDE.md

Statamic 6 site, Antlers templates, flat files.

## Page builder

Pages are built from the `page_builder` replicator in
`resources/blueprints/collections/pages/page.yaml`. `resources/views/page.antlers.html`
loops over it and renders one partial per set from `resources/views/blocks/`,
named after the set handle. Each partial gets the set's fields directly.

## Layout

`resources/views/layout.antlers.html` wraps every page: header, `<main>`,
footer. Section headings inside blocks are `<h2>`; the page title is the only
`<h1>`.
