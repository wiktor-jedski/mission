# Operator Fallback

## Purpose

This fallback keeps the game playable if the deployed app, internet connection, QR flow, login, or submission system fails during the event.

It is intentionally small and should live on the organizer's laptop. It does not need to be printed.

## Fallback Trigger Conditions

Use fallback mode if:

- players cannot open the app
- team login stops working
- QR codes point to a broken URL
- proof submission fails
- admin review page fails
- hosting provider is down or rate-limited
- internet becomes unreliable
- the app state becomes incorrect and cannot be fixed quickly

## Files To Keep Locally

Keep these files available on the laptop before leaving:

- all quest texts
- QR-to-quest mapping
- full map image
- map fragments or a way to reveal fragments manually
- final prize placement photo
- team progress tracker
- admin notes

Suggested local folder:

```text
fallback/
  quests.md
  qr-mapping.md
  team-progress.md
  map-full.png
  final-prize-photo.jpg
  fragments/
```

## Manual Game Loop

If fallback mode is needed:

1. Teams continue finding QR codes if possible.
2. If QR pages do not work, admin reads or sends the matching quest text manually.
3. Teams complete the quest.
4. Teams send proof directly to admin through WhatsApp, Signal, Messenger, AirDrop, or cloud link.
5. Admin approves or rejects manually.
6. Admin records progress in `team-progress.md`.
7. On approval, admin shows or sends the next map fragment.
8. Once all required fragments are revealed, admin sends or shows the final prize photo.

## Manual Progress Rule

Map progress remains linear:

- first accepted quest reveals fragment 1
- second accepted quest reveals fragment 2
- third accepted quest reveals fragment 3
- continue until 21 accepted quests reveal the full map

Quest order does not matter.

## Team Progress Template

```markdown
# Team Progress

## Team 1

- Approved quests: 0
- Revealed fragments: 0
- Required approvals to finish: 21
- Completed quest slugs:
- Rejected quest slugs:
- Hint usage:

## Team 2

- Approved quests: 0
- Revealed fragments: 0
- Required approvals to finish: 21
- Completed quest slugs:
- Rejected quest slugs:
- Hint usage:
```

## Fallback Requirement

The fallback does not need to be elegant. It only needs to preserve the core loop:

quest found -> proof shown -> admin approves -> next map fragment revealed -> final prize location unlocked.
