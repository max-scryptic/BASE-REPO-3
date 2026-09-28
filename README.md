# base-repo-3

Next.js 16 app starter with [Base UI](https://base-ui.com) as the only UI primitive layer, styled with Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                     | What it does                          |
| -------------------------- | ------------------------------------- |
| `npm run dev`              | Start the dev server                  |
| `npm run build`            | Production build                      |
| `npm run lint`             | ESLint                                |
| `npm run check:em-dashes`  | Fail if any source file has an em dash |

## Layout

```
src/
  app/                  Routes: / , /login , /signup
    globals.css         Theme tokens (light + .dark) and Tailwind setup
  components/
    ui/                 Generic widgets built on @base-ui/react (Button, Card, Field, Input, Label, Separator)
    brand-logo.tsx      App name + placeholder mark
    login-form.tsx      Shared login / signup card
    em-dash-guard.tsx   Dev guard against em dashes in rendered text
  lib/em-dash.ts        Em dash helpers used by the guard and the check script
```

## UI conventions

- **Base UI is the primitive layer.** Widgets in `src/components/ui` wrap `@base-ui/react`. Don't add Radix or another headless library next to it.
- **Feature code imports from `@/components/ui/*`**, never from `@base-ui/react` directly, so a widget can be restyled or swapped in one place.
- **Style with theme tokens** (`bg-background`, `text-muted-foreground`, `border-border`, ...) from `globals.css` rather than raw colours, so light and dark mode keep working.
- **One class helper:** `import { cn } from "cn"`.
- **Composition uses `render`, not `asChild`:** `<Button nativeButton={false} render={<Link href="/login" />}>Login</Button>`.

## Adding widgets

`components.json` is set to the `base-nova` style, so the shadcn CLI installs the Base UI version of each component:

```bash
npx shadcn@latest add dialog select tabs
```

Other UI packs that publish a shadcn-compatible registry can be installed the same way, by namespace or by URL:

```bash
npx shadcn@latest add @<registry>/<item>
npx shadcn@latest add https://example.com/r/<item>.json
```

Before adding from another pack, check that it targets Base UI. A Radix-based item brings `radix-ui` back as a dependency.

To try a different look for the built-in widgets, change `style` in `components.json` to another `base-*` style (for example `base-vega`, `base-maia`, `base-lyra`, `base-mira`) and reinstall them with `npx shadcn@latest add <names> --overwrite`.
