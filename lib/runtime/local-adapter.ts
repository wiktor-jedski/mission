import {
  approveSubmission as approveSubmissionDomain,
  calculateMapProgress,
  createAuditLog,
  rejectSubmission as rejectSubmissionDomain
} from "@/lib/domain/game";
import type {
  AuditLog,
  Quest,
  Submission,
  Team,
  TeamQuestProgress
} from "@/lib/domain/types";
import {
  PlayerRepository,
  type PlayerRepositorySnapshot
} from "@/lib/player/store";
import type {
  AdminReviewActionResult,
  PendingSubmissionReview,
  RejectSubmissionInput,
  RuntimeRepository,
  SubmitProofInput,
  SubmitProofResult
} from "./repository";

type LocalRuntimeSnapshot = PlayerRepositorySnapshot & {
  auditLogs?: readonly AuditLog[];
};

export class LocalRuntimeRepository implements RuntimeRepository {
  private readonly playerRepository: PlayerRepository;
  private auditLogs: AuditLog[];

  constructor(snapshot?: LocalRuntimeSnapshot) {
    this.playerRepository = new PlayerRepository(snapshot);
    this.auditLogs = [...(snapshot?.auditLogs ?? [])];
  }

  async getTeams(): Promise<readonly Team[]> {
    return this.playerRepository.getTeams();
  }

  async getTeam(teamId: string): Promise<Team | null> {
    return this.playerRepository.getTeam(teamId);
  }

  async getQuests(): Promise<readonly Quest[]> {
    return this.playerRepository.snapshot().quests;
  }

  async getQuestBySlug(slug: string): Promise<Quest | null> {
    return this.playerRepository.getQuestBySlug(slug);
  }

  async getQuestAccess(teamId: string, slug: string) {
    return this.playerRepository.getQuestAccess(teamId, slug);
  }

  async getTeamSubmissions(teamId: string): Promise<readonly Submission[]> {
    return this.playerRepository.getTeamSubmissions(teamId);
  }

  async submitProof(input: SubmitProofInput): Promise<SubmitProofResult> {
    const result = this.playerRepository.submitProof(input);

    if (result.status === "created") {
      this.auditLogs = [
        ...this.auditLogs,
        createAuditLog({
          id: this.createAuditId(),
          actorType: "team",
          actorId: input.teamId,
          action: "submission_created",
          teamId: result.submission.teamId,
          questId: result.submission.questId,
          submissionId: result.submission.id,
          createdAt: result.submission.submittedAt
        })
      ];
    }

    return result;
  }

  async getTeamMapState(teamId: string) {
    const progressRows = this.playerRepository
      .snapshot()
      .progressRows.filter((progress) => progress.teamId === teamId);

    return calculateMapProgress(progressRows);
  }

  async listPendingSubmissions(): Promise<readonly PendingSubmissionReview[]> {
    return this.buildPendingReviews();
  }

  async getPendingSubmission(
    submissionId: string
  ): Promise<PendingSubmissionReview | null> {
    return (
      this.buildPendingReviews().find(
        (review) => review.submission.id === submissionId
      ) ?? null
    );
  }

  async approveSubmission(
    submissionId: string
  ): Promise<AdminReviewActionResult> {
    const snapshot = this.playerRepository.snapshot();
    const submission = snapshot.submissions.find((row) => row.id === submissionId);

    if (!submission) {
      return { status: "not_found" };
    }

    if (submission.status !== "pending") {
      return { status: "invalid_transition" };
    }

    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!progress) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    const updated = approveSubmissionDomain(submission, progress, reviewedAt);
    this.replaceSubmission(updated.submission);
    this.replaceProgress(updated.progress);
    this.writeAudit("submission_approved", updated.submission, reviewedAt);

    const review = await this.buildReview(updated.submission);
    return review ? { status: "updated", review } : { status: "not_found" };
  }

  async rejectSubmission(
    input: RejectSubmissionInput
  ): Promise<AdminReviewActionResult> {
    const snapshot = this.playerRepository.snapshot();
    const submission = snapshot.submissions.find(
      (row) => row.id === input.submissionId
    );

    if (!submission) {
      return { status: "not_found" };
    }

    if (submission.status !== "pending") {
      return { status: "invalid_transition" };
    }

    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!progress) {
      return { status: "not_found" };
    }

    const reviewedAt = new Date().toISOString();
    const updated = rejectSubmissionDomain(
      submission,
      progress,
      input.reason,
      reviewedAt,
      input.message
    );
    this.replaceSubmission(updated.submission);
    this.replaceProgress(updated.progress);
    this.writeAudit("submission_rejected", updated.submission, reviewedAt);

    const review = await this.buildReview(updated.submission);
    return review ? { status: "updated", review } : { status: "not_found" };
  }

  snapshot(): LocalRuntimeSnapshot {
    return { ...this.playerRepository.snapshot(), auditLogs: this.auditLogs };
  }

  private buildPendingReviews(): readonly PendingSubmissionReview[] {
    const snapshot = this.playerRepository.snapshot();

    return snapshot.submissions
      .filter((submission) => submission.status === "pending")
      .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt))
      .flatMap((submission) => {
        const review = this.buildReviewFromSnapshot(submission, snapshot);
        return review ? [review] : [];
      });
  }

  private async buildReview(
    submission: Submission
  ): Promise<PendingSubmissionReview | null> {
    return this.buildReviewFromSnapshot(submission, this.playerRepository.snapshot());
  }

  private buildReviewFromSnapshot(
    submission: Submission,
    snapshot: PlayerRepositorySnapshot
  ): PendingSubmissionReview | null {
    const team = snapshot.teams.find((row) => row.id === submission.teamId);
    const quest = snapshot.quests.find((row) => row.id === submission.questId);
    const progress = snapshot.progressRows.find(
      (row) => row.teamId === submission.teamId && row.questId === submission.questId
    );

    if (!team || !quest || !progress) {
      return null;
    }

    return {
      submission,
      team,
      quest,
      progress,
      map: calculateMapProgress(
        snapshot.progressRows.filter((row) => row.teamId === submission.teamId)
      )
    };
  }

  private replaceSubmission(submission: Submission): void {
    const snapshot = this.playerRepository.snapshot();
    this.reset({
      ...snapshot,
      submissions: snapshot.submissions.map((row) =>
        row.id === submission.id ? submission : row
      )
    });
  }

  private replaceProgress(progress: TeamQuestProgress): void {
    const snapshot = this.playerRepository.snapshot();
    this.reset({
      ...snapshot,
      progressRows: snapshot.progressRows.map((row) =>
        row.id === progress.id ? progress : row
      )
    });
  }

  private reset(snapshot: PlayerRepositorySnapshot): void {
    const auditLogs = this.auditLogs;
    Object.assign(this, new LocalRuntimeRepository({ ...snapshot, auditLogs }));
  }

  private writeAudit(
    action: "submission_approved" | "submission_rejected",
    submission: Submission,
    createdAt: string
  ): void {
    this.auditLogs = [
      ...this.auditLogs,
      createAuditLog({
        id: this.createAuditId(),
        actorType: "admin",
        action,
        teamId: submission.teamId,
        questId: submission.questId,
        submissionId: submission.id,
        createdAt
      })
    ];
  }

  private createAuditId(): string {
    return `audit-${(this.auditLogs.length + 1).toString().padStart(4, "0")}`;
  }
}
