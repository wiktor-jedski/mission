# Implementation Scope

## Recommended One-Day Build Order

### Phase 1 - Core State

- Define teams.
- Define quests.
- Define per-team quest progress.
- Define submissions.
- Define map progress.
- Define admin session.

### Phase 2 - Player Flow

- Team PIN login.
- Quest page by unguessable slug.
- Quest instructions and safety warning.
- Proof link/text submission.
- Rejected submission resubmission.
- Team map page.

### Phase 3 - Admin Flow

- Admin password login.
- Pending submissions list.
- Submission detail view.
- Approve submission.
- Reject submission with reason/message.
- Show full map after 21 approved quests for a team.
- Unlock final prize photo.
- Persist player submissions, review actions, team quest progress, map progress, final unlock state, and audit events through Supabase.

Phase 3 does not include deployment, QR export, hints UI, polling, audit-log UI, manual overrides, pause/resume controls, animations, sound, or visual polish.

### Phase 4 - Deployment And QR Codes

- Deploy to public HTTPS URL.
- Test on laptop.
- Test on iPhone.
- Test on Android.
- Generate quest QR codes from final URLs.
- Print QR codes.
- Hide QR codes in the house.

### Phase 5 - Time-Permitting Polish

- Basic fantasy styling.
- Audit log view.
- Hint button and hint usage tracking.
- Admin polling for new submissions.
- Manual map progress override.
- Reveal animation.
- Obelisk sound.
- Intro screen.

## Data Model Draft

### Team

- id
- name
- pin_hash
- map_progress_count
- completed_quest_count
- created_at

### Quest

- id
- slug
- title
- flavor_text
- instructions
- success_criteria
- safety_warning
- proof_type
- hint_text
- is_active

### TeamQuestProgress

- id
- team_id
- quest_id
- status: not_started, pending_review, approved, rejected, skipped
- hint_used_at
- approved_at
- skipped_at

### Submission

- id
- team_id
- quest_id
- contributor_name
- proof_kind
- proof_value
- note
- status: pending, approved, rejected
- rejection_reason
- rejection_message
- submitted_at
- reviewed_at

### MapFragment

- id
- sequence_number
- image_path

### AuditLog

- id
- actor_type
- actor_id
- action
- team_id
- quest_id
- submission_id
- metadata
- created_at

## Route Draft

### Player Routes

- `/`
- `/login`
- `/quests/[slug]`
- `/map`
- `/submissions`

### Admin Routes

- `/admin/login`
- `/admin`
- `/admin/submissions/[id]`

## Priority Rule

If time gets tight, protect the core loop first:

team login -> quest page -> proof submission -> admin approval -> map reveal -> final photo.
