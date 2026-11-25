import type { Metadata, MetadataRoute } from "next"

import { isIndexable, siteConfig } from "@/lib/site"

/*
 * Every public route is registered here once. The entry drives the page's
 * <title>, description, canonical URL, Open Graph and Twitter tags (through
 * createMetadata), its sitemap.xml row, its llms.txt line and its JSON-LD, so
 * those can never disagree with each other.
 *
 * Adding a page: add an entry, then in the page file
 *   export const metadata = createMetadata(pages.pricing)
 * and render <PageJsonLd page={pages.pricing} /> in its body.
 */

type SitemapEntry = MetadataRoute.Sitemap[number]

export type PageEntry = {
  /** Path from the site root, starting with "/". */
  path: string
  /** Page name without the app name, which pageTitle() appends. No colons or dashes as separators. */
  title: string
  /**
   * Shorter page name for the <title> tag, when `title` would push the full
   * title past TITLE_MAX_LENGTH. `title` still feeds og:title, breadcrumbs,
   * JSON-LD and llms.txt, where length is not penalised.
   */
  searchTitle?: string
  /** 120 to 160 characters, written as a direct answer to "what is this page?". */
  description: string
  /** Breadcrumb trail above this page, nearest last. Home is implied. */
  parents?: readonly PageEntry[]
  /**
   * When the page's content last changed, as an ISO date ("2026-10-07").
   * Required for indexable pages: Bing relies on sitemap <lastmod> to decide
   * what to recrawl. Bump it when the visible content changes, never to "now"
   * on every build, which teaches crawlers to ignore it.
   */
  lastModified?: string
  changeFrequency?: SitemapEntry["changeFrequency"]
  priority?: number
  /** Keep out of search results, the sitemap and llms.txt. */
  noIndex?: boolean
  /** Open Graph object type. Articles should also render articleJsonLd. */
  type?: "website" | "article"
  /** Share image path, when this route has its own opengraph-image. */
  image?: string
}

const home = {
  path: "/",
  title: siteConfig.name,
  description: siteConfig.description,
  lastModified: "2026-10-07",
  changeFrequency: "weekly",
  priority: 1,
} satisfies PageEntry

