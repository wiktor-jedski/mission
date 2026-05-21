# Mission Treasure Hunt

Next.js implementation and documentation for a one-off bachelor party QR quest game.

## Documents

- [Requirements](docs/requirements.md) - product requirements and scope decisions.
- [Implementation Scope](docs/implementation-scope.md) - recommended one-day build order, data model draft, and route draft.
- [Operator Fallback](docs/operator-fallback.md) - minimal laptop-based backup plan for running the game manually.
- [Open Questions](docs/open-questions.md) - unresolved decisions and recommended defaults.

## Phase 3 Boundary

Phase 3 implements the core runtime loop only: Supabase-backed player submissions, admin password login, pending review, approve/reject actions, rejection messages, per-team map progress, 16-approval full-map unlock, and final prize photo access. Deployment work, QR export, hints UI, polling, audit-log UI, manual overrides, pause/resume controls, animations, sound, and visual polish remain out of scope.

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
- `APP_BASE_URL=https://your-game.vercel.app npm run export:quest-urls` - export the 21 quest URLs as CSV for QR generation.

## Environment

Copy `.env.example` to a local `.env` file and replace placeholders with real values:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key.
- `TEAM_PINS` - comma-separated team PIN configuration, for example `team-ember:1111,team-iron:2222`.
- `ADMIN_PASSWORD` - admin password.
- `APP_BASE_URL` - public or local app base URL.

Do not commit `.env` files or real secrets.

When `TEAM_PINS` is absent in local development, the app falls back to `1111` for `team-ember` and `2222` for `team-iron`. When Supabase URL/key are absent in local development and tests, the runtime uses the explicit local fallback repository. Production builds and deployed gameplay must configure Supabase URL/key; missing Supabase runtime persistence fails instead of using process memory.

## Phase 4 Boundary

Phase 4 covers MVP deployment readiness only: public HTTPS deployment, production Supabase configuration, final URL stability, quest URL export for QR generation, production smoke checks on iPhone/Android/admin laptop, local fallback assets, and quality gates. Hints, polling, audit-log UI, manual overrides, pause/resume, animation, sound, and dedicated visual polish remain out of scope.

## Deployment

Follow this guide to deploy the application for the live event.

### 1. Supabase Database Setup

