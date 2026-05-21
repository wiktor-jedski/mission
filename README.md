# Mission Treasure Hunt

Next.js implementation and documentation for a one-off bachelor party QR quest game.

## Documents

- [Requirements](docs/requirements.md) - product requirements and scope decisions.
- [Implementation Scope](docs/implementation-scope.md) - recommended one-day build order, data model draft, and route draft.
- [Operator Fallback](docs/operator-fallback.md) - minimal laptop-based backup plan for running the game manually.
- [Open Questions](docs/open-questions.md) - unresolved decisions and recommended defaults.

## Phase 3 Boundary

Phase 3 implements the core runtime loop only: Supabase-backed player submissions, admin password login, pending review, approve/reject actions, rejection messages, per-team map progress, 21-approval full-map unlock, and final prize photo access. Deployment work, QR export, hints UI, polling, audit-log UI, manual overrides, pause/resume controls, animations, sound, and visual polish remain out of scope.

## Development

Install dependencies from the repository root:

```bash
npm install
```

Available commands:

- `npm run dev` - start the local Next.js development server.
- `npm run build` - typecheck and build the production app.
- `npm run lint` - run ESLint for Next.js and TypeScript.
- `npm test` - run Vitest unit/integration tests.
- `npm run test:e2e` - run the Playwright smoke test against the local app.
- `npm run coverage` - run Vitest with V8 coverage and enforce 100% statements, branches, and functions for committed application code.

## Environment

Copy `.env.example` to a local `.env` file and replace placeholders with real values:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key.
- `TEAM_PINS` - comma-separated team PIN configuration, for example `team-ember:1111,team-iron:2222`.
- `ADMIN_PASSWORD` - admin password.
- `APP_BASE_URL` - public or local app base URL.

Do not commit `.env` files or real secrets.

When `TEAM_PINS` is absent in local development, the app falls back to `1111` for `team-ember` and `2222` for `team-iron`. When Supabase URL/key are absent in local development and tests, the runtime uses the explicit local fallback repository. Production builds and deployed gameplay must configure Supabase URL/key; missing Supabase runtime persistence fails instead of using process memory.

## Routes

- Player: `/`, `/login`, `/quests/[slug]`, `/submissions`, `/map`, `/logout`.
- Admin: `/admin/login`, `/admin`, `/admin/submissions/[id]`, `/admin/logout`.

## Final Prize Photo

Before the event, provide the final prize photo at `public/final-prize-photo.jpg`. The `/map` page only links to it after the current team reaches 21 approved quests.
