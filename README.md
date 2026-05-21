# Mission Treasure Hunt

Foundation scaffold and documentation for a one-off bachelor party QR quest game.

## Documents

- [Requirements](docs/requirements.md) - product requirements and scope decisions.
- [Implementation Scope](docs/implementation-scope.md) - recommended one-day build order, data model draft, and route draft.
- [Operator Fallback](docs/operator-fallback.md) - minimal laptop-based backup plan for running the game manually.
- [Open Questions](docs/open-questions.md) - unresolved decisions and recommended defaults.

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
- `TEAM_PINS` - comma-separated team PIN configuration.
- `ADMIN_PASSWORD` - admin password.
- `APP_BASE_URL` - public or local app base URL.

Do not commit `.env` files or real secrets.
