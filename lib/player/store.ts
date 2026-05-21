import { canSubmitProof, createSubmissionDraft } from "@/lib/domain/game";
import type {
  Quest,
  Submission,
  Team,
  TeamQuestProgress
} from "@/lib/domain/types";
import {
  phase1Quests,
  phase1TeamQuestProgress,
  phase1Teams
} from "@/lib/seed/phase1";

export type QuestAccessResult =
  | {
      status: "found";
      quest: Quest;
      progress: TeamQuestProgress;
      submissions: readonly Submission[];
    }
  | { status: "not_found" };

export type SubmitProofInput = {
  teamId: string;
  questSlug: string;
  contributorName: string;
  proofValue: string;
  note: string | null;
};

export type SubmitProofResult =
  | { status: "created"; submission: Submission; progress: TeamQuestProgress }
  | { status: "quest_not_found" }
  | { status: "blocked"; reason: "already_approved" | "active_submission" };

export type PlayerRepositorySnapshot = {
  teams: readonly Team[];
  quests: readonly Quest[];
  progressRows: readonly TeamQuestProgress[];
  submissions: readonly Submission[];
};

export class PlayerRepository {
  private teams: Team[];
  private readonly quests: Quest[];
  private progressRows: TeamQuestProgress[];
  private submissions: Submission[];
  private nextSubmissionNumber: number;

  constructor(snapshot: PlayerRepositorySnapshot = createInitialSnapshot()) {
    this.teams = [...snapshot.teams];
    this.quests = [...snapshot.quests];
    this.progressRows = [...snapshot.progressRows];
    this.submissions = [...snapshot.submissions];
    this.nextSubmissionNumber = this.submissions.length + 1;
  }

  getTeams(): readonly Team[] {
    return this.teams;
  }

  getTeam(teamId: string): Team | null {
    return this.teams.find((team) => team.id === teamId) ?? null;
  }

  getQuestBySlug(slug: string): Quest | null {
    const normalizedSlug = slug.trim();

    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      return null;
    }

