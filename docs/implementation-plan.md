# Implementation Plan: Mission Treasure Hunt

  ## Summary

  Build a rugged one-day Next.js + Supabase web app for two teams, QR-discovered quests, proof-link submission, admin approval, linear map reveal after 21 approved quests,
  and final prize photo unlock.

  Coverage gate for every phase: 100% statements, branches, and functions for all committed application code using Vitest/V8 coverage. E2E tests are required for critical
  flows but do not count toward the percentage gate. Static content/assets/config may be excluded only through explicit coverage config comments or patterns.

  Assumed stack:

  - Next.js App Router + TypeScript
  - Supabase Postgres for persistent state
  - Supabase client/server helpers for DB access
  - Vitest + Testing Library for unit/integration coverage
  - Playwright for end-to-end smoke scenarios
  - Vercel deployment

  ## MVP Phases

  ### Phase 0: Project Foundation And Quality Gates

  Implement the app scaffold, test harness, coverage enforcement, environment configuration, and deployment-safe project structure.

  Acceptance criteria:

  - App builds locally with TypeScript strict mode enabled.
  - Vitest coverage fails below 100% statements/branches/functions.
  - Playwright can run one placeholder smoke test against the local app.
  - Environment variables are documented for Supabase URL/key, team PINs, admin password, and app base URL.
  - No product behavior is implemented without tests covering it at 100%.

  ### Phase 1: Data Model, Seed Data, And Core Domain Logic

  Implement Supabase schema and pure domain logic for teams, quests, team quest progress, submissions, map progress, and audit records.

  Core entities:

  - teams
  - quests
  - team_quest_progress
  - submissions
  - audit_logs
  - optional app_settings for required approval count and game pause state

  Required constants:

  - 2 teams
  - 25 quests
  - 21 approvals required for full map reveal
  - submission statuses: pending, approved, rejected
  - team quest statuses: not_started, pending_review, approved, rejected, skipped

  Acceptance criteria:

  - Schema supports all MVP flows without direct media storage.
  - Seed data creates two teams and 25 unguessable quest slugs.
  - Domain tests cover map progress, duplicate submission prevention, rejection/resubmission, and 21-approval final unlock.
  - Audit-log helper exists for major actions.
  - 100% statements/branches/functions coverage passes.

  ### Phase 2: Team Login, Quest Access, And Proof Submission

  Implement the player-side functional flow with plain accessible UI only: team PIN login, session persistence, QR quest pages, proof-link/text submission, contributor name,
  and rejected resubmission.

  Acceptance criteria:

  - A team can log in with its PIN and remains scoped to that team.
  - Invalid PINs do not reveal quest or team state.
  - A logged-in team can open any valid quest slug.
  - Unknown quest slugs return a safe not-found state.
  - A team can submit proof URL/text, note, and contributor name.
  - A team cannot submit a second active proof while one is pending or approved.
  - A rejected quest can be resubmitted immediately.
  - Proof links are not visible to the other team.
  - Unit/integration tests cover login, quest access, submission validation, duplicate handling, and resubmission.
  - 100% statements/branches/functions coverage passes.

  ### Phase 3: Admin Review, Approval, Rejection, And Map Reveal

  Implement admin password login, pending submission review, approve/reject actions, rejection messages, per-team map progress, full-map unlock, and final prize photo unlock.

  Acceptance criteria:

  - Admin area requires the admin password.
  - Admin can see pending submissions with team, quest, contributor, note, and proof value.
  - Admin can open proof links from the review view.
  - Approval marks the submission approved, marks the team quest approved, increments that team’s map progress once, and writes an audit event.
  - Rejection stores reason/message, marks team quest rejected, allows resubmission, and writes an audit event.
  - Approving the same quest twice cannot increment map progress twice.
  - A team sees exactly its own revealed fragment count.
  - At 21 approved quests, the team sees full map state and final prize photo access.
  - The other team’s progress remains private and independent.
  - Playwright covers the core loop: team login -> quest submit -> admin approve -> map reveal.
  - 100% statements/branches/functions coverage passes.

  ### Phase 4: MVP Deployment, QR Readiness, And Operator Fallback

  Prepare the app for real use: Vercel deployment, Supabase production project, final URL stability, QR URL export, and local fallback assets.

  Acceptance criteria:

  - App deploys to a public HTTPS Vercel URL.
  - Production Supabase variables are configured.
  - Quest URL list can be exported or copied for QR generation.
  - All 25 quest URLs use unguessable slugs and work after deployment.
  - iPhone and Android smoke tests pass for login, quest view, proof submission, and map view.
  - Admin laptop smoke test passes for review and approval.
  - Operator fallback files are prepared locally: quest list, QR mapping, full map, final prize photo, and team progress tracker.
  - Production smoke test does not require direct media upload.
  - 100% statements/branches/functions coverage passes before deployment.

  ## Secondary Phases

  ### Phase 5: Admin Tools, Audit Log, Hints, And Polling

  Add secondary operational features: audit log view, hint usage tracking, admin manual overrides, replacement proof entry, and pending submission polling.

  Acceptance criteria:

  - Team can reveal/use a hint, and the action is recorded without time penalty.
  - Admin can view audit events for login, quest view, submission, hint usage, approval, rejection, and overrides.
  - Admin can manually reveal/hide fragments.
  - Admin can skip or override a broken quest.
  - Admin can enter replacement proof link/text for a team.
  - Admin pending-submissions view polls every few seconds and surfaces new submissions without manual refresh.
  - Tests cover all override paths and polling data behavior.
  - 100% statements/branches/functions coverage passes.

  ### Phase 6: Dedicated UI/UX Phase

  Apply mobile-first visual design and interaction polish separately from functional implementation. This phase covers look, layout, responsive behavior, theme, and
  usability, not new game rules.

  UI direction:

  - Polish language only.
  - Rugged fantasy mission style between LotR and HoMM3.
  - Mobile-first player screens.
  - Laptop-friendly admin screens.
  - Functional, readable, fast, and party-proof over decorative complexity.

  Acceptance criteria:

  - Player login, quest page, submission form, map page, and final reveal are usable on mobile widths.
  - Admin dashboard and review pages are efficient on laptop.
  - Text does not overflow buttons/cards/forms on common mobile widths.
  - Teams cannot infer the other team’s state from UI.
  - Proof links remain admin-only.
  - Playwright screenshots cover mobile player flow and desktop admin flow.
  - Accessibility checks pass for labels, focus states, contrast, and keyboard navigation on forms.
  - Existing behavior tests remain unchanged.
  - 100% statements/branches/functions coverage passes.

  ## Nice-To-Have Phases

  ### Phase 7: Reveal Effects And Intro

  Add nonessential atmosphere after the working game is secure.

  Acceptance criteria:

  - Map reveal animation plays when a new fragment is unlocked.
  - Obelisk-style sound can play on user interaction and has a mute/off path.
  - Optional intro screen can be skipped.
  - Effects do not block quest submission, admin review, or map access.
  - Tests cover disabled/muted sound, skipped intro, and no-animation fallback.
  - 100% statements/branches/functions coverage passes.

  ### Phase 8: Pause/Resume And Final Polish

  Add pause/resume UI and final operator conveniences.

  Acceptance criteria:

  - Admin can pause and resume the game.
  - Paused state prevents new player submissions but does not hide existing progress.
  - Admin can still review pending submissions while paused.
  - Player UI clearly says the game is paused.
  - Final pre-event checklist exists for deployment, QR generation, phone tests, admin login, and fallback files.
  - 100% statements/branches/functions coverage passes.

  ## Test Plan

  Required at every phase:

  - typecheck
  - lint
  - unit/integration tests
  - coverage: 100% statements, branches, functions
  - relevant Playwright smoke tests once routes exist

  Critical scenarios:

  - invalid team PIN rejected
  - team cannot see other team progress
  - unknown quest slug is safe
  - valid quest submission creates pending review
  - duplicate pending/approved submission is blocked
  - rejected quest can be resubmitted
  - approval increments map progress once
  - 21 approvals unlock full map and final prize photo
  - admin-only proof visibility
  - admin override paths write audit logs
  - production smoke test on mobile and laptop

  ## Assumptions And Defaults

  - Functional UI is allowed during MVP phases; visual design and UX polish are isolated in the dedicated UI/UX phase.
  - Proof is stored as URL/text only; no app-managed media upload.
  - Team PINs and admin password are sufficient authentication for this private event.
  - Supabase is the source of truth for production state.
  - Vercel provider URL is acceptable; custom domain is not required.
  - The app does not need offline support.
  - The operator fallback remains laptop-based and does not need printed materials.
