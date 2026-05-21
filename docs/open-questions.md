# Decisions And Assumptions

## Resolved Decisions

### Hint Time Penalty

- Decision: record hint usage only.
- There is no real time penalty in v1.
- Hint usage should appear in audit/progress data.

### Required Map Progress

- Decision: create 25 quests.
- Decision: require 21 approved quests to reveal the full map.
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
- The 25 Phase 1 quest slugs are stable and unguessable enough for QR generation, but they should not be printed until the final quest copy is accepted.
- Phase 2 uses local fallback player PINs `1111` for `team-ember` and `2222` for `team-iron` when `TEAM_PINS` is not configured. Production should set `TEAM_PINS` explicitly.
- Phase 2 player data access is implemented behind a replaceable local repository over Phase 1 seed data until Supabase-backed runtime persistence is wired into a later phase.

## Remaining Clarifications

None currently blocking requirements.

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
- Decide whether Phase 3 should replace the Phase 2 local repository with Supabase-backed reads/writes before any public deployment smoke test.
