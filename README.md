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
| `npm run db:generate`      | Write a migration for schema changes  |
| `npm run db:migrate`       | Apply pending migrations to `DATABASE_URL` |
| `npm run db:check`         | Validate the migration history        |
| `npm run db:studio`        | Browse the database in Drizzle Studio |

## Database

Postgres on [Neon](https://neon.tech), accessed with [Drizzle ORM](https://orm.drizzle.team). Put `DATABASE_URL` in `.env.local` for local work.

1. Edit tables in `src/db/schema.ts`.
2. Run `npm run db:generate` and commit the new files in `drizzle/` with your PR.
3. When the PR merges to `main`, the **DB migrate** workflow applies the new migrations to production.

The **DB migrations check** workflow runs on every PR and fails if `schema.ts` was changed without a matching migration. It never touches a database.

One-time setup: in GitHub, go to Settings > Environments, create a `production` environment, and add a `DATABASE_URL` secret holding the Neon connection string. To have someone approve each production migration before it runs, add required reviewers to that environment.

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
