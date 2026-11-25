#!/usr/bin/env node
// Post-build search engine check. Runs after `next build` (npm's postbuild
// hook) against the prerendered HTML in .next/server/app, which is exactly
// what Bingbot and Googlebot receive before any JavaScript runs.
//
// It enforces the page-level rules from Bing Webmaster Guidelines and its
// Site Scan report, which Google Search Console largely shares. Errors fail
// the build; warnings are printed and let it through. HTML size is only ever
// a warning: a well designed page can reasonably go over Bing's estimate.
//
// Limits match src/lib/seo.ts (TITLE_MAX_LENGTH and friends). The registry
// check there covers what can be known before rendering; this covers what
// only shows up in the output: headings, images, links, canonicals, JSON-LD
// and the sitemap. Routes that are rendered on request (dynamic segments
// without generateStaticParams) have no prerendered HTML and are not seen.

import { readdir, readFile, stat } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "node-html-parser"

const TITLE_MAX_LENGTH = 70
const TITLE_MIN_LENGTH = 15
const DESCRIPTION_MIN_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 160
// Bing Site Scan's "HTML size is too long" estimate. Advisory only.
const HTML_SIZE_WARNING_BYTES = 125 * 1024
// Bing's guidelines ask for descriptive anchor text.
const GENERIC_LINK_TEXT = new Set([
  "click here",
  "here",
  "link",
  "more",
  "read more",
  "learn more",
  "this",
])

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const appDir = join(repoRoot, ".next", "server", "app")
const publicDir = join(repoRoot, "public")

const errors = []
const warnings = []
const error = (route, message) => errors.push(`${route}: ${message}`)
const warn = (route, message) => warnings.push(`${route}: ${message}`)

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

function routeFor(file, extension) {
  const path = relative(appDir, file).split(sep).join("/").slice(0, -extension.length)
  return path === "index" ? "/" : `/${path}`
}

const text = (node) => node.textContent.replace(/\s+/g, " ").trim()

/** Text a crawler or screen reader would use as the link's name. */
function accessibleName(element) {
  const label = element.getAttribute("aria-label")?.trim()
  if (label) return label
  const images = element
    .querySelectorAll("img")
    .map((img) => img.getAttribute("alt")?.trim())
    .filter(Boolean)
  return [text(element), ...images].join(" ").trim()
}

// Collect the build output.
try {
  await stat(appDir)
} catch {
  console.error("No build output in .next/server/app. Run `next build` first.")
  process.exit(1)
}

const pages = new Map()
const knownRoutes = new Set(["/favicon.ico"])

for await (const file of walk(appDir)) {
  if (file.endsWith(".html")) {
    const route = routeFor(file, ".html")
    if (route === "/_global-error") continue
    const html = await readFile(file, "utf8")
    pages.set(route, { html, bytes: Buffer.byteLength(html) })
    if (route !== "/_not-found") knownRoutes.add(route)
  } else if (file.endsWith(".body")) {
    knownRoutes.add(routeFor(file, ".body"))
  }
}
for await (const file of walk(publicDir)) {
  knownRoutes.add(`/${relative(publicDir, file).split(sep).join("/")}`)
}

// Per-page checks.
const indexable = new Map()
const firstSeen = { title: new Map(), description: new Map() }
let siteIsNoIndex = true

