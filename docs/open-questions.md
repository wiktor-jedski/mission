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

## Remaining Clarifications

None currently blocking requirements.
