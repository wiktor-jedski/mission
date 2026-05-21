# Decisions And Assumptions

## Resolved Decisions

### Hint Time Penalty

- Decision: record hint usage only.
- There is no real time penalty in v1.
- Hint usage should appear in audit/progress data.

### Required Map Progress

- Decision: create 21 quests.
- Decision: require 16 approved quests to reveal the full map.
- Quest order does not matter; any approved quest reveals the next fixed fragment.

### Final Prize Race

- Decision: the first team to complete the full map can win the main prize.
- Decision: a backup prize exists.
- The second team can still complete the map for the reveal and/or backup prize.

### Prank Calls

- Decision: prank-call quests should involve calling a friend.
- Prank-call quests must not be aggressive.
- Prank-call quests should not involve strangers.

### Substance-Related Gameplay

- Decision: substance references are thematic only.
- Quests should not require consumption.
- Quests should not pressure alcohol or substance use.

### Admin Notifications

- Decision: use a pending submissions list with polling.
- Push notifications are not required.
- Manual refresh should not be the primary workflow if polling can be implemented quickly.

### Phase 3 Runtime Persistence

- Decision: Phase 3 must replace the Phase 2 local repository runtime path with Supabase-backed reads/writes before any public deployment smoke test.
- The local repository may remain for unit tests or explicit local fallback, but deployed gameplay must use Supabase as the source of truth.
- Supabase-backed runtime persistence must cover player submissions, admin pending review, approval, rejection, team quest progress, map progress, final unlock state, and audit writes.

## Current Assumptions

- The app will be hosted publicly with HTTPS.
- Vercel Hobby is acceptable for the web app.
- Media files are not uploaded to the app.
- Proof is submitted as cloud links or text.
- A provider URL such as `*.vercel.app` is acceptable.
- QR codes are generated separately once final quest URLs exist.
- Team PINs are enough authentication for players.
- Admin password is enough authentication for admin.
- The app is mobile-first for players and laptop-friendly for admin.
- Polish is the only required language.
- The app can be rugged and event-specific.
- The operator fallback will live on the organizer's laptop.
- Phase 1 seed team names, PIN hashes, quest titles, quest instructions, hints, and safety copy are implementation placeholders until final event content is supplied.
- The 21 Phase 1 quest slugs are stable and unguessable enough for QR generation.
- Local development and automated tests may use fallback player PINs `1111` for `team-ember` and `2222` for `team-iron` when `TEAM_PINS` is not configured. Production should set `TEAM_PINS` explicitly.
- Phase 3 runtime routes use the runtime repository boundary. Supabase is the required source of truth for deployed gameplay; the local repository path remains only for local development and tests when Supabase URL/key are absent.

## Remaining Clarifications

### Phase 4 Final URL

- Owner action: confirm the final public production URL that should be used for QR generation.
- Current local export command is ready: `APP_BASE_URL=https://your-game.vercel.app npm run export:quest-urls`.
- Do not print or hide QR codes until this URL is final.

### Phase 4 Production Smoke Evidence

- Owner action: run and record production smoke tests on iPhone, Android, and the admin laptop after the final Vercel deployment is live.
- Required checks: team login, quest view from QR/URL, proof URL/text submission, map view, admin review, proof opening, approval, and player map update.
- After smoke testing, reset or intentionally clean production state before the event.

### Phase 4 Map Fallback Asset

- Owner action: add the real full map image as `fallback/map-full.png`.
- Owner action: add `fallback/fragments/fragment-01.png` through `fallback/fragments/fragment-21.png` or document the exact local reveal method in `fallback/map-reveal-method.md`.

### Phase 4 QR Locations

- Owner action: fill physical hiding locations in `fallback/qr-mapping.md` after QR codes are printed and placed.

### Phase 5 Production Migration

- Owner action: apply `supabase/migrations/202605210003_phase5_admin_tools.sql` to production before using Phase 5 features there.
- This migration expands the allowed `audit_logs.action` values for team login, quest view, hint usage, manual overrides, skipped quests, broken quest overrides, and replacement proof entries.
- Phase 5 manual reveal/hide uses each team's `map_progress_count` as the authoritative revealed-fragment count, while approval/rejection paths keep it synchronized with approved quest progress.

## Project Owner Actions

### Dependency Security Follow-Up

- `npm audit --omit=dev` reports 2 moderate vulnerabilities through the current `next`/`postcss` dependency chain.
- npm's automatic force fix proposes a breaking downgrade to Next 9, so it was not applied.
- Before deployment, decide whether to accept this Phase 0 scaffold risk temporarily or move to a patched Next/PostCSS release when one is available through the normal dependency range.

Decision: this is an app for a private party, we can accept that 

### Final Phase 1 Seed Content

- Replace placeholder team PIN hashes with real hashes before production seeding.
- Review and replace placeholder quest copy before QR codes are generated.

### Phase 2 Production Configuration

- Set final `TEAM_PINS` before deployment, using entries that match seeded team IDs, for example `team-ember:real-pin,team-iron:real-pin`.

Decision: completed

### Phase 3 Supabase Smoke Configuration

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TEAM_PINS`, `ADMIN_PASSWORD`, and `APP_BASE_URL` before any public deployment smoke test.

Decision: env vars are loaded in Vercel.

- Apply both Supabase migrations and the Phase 1 seed before a public deployment smoke test.

Decision: applied

- Public/deployed gameplay must not use local process-memory fallback state.

### Final Prize Photo Asset

- Add the event's final prize photo as `public/final-prize-photo.jpg` before the event.
- The `/map` page links to that file only after the current team reaches 16 approved quests.

Decision: completed

## Phase 6 UI/UX Design Assumptions and Clarifications

### Visual Theme & Tokens
- We assume a mobile-first premium **Dark-Mode-First Mystical Vault** theme is preferred for outdoor readability and an immersive feeling.
- Headings will utilize the **Cinzel** Google Font to capture the classic rugged fantasy atmosphere.
- Colors are defined as deep obsidian/charcoal (`#120f0d`), leather brown (`#1e1814`), radiant old gold (`#c5a059`), and emerald/ruby/sapphire colors for status states.

### Polish Copy Standards
- We assume that the Polish text should use correct grammatical accents and diacritics (e.g. `drużyny` instead of `druzyny`, `Zgłoszenia` instead of `Zgloszenia`), and we will update the relevant tests to match this audited copy.

### CSS-only Map Fragment Grid
- We assume a custom-built, responsive CSS Grid of 21 ancient runic slot cards represents the player's map state, avoiding heavy image downloads. Locked fragments show a runic lock icon, while unlocked fragments show gold borders and active green checkmarks.

## Phase 7 Reveal Effects and Intro Clarifications

### Obelisk Audio Asset
- Owner action: Please replace `public/obelisk-reveal.mp3` with the final obelisk-style sound asset before the event, or confirm if you want me to use a specific royalty-free sound.

### Intro Copy
- Owner action: The intro screen copy will use thematic placeholder Polish text located in `lib/player/copy-dictionary.ts`. Review and adjust this before production.

### Client-Side Preferences Persistence
- The current implementation uses `localStorage` for effects preferences (animations/sound toggle and skipped intro). If a team logs in on a new device during the game, these effects settings will reset to default. Confirm whether this client-only persistence is acceptable for this non-essential feature, or if it should be migrated to database-backed persistence in a future phase.