export const pages = {
  home,
  signup: {
    path: "/signup",
    title: "Sign up",
    description: `Create your ${siteConfig.name} account with Google in a few clicks. There is no separate password to set up, and you can start straight away.`,
    lastModified: "2026-11-25",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  login: {
    path: "/login",
    title: "Login",
    description: `Log in to your ${siteConfig.name} account with Google to pick up where you left off. One click with your Google account, no separate password needed.`,
    lastModified: "2026-11-25",
    changeFrequency: "yearly",
    priority: 0.3,
  },
} satisfies Record<string, PageEntry>

export const publicPages: PageEntry[] = Object.values(pages).filter(
  (page: PageEntry) => !page.noIndex,
)

/*
 * Search engine limits, from Bing Webmaster Guidelines and the Site Scan
 * report (Google truncates at roughly the same lengths). Bing flags titles
 * over 70 characters and descriptions outside 25 to 160; 120 is our own
 * floor, so a description is a real answer rather than a label.
 * scripts/check-seo.mjs applies the same numbers to the built HTML.
 */
export const TITLE_MAX_LENGTH = 70
export const TITLE_MIN_LENGTH = 15
export const DESCRIPTION_MIN_LENGTH = 120
export const DESCRIPTION_MAX_LENGTH = 160

// Lowercase words joined by hyphens, no trailing slash, query or fragment.
const PATH_PATTERN = /^\/([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*)?$/

/**
 * Robots directives for a page. The googlebot line lifts Google's default
 * snippet and preview limits so AI Overviews and rich results can quote and
 * show as much of the page as they need.
 */
export function robotsFor(noIndex = false): Metadata["robots"] {
  if (!isIndexable) return { index: false, follow: false }
  if (noIndex) return { index: false, follow: true }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  }
}

/*
 * Page titles (the browser tab, search result headline and og:title) are
 * segments joined by a pipe, most specific first and the app name last:
 *   "Acme Inc."                      the home page
 *   "Login | Acme Inc."              a top-level page
 *   "Invoice 42 | Billing | Acme Inc."
 * Never a colon or a dash as the separator. ESLint rejects authored titles
 * that use one; pageTitle() also rewrites them, for titles that come from
 * data (a CMS post called "Launch: what's new" becomes "Launch | what's new").
 */
export const TITLE_SEPARATOR = " | "

function normalizeTitleSegment(segment: string) {
  return segment
    .replace(/\s*:(?=\s|$)/g, TITLE_SEPARATOR)
    .replace(/\s+[-\u2013\u2014\u2015]\s+/g, TITLE_SEPARATOR)
    .replace(/\s*\|\s*/g, TITLE_SEPARATOR)
    .replace(/\s+/g, " ")
    .trim()
}

/** Joins title segments with the pipe separator, app name last. */
export function pageTitle(...segments: string[]) {
  return [...segments, siteConfig.name]
    .map(normalizeTitleSegment)
    .flatMap((segment) => segment.split(TITLE_SEPARATOR))
    .map((segment) => segment.trim())
    .filter((segment, index, all) => segment && all.indexOf(segment) === index)
    .join(TITLE_SEPARATOR)
}

/**
 * The <title> for a title that comes from data (a post, a product), kept
 * within TITLE_MAX_LENGTH. Takes the same segments as pageTitle(); when the
 * result is too long it drops the section segments between the page name and
 * the app name, then shortens the page name at a word boundary. Registry
 * pages do not need this: an over-long registry title fails the build, and
 * the fix is a `searchTitle` on the entry.
 *
 *   title: { absolute: searchTitle(post.searchTitle ?? post.title, "Blog") }
 */
export function searchTitle(...segments: string[]) {
  const full = pageTitle(...segments)
  if (full.length <= TITLE_MAX_LENGTH) return full

  const withoutSections = pageTitle(segments[0] ?? "")
  if (withoutSections.length <= TITLE_MAX_LENGTH) return withoutSections

  const name = withoutSections.slice(0, -(TITLE_SEPARATOR + siteConfig.name).length)
  const room = TITLE_MAX_LENGTH - TITLE_SEPARATOR.length - siteConfig.name.length
  const cut = name.slice(0, room + 1)
  const shortened = cut
    .slice(0, cut.lastIndexOf(" "))
    .replace(/[\s,;.|]+$/, "")
  return pageTitle(shortened || name.slice(0, room))
}

/** The <title> createMetadata() renders for a registry entry. */
export function registryTitle(page: PageEntry) {
  return pageTitle(page.searchTitle ?? page.title)
}

/*
 * Registry checks, run when this module loads: a page that breaks a search
 * engine rule fails `next build` and `next dev` with a list of what to fix,
 * instead of surfacing weeks later as a Bing Site Scan warning.
 */
function validatePages(entries: Record<string, PageEntry>) {
  const problems: string[] = []
  const seen = {
    path: new Map<string, string>(),
    title: new Map<string, string>(),
    description: new Map<string, string>(),
  }

  for (const [key, page] of Object.entries(entries)) {
    const where = `pages.${key}`
    const title = registryTitle(page)
    const isHome = page.path === "/"
    const length = page.description.length

    if (!PATH_PATTERN.test(page.path)) {
      problems.push(
        `${where}.path "${page.path}" must be lowercase words joined by hyphens, starting with "/" and without a trailing slash.`,
      )
    }
    if (title.length > TITLE_MAX_LENGTH) {
      problems.push(
        `${where}: title "${title}" is ${title.length} characters; the limit is ${TITLE_MAX_LENGTH}. Add a shorter searchTitle.`,
      )
    }
    // The home page is the bare brand name by convention, so it is exempt.
    if (!isHome && title.length < TITLE_MIN_LENGTH) {
      problems.push(
        `${where}: title "${title}" is ${title.length} characters; use at least ${TITLE_MIN_LENGTH} so it says what the page is.`,
      )
    }
    if (length < DESCRIPTION_MIN_LENGTH || length > DESCRIPTION_MAX_LENGTH) {
      problems.push(
        `${where}.description is ${length} characters; it must be ${DESCRIPTION_MIN_LENGTH} to ${DESCRIPTION_MAX_LENGTH}.`,
      )
    }
    if (!page.noIndex) {
      const date = page.lastModified ? new Date(page.lastModified) : undefined
      if (!date || Number.isNaN(date.getTime())) {
        problems.push(
          `${where}.lastModified must be the ISO date the content last changed (sitemap <lastmod>).`,
        )
      } else if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
        problems.push(
          `${where}.lastModified "${page.lastModified}" is in the future.`,
        )
      }
    }

    for (const [field, value] of [
      ["path", page.path],
      ["title", title],
      ["description", page.description],
    ] as const) {
      const other = seen[field].get(value)
      if (other)
        problems.push(
          `${where} has the same ${field} as pages.${other}; each page needs its own.`,
        )
      else seen[field].set(value, key)
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Page registry in src/lib/seo.ts breaks search engine rules:\n  - ${problems.join("\n  - ")}`,
    )
  }
}

validatePages(pages)

const twitterAccounts = siteConfig.twitterHandle
  ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle }
  : {}

/**
 * The default share card, generated by src/app/opengraph-image.tsx. Listed
 * explicitly because a page that sets its own `openGraph` would otherwise drop
 * the inherited image. A route with its own opengraph-image file still wins
 * for og:image; pass its URL as `image` in the registry to match twitter:image.
 */
export const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}: ${siteConfig.description}`,
}

/** Fields every page shares. The root layout spreads this in. */
export const baseOpenGraph = {
  type: "website",
  siteName: siteConfig.name,
  locale: siteConfig.locale,
  images: [shareImage],
} satisfies Metadata["openGraph"]

export const baseTwitter = {
  card: "summary_large_image",
  images: [shareImage],
  ...twitterAccounts,
} satisfies Metadata["twitter"]

/**
 * Builds a page's metadata from its registry entry.
 *
 * Next.js merges metadata shallowly, so a page that sets `openGraph` replaces
 * the root layout's object wholesale. This repeats the shared fields to keep
 * og:site_name, og:locale and twitter:card on every page.
 */
export function createMetadata(page: PageEntry): Metadata {
  const fullTitle = pageTitle(page.title)
  const documentTitle = registryTitle(page)
  const images = page.image
    ? [{ ...shareImage, url: page.image, alt: fullTitle }]
    : [shareImage]

  return {
    // Absolute so the layout's template cannot add a second app name.
    title: { absolute: documentTitle },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      ...baseOpenGraph,
      type: page.type ?? "website",
      title: fullTitle,
      description: page.description,
      url: page.path,
      images,
    },
    twitter: {
      ...baseTwitter,
      title: fullTitle,
      description: page.description,
      images,
    },
    robots: robotsFor(page.noIndex),
  }
}
