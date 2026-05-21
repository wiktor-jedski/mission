export const TEAM_COUNT = 2;
export const QUEST_COUNT = 25;
export const REQUIRED_APPROVAL_COUNT = 21;

export const SUBMISSION_STATUSES = [
  "pending",
  "approved",
  "rejected"
] as const;

export const TEAM_QUEST_STATUSES = [
  "not_started",
  "pending_review",
  "approved",
  "rejected",
  "skipped"
] as const;

export const PROOF_KINDS = [
  "photo_link",
  "video_link",
  "audio_link",
  "text_response"
] as const;

export const REJECTION_REASONS = [
  "link_inaccessible",
  "wrong_proof",
  "quest_incomplete",
  "other"
] as const;

export const AUDIT_ACTIONS = [
  "submission_created",
  "submission_approved",
  "submission_rejected",
  "progress_changed",
  "seed_validated",
  "schema_maintenance"
] as const;

export const ACTOR_TYPES = ["team", "admin", "system"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type TeamQuestStatus = (typeof TEAM_QUEST_STATUSES)[number];
export type ProofKind = (typeof PROOF_KINDS)[number];
export type RejectionReason = (typeof REJECTION_REASONS)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type ActorType = (typeof ACTOR_TYPES)[number];

const hasStringValue = <Value extends string>(
  values: readonly Value[],
  candidate: string
): candidate is Value => values.includes(candidate as Value);

export const isSubmissionStatus = (
  candidate: string
): candidate is SubmissionStatus =>
  hasStringValue(SUBMISSION_STATUSES, candidate);

export const isTeamQuestStatus = (
  candidate: string
): candidate is TeamQuestStatus =>
  hasStringValue(TEAM_QUEST_STATUSES, candidate);

export const isProofKind = (candidate: string): candidate is ProofKind =>
  hasStringValue(PROOF_KINDS, candidate);

export const isRejectionReason = (
  candidate: string
): candidate is RejectionReason =>
  hasStringValue(REJECTION_REASONS, candidate);

export const isAuditAction = (candidate: string): candidate is AuditAction =>
  hasStringValue(AUDIT_ACTIONS, candidate);

export const isActorType = (candidate: string): candidate is ActorType =>
  hasStringValue(ACTOR_TYPES, candidate);
