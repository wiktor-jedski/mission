# Mission Treasure Hunt - Requirements

## 1. Purpose

Create a rugged mobile-first web app for a bachelor party treasure hunt.

Players split into two teams, discover QR codes hidden around a rented house, complete chaotic creative quests, submit proof links, and reveal fragments of a hidden map. Completing enough quests reveals the final prize location.

The app is a one-off private event tool, not a reusable product.

## 2. Event Context

- Event: bachelor party.
- Location: rented house for 2 nights.
- Expected players: 8.
- Teams: 2 teams of 4.
- Device model: each team operates primarily from one phone.
- Admin/verifier: app creator.
- Admin device: laptop.
- Language: Polish only.
- Deadline: must be usable before departure tomorrow at 11:00.
- Tone: chaotic, funny, social, creative.
- Theme: mission treasure hunt, visually between Lord of the Rings and Heroes of Might and Magic 3.
- Final prize: a big joint.

## 3. Core Game Loop

1. A team finds a QR code in the house.
2. The QR code opens a quest page.
3. The team completes the quest.
4. The team submits a proof link and optional note.
5. The admin reviews the proof.
6. The admin approves or rejects the submission.
7. If approved, the team reveals the next fixed map fragment.
8. When the whole map is revealed, the team unlocks a final photo showing the exact prize placement.

## 4. Game Format Requirements

### 4.1 Teams

- The game must support exactly 2 teams.
- Teams are assigned manually outside the app.
- Each team must log in using a shared team PIN.
- Individual accounts are not required.
- The app should track the person submitting proof for contribution visibility.
- There must be no leaderboard.
- Teams must not be able to see the other team's progress.

### 4.2 Quest Availability

- The game is nonlinear.
- All quests are active by default.
- Players may scan QR codes and attempt quests in any order.
- Each QR code corresponds to one specific quest.
- The same QR code works for both teams.
- QR codes are reusable.
- QR URLs must be hard to guess.
- QR codes will be generated separately from the app.

### 4.3 Competition Model

- Both teams solve the same set of quests.
- There is one final prize.
- The first team to complete the full map can win the main prize.
- A backup prize exists for early discovery or second-team resolution.
- The game unfolds naturally over the event and has no hard deadline.
- There are no day/night chapters.
- Failed or rejected quests are retryable.

## 5. Quest Requirements

### 5.1 Quest Count

- Target quest count: 21.
- Required approved quests to finish the map: 21.
- All quests should be available from the start.
- Quests should be casual and achievable on-site.

### 5.2 Quest Content Fields

Each quest should include:

- title
- flavor text
- instructions
- success criteria
- safety warnings
- proof type
- optional hint
- QR slug or URL identifier

### 5.3 Proof Types

Supported proof types:

- photo link
- video link
- audio link
- text response

The app does not directly upload media files. Players upload media to Google Photos, Google Drive, iCloud, or similar services, then paste a share link into the app.

### 5.4 Proof Submission

- A team may submit one active proof per quest.
- If rejected, the team may submit a new proof immediately.
- Submission must include:
  - proof URL or text response
  - optional note
  - contributor name
- The app should validate proof URL format only where relevant.
- The app does not validate cloud file permissions automatically.

### 5.5 Manual Verification

- Every quest requires manual admin verification.
- No quest is auto-verifiable.
- Admin may approve or reject a submission.
- Admin may reject with a message.
- Rejection reasons should include:
  - link inaccessible
  - wrong proof
  - quest incomplete
  - other

### 5.6 Hints

- Quests may have optional hints.
- The app should record that a hint was used.
- Hints do not apply a real time penalty in v1.
- Hint usage is informational only and appears in audit/progress data.

### 5.7 Safety Boundaries

Allowed:

- funny tasks
- social tasks
- creative photos/videos/audio
- prank calls to friends, if not aggressive
- substance references as theme/flavor

Not allowed:

- property damage
- aggressive behavior
- anything likely to disturb neighbors
- illegal activity
- activity that violates local laws or house rules
- tasks that require substance consumption
- tasks that pressure alcohol or substance use beyond participant comfort

## 6. Map Reveal Requirements

### 6.1 Map Model

- The map is a single image split into fragments.
- Revealed fragments should form a coherent image, similar to Heroes of Might and Magic 3 obelisks.
- Map progress is linear per team.
- Quest order does not determine which map fragment is revealed.
- Any approved quest reveals the next unrevealed fragment in a fixed order.
- The map is fully revealed after 21 approved quests for that team.

