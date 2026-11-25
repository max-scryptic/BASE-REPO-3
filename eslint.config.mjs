import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// U+2014 EM DASH and U+2015 HORIZONTAL BAR, which render identically.
const EM_DASH = "[\\u2014\\u2015]";
const EM_DASH_MESSAGE =
  "Em dashes are not allowed in user-facing text. Use a hyphen, or run the value through stripEmDashes() from @/lib/em-dash.";

// Comments and other code that never renders are untouched; this only covers
// JSX text and the string literals that feed into it.
const EM_DASH_RULES = [
  { selector: `JSXText[value=/${EM_DASH}/]`, message: EM_DASH_MESSAGE },
  { selector: `Literal[value=/${EM_DASH}/]`, message: EM_DASH_MESSAGE },
  {
    selector: `TemplateElement[value.cooked=/${EM_DASH}/]`,
    message: EM_DASH_MESSAGE,
  },
];

// Page titles are pipe-delimited ("Login | Acme Inc."). A colon, or a dash
// with spaces around it, used as a separator is rejected. See pageTitle() in
// src/lib/seo.ts.
const TITLE_BAD_SEPARATOR = "(:(\\s|$)|\\s[-\\u2013\\u2014\\u2015]\\s)";
const TITLE_MESSAGE =
  'Page titles use " | " between segments, never a colon or a dash. Build them with pageTitle() or createMetadata() from @/lib/seo.';
const TITLE_KEYS = "/^(title|absolute|default|template)$/";

const TITLE_RULES = [
  {
    selector: `Property[key.name=${TITLE_KEYS}] Literal[value=/${TITLE_BAD_SEPARATOR}/]`,
    message: TITLE_MESSAGE,
  },
  {
    selector: `Property[key.name=${TITLE_KEYS}] TemplateElement[value.cooked=/${TITLE_BAD_SEPARATOR}/]`,
    message: TITLE_MESSAGE,
  },
];

// A React <title> anywhere is the tab title too.
const JSX_TITLE_RULE = {
  selector: `JSXElement[openingElement.name.name="title"] JSXText[value=/${TITLE_BAD_SEPARATOR}/]`,
  message: TITLE_MESSAGE,
};

// Bing Webmaster Guidelines, at the source level: alt text on images, links
// with a real href and descriptive text, headings with content. Errors rather
// than Next's default warnings. scripts/check-seo.mjs checks the same in the
// built HTML, plus what only shows up there (one <h1>, no heading skips).
const SEARCH_RULES = {
  "jsx-a11y/alt-text": [
    "error",
    { elements: ["img", "area", "input[type=\"image\"]"], img: ["Image"] },
  ],
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": [
    "error",
    { components: ["Link"], specialLink: ["href"], aspects: ["noHref", "invalidHref"] },
  ],
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/html-has-lang": "error",
  "jsx-a11y/img-redundant-alt": "error",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: SEARCH_RULES },
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        ...EM_DASH_RULES,
        JSX_TITLE_RULE,
      ],
    },
  },
  {
    // Where metadata is defined. Scoped so that a toast or dialog `title`
    // elsewhere can still say "Error: ...".
    files: ["src/app/**/*.{ts,tsx}", "src/lib/seo.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...EM_DASH_RULES,
        JSX_TITLE_RULE,
        ...TITLE_RULES,
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