    return (
      this.quests.find(
        (quest) => quest.slug === normalizedSlug && quest.isActive
      ) ?? null
    );
  }

  getQuestAccess(teamId: string, slug: string): QuestAccessResult {
    const quest = this.getQuestBySlug(slug);
    const team = this.getTeam(teamId);

    if (!quest || !team) {
      return { status: "not_found" };
    }

    return {
      status: "found",
      quest,
      progress: this.getOrCreateProgress(team.id, quest.id),
      submissions: this.getTeamQuestSubmissions(team.id, quest.id)
    };
  }

  getTeamSubmissions(teamId: string): readonly Submission[] {
    return this.submissions
      .filter((submission) => submission.teamId === teamId)
      .sort((first, second) =>
        second.submittedAt.localeCompare(first.submittedAt)
      );
  }

  getTeamQuestSubmissions(
    teamId: string,
    questId: string
  ): readonly Submission[] {
    return this.submissions
      .filter(
        (submission) =>
          submission.teamId === teamId && submission.questId === questId
      )
      .sort((first, second) =>
        second.submittedAt.localeCompare(first.submittedAt)
      );
  }

  submitProof(input: SubmitProofInput, submittedAt = new Date().toISOString()):
    SubmitProofResult {
    const questAccess = this.getQuestAccess(input.teamId, input.questSlug);

    if (questAccess.status === "not_found") {
      return { status: "quest_not_found" };
    }

    const existingTeamSubmissions = this.getTeamQuestSubmissions(
      input.teamId,
      questAccess.quest.id
    );
    const permission = canSubmitProof(
      input.teamId,
      questAccess.quest.id,
      existingTeamSubmissions,
      [questAccess.progress]
    );

    if (!permission.allowed) {
      return { status: "blocked", reason: permission.reason };
    }

    const created = createSubmissionDraft(
      {
        id: this.createSubmissionId(),
        teamId: input.teamId,
        questId: questAccess.quest.id,
        contributorName: input.contributorName,
        proofKind: questAccess.quest.proofKind,
        proofValue: input.proofValue,
        note: input.note
      },
      questAccess.progress,
      submittedAt
    );

    this.submissions = [...this.submissions, created.submission];
    this.progressRows = this.progressRows.map((progress) =>
      progress.id === created.progress.id ? created.progress : progress
    );

    return {
      status: "created",
      submission: created.submission,
      progress: created.progress
    };
  }

  seedRejectedSubmission(
    teamId: string,
    questSlug: string,
    rejectedAt = "2026-05-21T08:00:00.000Z"
  ): Submission | null {
    const questAccess = this.getQuestAccess(teamId, questSlug);

    if (questAccess.status === "not_found") {
      return null;
    }

    const rejectedSubmission: Submission = {
      id: this.createSubmissionId(),
      teamId,
      questId: questAccess.quest.id,
      contributorName: "Test",
      proofKind: questAccess.quest.proofKind,
      proofValue:
        questAccess.quest.proofKind === "text_response"
          ? "stara odpowiedz"
          : "https://example.com/stary-dowod",
      note: null,
      status: "rejected",
      rejectionReason: "wrong_proof",
      rejectionMessage: "Poprawcie dowod i wyslijcie ponownie.",
      submittedAt: rejectedAt,
      reviewedAt: rejectedAt
    };

    this.submissions = [...this.submissions, rejectedSubmission];
    this.progressRows = this.progressRows.map((progress) =>
      progress.id === questAccess.progress.id
        ? { ...progress, status: "rejected", approvedAt: null, skippedAt: null }
        : progress
    );

    return rejectedSubmission;
  }

  snapshot(): PlayerRepositorySnapshot {
    return {
      teams: this.teams,
      quests: this.quests,
      progressRows: this.progressRows,
      submissions: this.submissions
    };
  }

  replaceTeam(team: Team): void {
    this.teams = this.teams.map((row) => (row.id === team.id ? team : row));
  }

  replaceProgress(progress: TeamQuestProgress): void {
    this.progressRows = this.progressRows.map((row) =>
      row.id === progress.id ? progress : row
    );
  }

  addSubmission(submission: Submission): void {
    this.submissions = [...this.submissions, submission];
    this.nextSubmissionNumber = this.submissions.length + 1;
  }

  createReplacementSubmissionId(): string {
    return this.createSubmissionId();
  }

  private getOrCreateProgress(teamId: string, questId: string): TeamQuestProgress {
    const progress = this.progressRows.find(
      (row) => row.teamId === teamId && row.questId === questId
    );

    if (progress) {
      return progress;
    }

    const newProgress: TeamQuestProgress = {
      id: `${teamId}-${questId}`,
      teamId,
      questId,
      status: "not_started",
      hintUsedAt: null,
      approvedAt: null,
      skippedAt: null
    };
    this.progressRows = [...this.progressRows, newProgress];
    return newProgress;
  }

  private createSubmissionId(): string {
    const id = `submission-${this.nextSubmissionNumber.toString().padStart(4, "0")}`;
    this.nextSubmissionNumber += 1;
    return id;
  }
}

export const createInitialSnapshot = (): PlayerRepositorySnapshot => ({
  teams: phase1Teams,
  quests: phase1Quests,
  progressRows: phase1TeamQuestProgress,
  submissions: []
});

const globalStore = globalThis as typeof globalThis & {
  missionPlayerRepository?: PlayerRepository;
};

export const getPlayerRepository = (): PlayerRepository => {
  globalStore.missionPlayerRepository ??= new PlayerRepository();
  return globalStore.missionPlayerRepository;
};

export const resetPlayerRepositoryForTests = (
  snapshot?: PlayerRepositorySnapshot
): PlayerRepository => {
  globalStore.missionPlayerRepository = new PlayerRepository(snapshot);
  return globalStore.missionPlayerRepository;
};