1. **Create a Supabase Project:**
   - Sign up/in at [Supabase](https://supabase.com/).
   - Click **New Project**, select an organization, enter a project name (e.g., `mission-treasure-hunt`), and set a secure database password.
   - Choose a region close to your players' expected location to minimize latency.

2. **Execute Database Migrations:**
   - Go to your Supabase Dashboard and select your project.
   - Open the **SQL Editor** from the left navigation bar.
   - Click **New Query** and copy/paste the contents of [202605210001_phase1_schema.sql](file:///home/wiktor/Work/mission/supabase/migrations/202605210001_phase1_schema.sql). Run the query to build the base tables (`teams`, `quests`, `team_quest_progress`, `submissions`, `audit_logs`, `app_settings`).
   - Create another query, copy/paste the contents of [202605210002_phase3_review_functions.sql](file:///home/wiktor/Work/mission/supabase/migrations/202605210002_phase3_review_functions.sql), and run it. This installs the PL/pgSQL database functions used for atomic submission approvals and rejections (`approve_submission_for_review`, `reject_submission_for_review`).

3. **Seed Quests and Teams:**
   - Create another query, copy/paste the contents of [phase1_seed.sql](file:///home/wiktor/Work/mission/supabase/seeds/phase1_seed.sql), and run it. This seeds the 21 standard quests from `misje.md` and registers the two default teams (`team-ember` / *Drużyna Zarzewia*, `team-iron` / *Drużyna Żelaza*).
   - > [!NOTE]
     > The database schema includes a `pin_hash` column. However, to keep PIN management secure and flexible without committing plaintexts, PIN verification is performed at runtime against the `TEAM_PINS` environment variable. The seeded database placeholder hashes do not affect login.

4. **Retrieve API Credentials:**
   - Go to **Project Settings** (gear icon) -> **API**.
   - Copy the **Project URL** (under Project API keys, labeled `URL`).
   - Copy the **API Key** (labeled `anon public`).

---

### 2. Vercel Hosting & Environment Variables

1. **Create Vercel Project:**
   - Log in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
   - Import your repository.

2. **Configure Environment Variables:**
   - In the **Environment Variables** section of your Vercel project configuration, add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: The Supabase URL you copied.
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The Supabase public `anon` key.
     - `TEAM_PINS`: Comma-separated `team-id:plaintext-pin` pairs. **Ensure these use strong, unique numbers for the live game**, e.g.:
       `team-ember:4938,team-iron:8291`
     - `ADMIN_PASSWORD`: A secure, strong password for the host/admin dashboard, e.g. `SuperSecretHunterAdminPass123!`.
     - `APP_BASE_URL`: The production URL assigned by Vercel, e.g. `https://your-game.vercel.app` (needed for link generation and E2E validation).
   - Leave the **Framework Preset** as **Next.js** and keep other default build settings.

3. **Deploy:**
   - Click **Deploy**. Vercel will build and publish your app.

---

### 3. Static Asset Check (Final Prize)

Before public deployment, make sure you replace `public/final-prize-photo.jpg` with the actual high-quality final prize photo or image that will be unlocked when a team hits 16 approved quests.
- If you change this image, commit and push it to redeploy the app.

---

### 4. QR Code Generation

The game leverages unguessable 8-character suffix slugs for quests to prevent players from guessing next-stage URLs (e.g. `/quests/amber-vault-k9q4m2x7`).
1. Set `APP_BASE_URL` to the final public production URL, then export the quest list:
   ```bash
   APP_BASE_URL=https://your-game.vercel.app npm run export:quest-urls
   ```
2. Confirm the export contains exactly 21 rows, all with the final public base URL and no localhost or preview URL.
3. As a production cross-check, compare the export against Supabase:
   ```sql
   select id, title, slug from public.quests where is_active = true;
   ```
4. Convert the exported URLs into QR codes using the prepared files under `public/qr-codes/` or a trusted bulk generator.
5. Verify every QR code resolves to the final production URL, then print and physically hide them at the appropriate locations.

---

### 5. Pre-Flight Checklist & Live Game Reset

Before the event begins, perform a dry-run check:
1. Open your production site, enter a team PIN, and confirm successful login.
2. Visit a quest URL using a mobile device, submit a dummy link/response, and verify the team is blocked from double-submitting.
3. Access the admin dashboard at `/admin/login` using your configured `ADMIN_PASSWORD`.
4. Inspect the pending submission, click **Approve**, and ensure the team's map count updates. Try **Reject** on another to verify that rejection messages display correctly to the team.
5. **CRITICAL: Purge Test Data & Reset counts** before the live event begins! Run the following commands in the Supabase SQL Editor to clear out dry-run submissions and reset all progresses back to zero:
   ```sql
   -- Purge all test submissions and audit logs
   truncate table public.submissions cascade;
   truncate table public.audit_logs cascade;

   -- Reset team-quest progress mapping status
   update public.team_quest_progress
   set status = 'not_started',
       approved_at = null,
       hint_used_at = null,
       skipped_at = null,
       updated_at = now();

   -- Reset team statistics
   update public.teams
   set map_progress_count = 0,
       completed_quest_count = 0;
   ```

---

## Routes

- Player: `/`, `/login`, `/quests/[slug]`, `/submissions`, `/map`, `/logout`.
- Admin: `/admin/login`, `/admin`, `/admin/submissions/[id]`, `/admin/logout`.

## Final Prize Photo

Before the event, provide the final prize photo at `public/final-prize-photo.jpg`. The `/map` page only links to it after the current team reaches 16 approved quests.

## Operator Fallback

Keep the local `fallback/` folder on the event laptop before leaving:

- `fallback/quests.md` - all 21 quest identifiers and fallback instructions.
- `fallback/qr-mapping.md` - QR labels, slugs, and quest URLs; replace `https://mission.example` with the final production URL.
- `fallback/team-progress.md` - manual tracker for approvals, rejections, and revealed fragments.
- `fallback/final-prize-photo.jpg` - local copy of the final prize image.
- `fallback/map-reveal-method.md` and `fallback/fragments/` - manual map reveal instructions and fragment location.
- `fallback/admin-notes.md` - fallback operating procedure.

Before the event, add the real full map image as `fallback/map-full.png` and either add `fragment-01.png` through `fragment-21.png` under `fallback/fragments/` or document the exact manual reveal method in `fallback/map-reveal-method.md`.
