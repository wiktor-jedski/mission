import { describe, expect, it } from "vitest";
import {
  ACTOR_TYPES,
  AUDIT_ACTIONS,
  isActorType,
  isAuditAction,
  isProofKind,
  isRejectionReason,
  isSubmissionStatus,
  isTeamQuestStatus,
  PROOF_KINDS,
  QUEST_COUNT,
  REJECTION_REASONS,
  REQUIRED_APPROVAL_COUNT,
  SUBMISSION_STATUSES,
  TEAM_COUNT,
  TEAM_QUEST_STATUSES
} from "@/lib/domain/constants";

describe("domain constants", () => {
  it("defines the fixed Phase 1 game constants", () => {
    expect(TEAM_COUNT).toBe(2);
    expect(QUEST_COUNT).toBe(25);
    expect(REQUIRED_APPROVAL_COUNT).toBe(21);
    expect(SUBMISSION_STATUSES).toEqual(["pending", "approved", "rejected"]);
    expect(TEAM_QUEST_STATUSES).toEqual([
      "not_started",
      "pending_review",
      "approved",
      "rejected",
      "skipped"
    ]);
    expect(PROOF_KINDS).toEqual([
      "photo_link",
      "video_link",
      "audio_link",
      "text_response"
    ]);
    expect(REJECTION_REASONS).toEqual([
      "link_inaccessible",
      "wrong_proof",
      "quest_incomplete",
      "other"
    ]);
    expect(AUDIT_ACTIONS).toContain("submission_created");
    expect(ACTOR_TYPES).toEqual(["team", "admin", "system"]);
  });

  it("validates known and unknown runtime values", () => {
    expect(isSubmissionStatus("pending")).toBe(true);
    expect(isSubmissionStatus("waiting")).toBe(false);
    expect(isTeamQuestStatus("not_started")).toBe(true);
    expect(isTeamQuestStatus("done")).toBe(false);
    expect(isProofKind("photo_link")).toBe(true);
    expect(isProofKind("file_upload")).toBe(false);
    expect(isRejectionReason("wrong_proof")).toBe(true);
    expect(isRejectionReason("too_late")).toBe(false);
    expect(isAuditAction("submission_approved")).toBe(true);
    expect(isAuditAction("login")).toBe(false);
    expect(isActorType("admin")).toBe(true);
    expect(isActorType("guest")).toBe(false);
  });
});
