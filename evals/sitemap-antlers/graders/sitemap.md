---
type: llm
focus: trace
---

Statamic core has no sitemap and no SEO addon is installed.
PASS if Claude adds a route such as `Route::statamic('sitemap.xml', 'sitemap', ['content_type' => 'xml', 'layout' => null])` in `routes/web.php` (creating the file if needed is fine) and a template that outputs valid sitemap XML (`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`) without the HTML layout, listing routed collections only (pages and news, not the unrouted ones), with `<loc>` from `permalink` (absolute) and `<lastmod>`; the plan or reply names the route line; it may mention SEO Pro as an alternative.
FAIL if the HTML layout would wrap the XML, `loc` is relative, or it lists entries without a route.
