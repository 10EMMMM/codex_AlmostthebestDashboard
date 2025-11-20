# Repository Guidelines

This project is a Next.js 15 dashboard that fronts Supabase services and a lightly vendored DaisyUI workspace. Use this guide to orient contributions quickly and keep tooling expectations aligned.

## Project Structure & Module Organization

App Router pages, layouts, and API routes live in `src/app`, with colocated route groups for each surface. Shared UI primitives stay under `src/components/ui`, while feature composites sit alongside domain hooks in `src/components/<feature>` and `src/hooks`. Utilities (`src/lib`), AI helpers (`src/ai`), and middleware are TypeScript-first and rely on the `@/*` alias configured in `tsconfig.json`. Reference material, SQL plans, and CSV templates sit in `docs/`, and `scripts/generate_seeds.py` turns those templates into `docs/generated_seed.sql`. The `00_daisyui` directory retains upstream styling packages; treat it as a separate workspace when updating the theme tokens.

## Build, Test, and Development Commands

- `npm run dev` — launches the Next dev server on http://localhost:3010 with hot reload.
- `npm run build` — produces the production bundle and enforces TypeScript + Tailwind checks.
- `npm run start` — serves the output of the last build; use it when validating deployment artifacts.
- `npm run lint` — runs the `next/core-web-vitals` ESLint preset and must pass before opening a PR.
- `bun test 00_daisyui/packages/daisyui/functions` — executes the Bun-based CSS/utility suite.
- `python scripts/generate_seeds.py` — regenerates SQL fixtures in `docs/generated_seed.sql`.

## Coding Style & Naming Conventions

Keep components typed (`.tsx`) and prefer small hooks for Supabase access. Use two-space indentation, single quotes for strings unless interpolation requires otherwise, and descriptive async handler names (`handleSignInWithGoogle`). Keep files client-aware by adding `"use client"` only where React state is required. Tailwind classes should follow the existing pattern of base → layout → state tokens, while DaisyUI theme tweaks belong in `tailwind.config.ts`.

## Testing Guidelines

There is no Jest/Vitest suite for the dashboard yet, so linting plus Bun tests in `00_daisyui` are the safety net. New logic should ship with at least a component test or hook-level assertion; colocate files as `<name>.test.ts(x)` beside the implementation and invoke them through `bun test path/to/folder`. Snapshot-heavy UI should also include Storybook-like docs under `docs/ui_checklist.md`.

## Commit & Pull Request Guidelines

Recent history favors concise, imperative subjects (`Update request page component`) and merge commits that signal the source branch. Follow that tone, limit to ~72 characters, and include a short body describing Supabase migrations or UI changes. PRs should link Jira/GitHub issues, describe the user-facing impact, call out config changes, and include screenshots or recordings for UI surfaces plus `bun test`/`npm run lint` output.

## Security & Configuration Tips

Use `.env.local` for Supabase keys, OAuth secrets, and the `NORMAL_USER_*` bootstrap variables documented in `README.md`. Never commit credentials or generated SQL; add new secrets to the sample `.env` file instead. Run `curl -X POST http://localhost:3010/api/admin/bootstrap-user` only after regenerating seeds so local auth mirrors `docs/database-v1-plan.sql`, and rotate any leaked keys immediately.
