<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SEO and AEO conventions

Search and answer-engine plumbing is already wired up; keep it intact when adding routes. See the "SEO and AEO" section of `README.md` for the full picture.

- **Every public page is registered in `pages` in `src/lib/seo.ts`** with a title and a 120 to 160 character description. That one entry feeds the page's metadata, `sitemap.xml`, `llms.txt` and JSON-LD.
- **Page metadata comes from `createMetadata(pages.<key>)`.** Don't hand-write `openGraph` or `twitter` objects in a page: Next.js merges metadata shallowly, so a partial object drops the site name, locale and share image.
- **Render `<PageJsonLd page={pages.<key>} />` in every page body.** Pass extra nodes (`faqJsonLd`, `articleJsonLd`, or a schema-dts typed object) for what the page shows. Only mark up content that is visible on the page.
- **Pages that should not appear in search** (dashboards, settings, anything behind auth) get `noIndex: true` in the registry, not a `Disallow` in `robots.ts`: a blocked URL is never fetched, so its noindex is never seen.
- **Brand facts live in `src/lib/site.ts`** (name, description, colours, social profiles). Don't hard-code the site name or URL anywhere else.
- **One `<h1>` per page**, semantic landmarks (`<main>`, `<nav>`, `<article>`), descriptive link text and `alt` on every meaningful image.
- Write copy answer-first: lead each section with the direct answer in a sentence or two, then the detail. Answer engines quote the first clear statement they find.
