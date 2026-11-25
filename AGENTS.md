<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SEO and AEO conventions

Search and answer-engine plumbing is already wired up; keep it intact when adding routes. See the "SEO and AEO" section of `README.md` for the full picture.

- **Every public page is registered in `pages` in `src/lib/seo.ts`** with a title, a 120 to 160 character description and a `lastModified` date. That one entry feeds the page's metadata, `sitemap.xml`, `llms.txt` and JSON-LD. The registry is validated when the module loads, so a bad entry fails `next dev` and `next build` with a list of what to fix.
- **Page titles are pipe-delimited, most specific first, app name last:** `Acme Inc.` (home), `Login | Acme Inc.`, `Invoice 42 | Billing | Acme Inc.`. Never a colon or a dash as the separator. `createMetadata()` builds this; anywhere else (`generateMetadata`, `not-found.tsx`) use `title: { absolute: pageTitle("Invoice 42", "Billing") }`, which also rewrites colons and dashes in titles that come from data. ESLint rejects authored titles that break the rule.
- **The full `<title>` is 15 to 70 characters** (the home page, which is the bare brand name, is exempt from the minimum). When a page name is too long, give its registry entry a shorter `searchTitle`; `title` still feeds og:title, breadcrumbs and JSON-LD. For titles from data (posts, products) use `title: { absolute: searchTitle(post.title, "Blog") }`, which drops section segments and then shortens at a word boundary to fit.
- **Page metadata comes from `createMetadata(pages.<key>)`.** Don't hand-write `openGraph` or `twitter` objects in a page: Next.js merges metadata shallowly, so a partial object drops the site name, locale and share image.
- **Render `<PageJsonLd page={pages.<key>} />` in every page body.** Pass extra nodes (`faqJsonLd`, `articleJsonLd`, or a schema-dts typed object) for what the page shows. Only mark up content that is visible on the page.
- **Pages that should not appear in search** (dashboards, settings, anything behind auth) get `noIndex: true` in the registry, not a `Disallow` in `robots.ts`: a blocked URL is never fetched, so its noindex is never seen.
- **Brand facts live in `src/lib/site.ts`** (name, description, colours, social profiles). Don't hard-code the site name or URL anywhere else.
- **One `<h1>` per page and no skipped heading levels** (`<h2>` then `<h4>` fails the build), semantic landmarks (`<main>`, `<nav>`, `<article>`), descriptive link text and an `alt` on every `<img>` (`alt=""` for decorative ones). A card that leads the page uses `<CardTitle as="h1">`.
- **`npm run build` runs `scripts/check-seo.mjs` afterwards** against the prerendered HTML: title and description lengths, one `<h1>`, heading order, `alt`, crawlable links, canonicals, JSON-LD that parses, and a `<lastmod>` on every sitemap entry. Errors fail the build. Fix the page, never loosen the limits to get green. Routes rendered on request have no prerendered HTML, so check those by hand.
- **Before finishing any work that adds or changes a page, run `npm run lint` and `npm run build`** and fix every error they report. No CI runs these, and Vercel skips `claude/*` branches, so this is the only check before merge.
- Write copy answer-first: lead each section with the direct answer in a sentence or two, then the detail. Answer engines quote the first clear statement they find.

# Bing

Bing feeds Copilot and ChatGPT search, and its [Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) are stricter than Google's in a few places. Google Search Console follows the same rules, so meeting Bing's covers both.

- **Permanent redirects are 301, not 308.** Next.js sends 308 for `permanent: true` and `permanentRedirect()`. In `next.config.ts` redirects, write `statusCode: 301` instead of `permanent: true`; in a route handler or proxy, use `NextResponse.redirect(url, 301)`. Use temporary redirects (307) only for moves that really are temporary.
- **Ping IndexNow on every change.** After a deploy that adds, changes or removes public URLs, submit those URLs to IndexNow (`https://api.indexnow.org/indexnow`) with the key in `public/35ac4f283eab7a67e119ecace0423d3c.txt`. Bing recrawls within minutes instead of days. Don't submit preview URLs or unchanged pages.
- **Every sitemap entry has a real `<lastmod>`.** Set `lastModified` on the registry entry to the date the visible content last changed, and bump it when you change that content. Never set it to the build time: a date that moves on every deploy teaches Bing to ignore it.
- **Watch HTML size, but don't chase it.** Bing Site Scan estimates that pages over about 125 KB of HTML may not be fully cached. The build check prints a warning past that size. Only slim a page down if Site Scan actually flags it; a well designed page can reasonably be larger.
- **Content is in the server HTML.** Bing renders less JavaScript than Google. Headings, copy and links must be in the prerendered or server-rendered HTML, not added after hydration. Links are `<a href>` (or `<Link href>`), never click handlers.
- **Crawlers and visitors get the same page.** No branching on the user agent, no text hidden with CSS to be read only by bots, and no instructions aimed at AI models in page content. Bing treats these as cloaking, keyword stuffing or prompt injection, and removes pages for them.
- **Structured data matches what is visible.** Mark up only what a reader can see on the page; markup for anything else gets ignored or penalised.