for (const [route, { html, bytes }] of pages) {
  const isNotFound = route === "/_not-found"
  const root = parse(html, { comment: false })
  const head = root.querySelector("head")

  const robots = (head?.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "").toLowerCase()
  const noIndex = robots.includes("noindex")
  if (!robots.includes("nofollow")) siteIsNoIndex = false

  if (!root.querySelector("html")?.getAttribute("lang")) {
    error(route, '<html> has no lang attribute.')
  }

  // Title.
  const titles = head?.querySelectorAll("title") ?? []
  const title = titles[0] ? text(titles[0]) : ""
  if (titles.length !== 1) error(route, `has ${titles.length} <title> tags; it needs exactly one.`)
  if (title.length > TITLE_MAX_LENGTH) {
    error(route, `title "${title}" is ${title.length} characters; the limit is ${TITLE_MAX_LENGTH}. Add a searchTitle, or build it with searchTitle().`)
  }
  // The home page is the bare brand name by convention.
  if (route !== "/" && title && title.length < TITLE_MIN_LENGTH) {
    error(route, `title "${title}" is ${title.length} characters; use at least ${TITLE_MIN_LENGTH}.`)
  }

  // Meta description.
  const descriptions = head?.querySelectorAll('meta[name="description"]') ?? []
  const description = descriptions[0]?.getAttribute("content")?.trim() ?? ""
  if (descriptions.length !== 1) {
    error(route, `has ${descriptions.length} meta descriptions; it needs exactly one.`)
  } else if (description.length < DESCRIPTION_MIN_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
    error(route, `meta description is ${description.length} characters; it must be ${DESCRIPTION_MIN_LENGTH} to ${DESCRIPTION_MAX_LENGTH}.`)
  }

  // Canonical.
  const canonicals = head?.querySelectorAll('link[rel="canonical"]') ?? []
  const canonical = canonicals[0]?.getAttribute("href") ?? ""
  if (canonicals.length > 1) error(route, `has ${canonicals.length} canonical links; Bing ignores conflicting ones.`)
  if (canonical && !/^https?:\/\//.test(canonical)) error(route, `canonical "${canonical}" is not an absolute URL.`)
  if (!noIndex && !isNotFound) {
    if (!canonical) error(route, "has no canonical link.")
    else if (new URL(canonical).pathname.replace(/\/$/, "") !== route.replace(/\/$/, "")) {
      error(route, `canonical points at ${canonical}, not this page. Canonicalised duplicates belong under noIndex or a redirect.`)
    }
  }

  // Headings: one non-empty <h1>, then no skipped levels (h2 straight to h4).
  const body = root.querySelector("body")
  const headings = body?.querySelectorAll("h1, h2, h3, h4, h5, h6") ?? []
  const h1s = headings.filter((h) => h.tagName === "H1")
  if (h1s.length !== 1) error(route, `has ${h1s.length} <h1> elements; it needs exactly one.`)
  let previous = 0
  for (const heading of headings) {
    const level = Number(heading.tagName[1])
    const label = text(heading)
    if (!label) error(route, `<${heading.tagName.toLowerCase()}> is empty.`)
    if (previous === 0 && level !== 1) {
      error(route, `the first heading is <h${level}> "${label}"; start the outline with the <h1>.`)
    } else if (level > previous + 1 && previous !== 0) {
      error(route, `heading level skips from <h${previous}> to <h${level}> at "${label}".`)
    }
    previous = level
  }

  // Images.
  for (const img of body?.querySelectorAll("img") ?? []) {
    if (!img.hasAttribute("alt")) {
      error(route, `<img src="${img.getAttribute("src")}"> has no alt attribute. Describe it, or use alt="" if it is decorative.`)
    }
  }

  // Links: crawlable href, descriptive text, internal targets that exist.
  for (const link of body?.querySelectorAll("a") ?? []) {
    const href = link.getAttribute("href")?.trim()
    const name = accessibleName(link)
    if (!href || href === "#" || href.startsWith("javascript:")) {
      error(route, `link "${name}" has no crawlable href. Crawlers only follow <a href="...">.`)
      continue
    }
    if (!name) error(route, `link to ${href} has no text or aria-label.`)
    else if (GENERIC_LINK_TEXT.has(name.toLowerCase())) {
      warn(route, `link text "${name}" (to ${href}) does not say where it goes.`)
    }
    if (href.startsWith("/") && !href.startsWith("//")) {
      const path = href.split(/[?#]/)[0].replace(/(.)\/$/, "$1")
      if (!knownRoutes.has(path)) warn(route, `links to ${path}, which the build did not produce (broken link, or a route rendered on request).`)
    }
  }

  // JSON-LD must parse, or Bing ignores it.
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      JSON.parse(script.rawText)
    } catch (cause) {
      error(route, `JSON-LD does not parse: ${cause.message}`)
    }
  }

  if (bytes > HTML_SIZE_WARNING_BYTES) {
    warn(route, `HTML is ${Math.round(bytes / 1024)} KB, over Bing's ${HTML_SIZE_WARNING_BYTES / 1024} KB estimate. Fine if the page needs it; check Site Scan.`)
  }

  if (!noIndex && !isNotFound) {
    indexable.set(route, canonical)
    for (const [field, value] of [["title", title], ["description", description]]) {
      const other = firstSeen[field].get(value)
      if (value && other) error(route, `has the same ${field} as ${other}.`)
      else firstSeen[field].set(value, route)
    }
  }
}

// Sitemap: every entry has <lastmod>, is a real page, and is that page's
// canonical; every indexable page is listed.
const sitemapFile = join(appDir, "sitemap.xml.body")
let sitemap = ""
try {
  sitemap = await readFile(sitemapFile, "utf8")
} catch {
  error("/sitemap.xml", "was not generated.")
}
if (sitemap) {
  const listed = new Set()
  for (const [, entry] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1]
    if (!loc) {
      error("/sitemap.xml", "has a <url> without <loc>.")
      continue
    }
    const path = new URL(loc).pathname.replace(/(.)\/$/, "$1")
    listed.add(path)
    if (!/<lastmod>[^<]+<\/lastmod>/.test(entry)) {
      error("/sitemap.xml", `${loc} has no <lastmod>; set lastModified on its registry entry.`)
    }
    if (!pages.has(path)) {
      warn("/sitemap.xml", `${loc} has no prerendered page to check.`)
    } else if (!siteIsNoIndex && !indexable.has(path)) {
      error("/sitemap.xml", `${loc} is noindex; only list pages that should be indexed.`)
    } else if (indexable.get(path) && new URL(indexable.get(path)).href !== new URL(loc).href) {
      error("/sitemap.xml", `${loc} differs from that page's canonical ${indexable.get(path)}.`)
    }
  }
  for (const route of indexable.keys()) {
    if (!listed.has(route)) warn(route, "is indexable but missing from sitemap.xml.")
  }
}

for (const message of warnings) console.warn(`warning  ${message}`)
for (const message of errors) console.error(`error    ${message}`)

if (errors.length > 0) {
  console.error(`\nSEO check failed: ${errors.length} error(s), ${warnings.length} warning(s) across ${pages.size} prerendered pages.`)
  console.error("Rules and the reasons for them: the SEO and Bing sections of AGENTS.md.")
  process.exit(1)
}

console.log(`SEO check passed for ${pages.size} prerendered pages (${warnings.length} warning(s)).`)
