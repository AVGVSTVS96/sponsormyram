# sponsormyram

One app behind three brands: sponsormyram, sponsormyssd and sponsormyhdd. The host picks the brand (`lib/brand.ts`); everything else is shared. People list the RAM, SSDs and drives their machine is short on, post the list, and others sponsor items.

## Commands

- `bun dev` runs Convex and Next together.
- `bun run check` before finishing. It runs typegen, type-aware oxlint and oxfmt.
- `bun run fix` rewrites files and deletes prose comments.
- Pushing `main` is the deploy: Vercel's Git build runs `convex deploy`, then `next build`. A change that needs new prod env or Convex data goes live in two steps: set those first (`bunx convex env set --prod`, `vercel env add`), then push. A failed Git build emails Bassim, and a `vercel deploy` next to a push only builds twice.

## Fence

- lefthook runs `bun run check` on every commit. Fix what fails; never `--no-verify`, never loosen `oxlint.config.ts` to pass.
- Read `node_modules/next/dist/docs/` before using Next APIs. This Next is newer than model memory.
- Versions are pinned exact.

## Architecture

- Convex owns all data. Better Auth runs inside Convex (`convex/auth.ts`) with X and GitHub as the only sign-ins, so a handle is proven, never typed. `convex/people.ts` keeps each person's page in step with their accounts; `convex/model.ts` turns the session into a user, and every mutation goes through it.
- A page's `handle` is its path: `/<x handle>`, `/gh/<github login>`, or `/x/<handle>` when an X handle collides with a route. Old paths live in `handles` and redirect.
- Sign-in and the dashboard live on the sponsormyram host only, since session cookies are per host. Public pages render on all three.
- Item kinds, their specs and titles come from one registry, `lib/kinds.ts`. Add a kind there and the picker, titles, stats and cards follow.

| Rule | Enforced by |
| --- | --- |
| No prose comments (SAFETY:/WORKAROUND: only) | `no-comments/no-comments` |
| Parse at the boundary, no `as` or `unknown` leaks | anti-slop + type-aware `typescript/*` |
| Every Convex function validates its args | `convex/require-args-validator` |
| Env is declared in `convex/convex.config.ts`, not read ad hoc | `convex/no-process-env` |
| Types derive from the schema (`Doc<"items">`), not copies | review |

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