### 6.2 Fragment Rules

- Revealed fragments remain visible forever.
- Partial map progress should not reveal useful prize clues.
- The prize location should only become readable after the full map is revealed.
- Each team has independent map progress.
- Teams reveal the same fragment sequence.

### 6.3 Final Reveal

- When a team completes the required number of approvals, the full map is revealed.
- Completing the full map unlocks a final photo showing the exact prize placement.
- There is one final prize location.
- The first team to complete the map can claim the main prize.
- A backup prize exists if players physically find the prize early or to resolve the second team's finish.

### 6.4 Presentation

- Map must be visible on phones.
- Reveal animation is desired.
- Heroes of Might and Magic 3 obelisk-style sound is desired.
- Animation and sound are lower priority than core reliability.

## 7. Admin Requirements

### 7.1 Authentication

- Admin area must be password protected.
- There is exactly one admin.

### 7.2 Admin Submission Review

Admin must be able to:

- view pending submissions
- open proof links in a new tab
- approve submissions
- reject submissions with a reason/message
- see team and quest context
- see contributor name

### 7.3 Admin Overrides

Admin should be able to:

- skip a quest
- manually edit team progress
- manually reveal map fragments
- manually hide map fragments
- pause the game
- enter replacement proof link/text on behalf of a team
- override broken quests

### 7.4 Admin Notifications

- Admin should receive notice when a team submits proof.
- Admin notification is implemented as a pending submissions list that polls every few seconds.
- Push notifications are not required.

### 7.5 Audit Log

The app should keep a log of important actions, including:

- team login
- quest scan/view
- proof submission
- hint usage
- approval
- rejection
- admin override
- manual map reveal/hide
- game pause/resume

## 8. Hosting And Connectivity Requirements

### 8.1 Hosting

- The app should be hosted publicly on the internet.
- HTTPS is required.
- Vercel Hobby is acceptable for the app if media files are not uploaded directly through Vercel.
- A provider URL is acceptable; a custom domain is not required.

### 8.2 Connectivity

- House Wi-Fi is expected to be reliable.
- Mobile data is expected to be reliable.
- Router/admin access is not available.
- The app does not need to work offline.
- If the internet drops, the game may pause or switch to operator fallback.

### 8.3 Media Storage

- The app must not store uploaded media files.
- Players store media in their own cloud accounts and submit links.
- The app stores only proof links, notes, statuses, and audit data.

## 9. Security And Privacy Requirements

### 9.1 Access Control

- Only two teams can log in.
- Each team uses a shared PIN.
- Admin uses a separate password.
- Public quest URLs should be unguessable.
- Outsiders should not be able to submit proof without a valid team session/PIN.

### 9.2 Proof Visibility

- Proof links are visible only to admin.
- Players should not see other teams' proof.
- Players should not see other teams' progress.

### 9.3 Data Handling

- The app does not need to strip metadata.
- The app does not need file scanning because it does not accept file uploads.
- Media deletion is the uploader's responsibility.
- iCloud links may expire after a limited time; this is acceptable for the event.

## 10. Minimum Viable Scope

The minimum version that still delivers the game must include:

- two team PIN logins
- 21 hardcoded quest pages with unguessable slugs
- proof link or text submission
- contributor name on submission
- admin password login
- admin pending submissions list
- approve/reject flow
- rejection message
- per-team map progress
- full map reveal after 21 approved quests
- fixed-order map reveal
- final prize photo unlock
- public HTTPS deployment
- tested on iPhone and Android

## 11. Secondary Scope

Implement if time allows:

- audit log
- hint usage tracking
- admin manual override
- admin replacement proof
- basic LotR/HoMM3 visual styling
- pending submission polling
- QR print checklist

## 12. Nice-To-Have Scope

Implement only after the core loop is working:

- reveal animation
- obelisk sound
- intro screen
- pause/resume UI
- polished fantasy map treatment

## 13. Explicit Non-Goals

- No individual player accounts.
- No leaderboard.
- No direct media upload.
- No automatic proof verification.
- No offline support.
- No reusable product architecture requirement.
- No custom domain requirement.
- No multilingual support.
- No complex branching quest chain.
- No printed fallback pack requirement.
