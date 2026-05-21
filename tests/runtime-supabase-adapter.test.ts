import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { SupabaseRuntimeRepository } from "@/lib/runtime/supabase-adapter";
import type { Database } from "@/lib/supabase/database.types";

describe("SupabaseRuntimeRepository", () => {
  it("runs player and admin flows through Supabase tables", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());

    await expect(repository.getTeams()).resolves.toHaveLength(2);
    await expect(repository.getTeam("missing")).resolves.toBeNull();
    await expect(repository.getQuests()).resolves.toHaveLength(2);
    await expect(repository.getQuestBySlug("bad slug")).resolves.toBeNull();
    await expect(repository.getQuestAccess("missing", "amber-vault-k9q4m2x7")).resolves.toEqual({
      status: "not_found"
    });

    const access = await repository.getQuestAccess(
      "team-ember",
      "amber-vault-k9q4m2x7"
    );
    expect(access.status).toBe("found");
    fake.removeProgress("team-iron", "quest-02");
    await expect(
      repository.getQuestAccess("team-iron", "silent-forge-p6t8n3v1")
    ).resolves.toMatchObject({ status: "found" });

    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "amber-vault-k9q4m2x7",
      contributorName: " Ala ",
      proofValue: " https://example.com/proof ",
      note: " note "
    });
    expect(created.status).toBe("created");
    await expect(repository.getTeamSubmissions("team-ember")).resolves.toHaveLength(1);
    await expect(repository.listPendingSubmissions()).resolves.toHaveLength(1);

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    await expect(repository.getPendingSubmission("bad id!")).resolves.toBeNull();
    await expect(repository.getPendingSubmission(created.submission.id)).resolves.toMatchObject({
      team: { id: "team-ember" },
      quest: { id: "quest-01" }
    });

    const approved = await repository.approveSubmission(created.submission.id);
    expect(approved.status).toBe("updated");
    await expect(repository.getTeamMapState("team-ember")).resolves.toMatchObject({
      approvedQuestCount: 1,
      revealedFragmentCount: 1
    });
    await expect(repository.approveSubmission(created.submission.id)).resolves.toEqual({
      status: "not_found"
    });
  });

  it("handles rejected resubmission and missing rows", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());

    await expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: "missing-quest-x1",
        contributorName: "Ala",
        proofValue: "https://example.com/proof",
        note: null
      })
    ).resolves.toEqual({ status: "quest_not_found" });

    const first = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "silent-forge-p6t8n3v1",
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });
    expect(first.status).toBe("created");
    await expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: "silent-forge-p6t8n3v1",
        contributorName: "Ala",
        proofValue: "https://example.com/again",
        note: null
      })
    ).resolves.toEqual({ status: "blocked", reason: "active_submission" });

    if (first.status !== "created") {
      throw new Error("Expected created submission.");
    }

    const rejected = await repository.rejectSubmission({
      submissionId: first.submission.id,
      reason: "other",
      message: " popraw "
    });
    expect(rejected.status).toBe("updated");
    await expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: "silent-forge-p6t8n3v1",
        contributorName: "Ola",
        proofValue: "https://example.com/new",
        note: null
      })
    ).resolves.toMatchObject({ status: "created" });
    await expect(
      repository.rejectSubmission({
        submissionId: "missing",
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "not_found" });
  });

  it("surfaces Supabase query failures", async () => {
    const fake = new FakeSupabase();
    fake.failNext("boom");
    const repository = new SupabaseRuntimeRepository(fake.client());

    await expect(repository.getTeams()).rejects.toThrow("boom");
    fake.nullOnTable("teams");
    await expect(repository.getTeams()).resolves.toEqual([]);
    fake.restoreTeams();
    fake.failNext("single boom");
    await expect(repository.getTeam("team-ember")).rejects.toThrow("single boom");
    fake.clear("app_settings");
    await expect(repository.getTeamMapState("team-ember")).resolves.toMatchObject({
      requiredApprovalCount: 16
    });
    fake.resetSettings();
    fake.failOnTable("app_settings", "row boom");
    await expect(repository.getTeamMapState("team-ember")).rejects.toThrow(
      "row boom"
    );
  });

  it("surfaces Supabase mutation failures", async () => {
    const fake = new FakeSupabase();
    fake.failMutation("insert boom");
    const repository = new SupabaseRuntimeRepository(fake.client());

    await expect(
      repository.submitProof({
        teamId: "team-ember",
        questSlug: "amber-vault-k9q4m2x7",
        contributorName: "Ala",
        proofValue: "https://example.com/proof",
        note: null
      })
    ).rejects.toThrow("insert boom");
  });

  it("omits pending reviews with missing joined context", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());
    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "amber-vault-k9q4m2x7",
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    fake.clear("team_quest_progress");
    await expect(repository.listPendingSubmissions()).resolves.toEqual([]);
  });

  it("returns not found when rejection context disappears after rpc", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());
    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "amber-vault-k9q4m2x7",
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    fake.clearOnRpc("team_quest_progress");
    await expect(
      repository.rejectSubmission({
        submissionId: created.submission.id,
        reason: "other",
        message: null
      })
    ).resolves.toEqual({ status: "not_found" });
  });

  it("returns not found when approval context disappears after rpc", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());
    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "amber-vault-k9q4m2x7",
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    fake.clearOnRpc("team_quest_progress");
    await expect(repository.approveSubmission(created.submission.id)).resolves.toEqual({
      status: "not_found"
    });
  });

  it("runs phase 5 audit and override paths through Supabase tables", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());

    await repository.recordTeamLogin("team-ember");
    await repository.recordTeamLogin("missing");
    await repository.recordQuestView("team-ember", "quest-01");
    await repository.recordQuestView("missing", "quest-01");
    await repository.recordQuestView("team-ember", "missing");

    await expect(repository.revealManualFragment({ teamId: "team-ember" })).resolves.toEqual({
      status: "updated"
    });
    await expect(repository.hideManualFragment({ teamId: "team-ember", reason: "test" })).resolves.toEqual({
      status: "updated"
    });
    await expect(repository.hideManualFragment({ teamId: "missing" })).resolves.toEqual({
      status: "not_found"
    });
    await expect(
      repository.skipQuest({ teamId: "team-ember", questId: "quest-02", reason: "awaria" })
    ).resolves.toEqual({ status: "updated" });
    await expect(
      repository.overrideBrokenQuest({
        teamId: "team-ember",
        questId: "quest-01",
        reason: "awaria"
      })
    ).resolves.toEqual({ status: "updated" });
    await expect(
      repository.enterReplacementProof({
        teamId: "team-iron",
        questId: "quest-01",
        contributorName: "Admin",
        proofKind: "photo_link",
        proofValue: "https://example.com/replacement",
        note: null,
        status: "pending"
      })
    ).resolves.toEqual({ status: "updated" });
    fake.insert("audit_logs", {
      id: "audit-null-context",
      actor_type: "system",
      actor_id: null,
      action: "schema_maintenance",
      team_id: null,
      quest_id: null,
      submission_id: null,
      metadata: {},
      created_at: "2026-05-21T12:00:00.000Z"
    });

    const audits = await repository.listAuditLogs(100);
    expect(audits.length).toBeGreaterThanOrEqual(4);
    expect(audits.map(a => a.audit.action)).toContain("replacement_proof_entered");
    expect(
      audits.find((entry) => entry.audit.id === "audit-null-context")
    ).toMatchObject({
      team: null,
      quest: null,
      submission: null
    });

    await expect(repository.revealManualFragment({ teamId: "missing" })).resolves.toEqual({
      status: "not_found"
    });
    await expect(
      repository.skipQuest({ teamId: "team-ember", questId: "quest-01", reason: "" })
    ).resolves.toMatchObject({ status: "invalid_input" });
    await expect(
      repository.skipQuest({ teamId: "team-ember", questId: "missing", reason: "awaria" })
    ).resolves.toEqual({ status: "not_found" });
    await expect(
      repository.overrideBrokenQuest({
        teamId: "team-ember",
        questId: "quest-01",
        reason: ""
      })
    ).resolves.toMatchObject({ status: "invalid_input" });
    await expect(
      repository.overrideBrokenQuest({
        teamId: "team-ember",
        questId: "missing",
        reason: "awaria"
      })
    ).resolves.toEqual({ status: "not_found" });
    await expect(
      repository.enterReplacementProof({
        teamId: "team-ember",
        questId: "missing",
        contributorName: "Admin",
        proofKind: "photo_link",
        proofValue: "https://example.com/replacement",
        note: null,
        status: "pending"
      })
    ).resolves.toEqual({ status: "not_found" });
    await expect(
      repository.enterReplacementProof({
        teamId: "team-ember",
        questId: "quest-01",
        contributorName: "",
        proofKind: "photo_link",
        proofValue: "https://example.com/replacement",
        note: null,
        status: "pending"
      })
    ).resolves.toMatchObject({ status: "invalid_input" });
  });

  it("handles team rows disappearing during Supabase count sync", async () => {
    const fake = new FakeSupabase();
    const repository = new SupabaseRuntimeRepository(fake.client());
    const created = await repository.submitProof({
      teamId: "team-ember",
      questSlug: "amber-vault-k9q4m2x7",
      contributorName: "Ala",
      proofValue: "https://example.com/proof",
      note: null
    });

    if (created.status !== "created") {
      throw new Error("Expected created submission.");
    }

    fake.clearOnRpc("teams");
    await expect(repository.approveSubmission(created.submission.id)).resolves.toEqual({
      status: "not_found"
    });
  });
});

type TableName =
  | "teams"
  | "quests"
  | "team_quest_progress"
  | "submissions"
  | "app_settings"
  | "audit_logs";

type Row = Record<string, unknown>;

class FakeSupabase {
  private failMessage: string | null = null;
  private mutationFailMessage: string | null = null;
  private failTable: { table: TableName; message: string } | null = null;
  private nullTable: TableName | null = null;
  private rpcClearTable: TableName | null = null;
  private readonly tables: Record<TableName, Row[]> = {
    teams: [
      {
        id: "team-ember",
        name: "Druzyna Zarzewia",
        pin_hash: "hash",
        map_progress_count: 0,
        completed_quest_count: 0,
        created_at: "2026-05-21T09:00:00.000Z"
      },
      {
        id: "team-iron",
        name: "Druzyna Zelaza",
        pin_hash: "hash",
        map_progress_count: 0,
        completed_quest_count: 0,
        created_at: "2026-05-21T09:00:00.000Z"
      }
    ],
    quests: [
      questRow("quest-01", "amber-vault-k9q4m2x7", "photo_link"),
      questRow("quest-02", "silent-forge-p6t8n3v1", "video_link")
    ],
    team_quest_progress: [
      progressRow("team-ember", "quest-01"),
      progressRow("team-ember", "quest-02"),
      progressRow("team-iron", "quest-01"),
      progressRow("team-iron", "quest-02")
    ],
    submissions: [],
    app_settings: [
      {
        id: "global",
        required_approval_count: 16,
        is_paused: false,
        updated_at: "2026-05-21T09:00:00.000Z"
      }
    ],
    audit_logs: []
  };

  client(): SupabaseClient<Database> {
    return {
      from: (table: TableName) => new FakeQuery(this, table),
      rpc: (name: string, args: Record<string, unknown>) => this.rpc(name, args)
    } as unknown as SupabaseClient<Database>;
  }

  failNext(message: string): void {
    this.failMessage = message;
  }

  failMutation(message: string): void {
    this.mutationFailMessage = message;
  }

  clear(table: TableName): void {
    this.tables[table] = [];
  }

  removeProgress(teamId: string, questId: string): void {
    this.tables.team_quest_progress = this.tables.team_quest_progress.filter(
      (row) => row.team_id !== teamId || row.quest_id !== questId
    );
  }

  failOnTable(table: TableName, message: string): void {
    this.failTable = { table, message };
  }

  nullOnTable(table: TableName): void {
    this.nullTable = table;
  }

  restoreTeams(): void {
    this.nullTable = null;
  }

  clearOnRpc(table: TableName): void {
    this.rpcClearTable = table;
  }

  resetSettings(): void {
    this.tables.app_settings = [
      {
        id: "global",
        required_approval_count: 16,
        is_paused: false,
        updated_at: "2026-05-21T09:00:00.000Z"
      }
    ];
  }

  read(table: TableName): Row[] {
    return this.tables[table];
  }

  shouldReturnNull(table: TableName): boolean {
    if (this.nullTable !== table) {
      return false;
    }

    this.nullTable = null;
    return true;
  }

  insert(table: TableName, values: unknown): void {
    const rows = Array.isArray(values) ? values : [values];
    this.tables[table].push(...(rows as Row[]));
  }

  takeMutationFailure(): string | null {
    const message = this.mutationFailMessage;
    this.mutationFailMessage = null;
    return message;
  }

  update(table: TableName, values: Row, column: string, value: string): void {
    this.tables[table] = this.tables[table].map((row) =>
      row[column] === value ? { ...row, ...values } : row
    );
  }

  takeFailure(table: TableName): string | null {
    if (this.failTable?.table === table) {
      const message = this.failTable.message;
      this.failTable = null;
      return message;
    }

    const message = this.failMessage;
    this.failMessage = null;
    return message;
  }

  async rpc(name: string, args: Record<string, unknown>) {
    const submission = this.tables.submissions.find(
      (row) => row.id === args.reviewed_submission_id
    );

    if (!submission || submission.status !== "pending") {
      return { data: { status: "not_found" }, error: null };
    }

    if (name === "approve_submission_for_review") {
      submission.status = "approved";
      submission.reviewed_at = args.reviewed_at_value;
      this.tables.team_quest_progress = this.tables.team_quest_progress.map((row) =>
        row.team_id === submission.team_id && row.quest_id === submission.quest_id
          ? { ...row, status: "approved", approved_at: args.reviewed_at_value }
          : row
      );
    }

    if (name === "reject_submission_for_review") {
      submission.status = "rejected";
      submission.rejection_reason = args.rejection_reason_value;
      submission.rejection_message = args.rejection_message_value;
      submission.reviewed_at = args.reviewed_at_value;
      this.tables.team_quest_progress = this.tables.team_quest_progress.map((row) =>
        row.team_id === submission.team_id && row.quest_id === submission.quest_id
          ? { ...row, status: "rejected", approved_at: null }
          : row
      );
    }

    if (this.rpcClearTable) {
      this.clear(this.rpcClearTable);
      this.rpcClearTable = null;
    }

    return { data: { status: "updated" }, error: null };
  }
}

class FakeQuery {
  private filters: Array<{ column: string; value: unknown }> = [];
  private ascending = true;
  private orderColumn: string | null = null;
  private updateValues: Row | null = null;

  constructor(
    private readonly store: FakeSupabase,
    private readonly table: TableName
  ) {}

  select(): FakeQuery {
    return this;
  }

  eq(column: string, value: unknown): FakeQuery | Promise<{ error: null }> {
    if (this.updateValues) {
      this.store.update(this.table, this.updateValues, column, String(value));
      return Promise.resolve({ error: null });
    }

    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options: { ascending: boolean }): FakeQuery {
    this.orderColumn = column;
    this.ascending = options.ascending;
    return this;
  }

  update(values: Row): FakeQuery {
    this.updateValues = values;
    return this;
  }

  async insert(values: unknown) {
    const failure = this.store.takeMutationFailure();
    if (failure) {
      return { error: { message: failure } };
    }

    this.store.insert(this.table, values);
    return { error: null };
  }

  async maybeSingle() {
    return this.result(this.rows()[0] ?? null);
  }

  async single() {
    return this.result(this.rows()[0] ?? null);
  }

  then<TResult1 = { data: Row[] | null; error: { message: string } | null }>(
    onfulfilled?: (
      value: { data: Row[] | null; error: { message: string } | null }
    ) => TResult1 | PromiseLike<TResult1>
  ) {
    return Promise.resolve(this.result(this.rows())).then(onfulfilled);
  }

  private rows(): Row[] {
    let rows = this.store.read(this.table).filter((row) =>
      this.filters.every((filter) => row[filter.column] === filter.value)
    );

    if (this.orderColumn) {
      rows = [...rows].sort((first, second) => {
        const left = String(first[this.orderColumn ?? ""]);
        const right = String(second[this.orderColumn ?? ""]);
        return this.ascending ? left.localeCompare(right) : right.localeCompare(left);
      });
    }

    return rows;
  }

  private result(data: Row | Row[] | null) {
    const failure = this.store.takeFailure(this.table);
    if (failure) {
      return { data: null, error: { message: failure } };
    }

    return {
      data: this.store.shouldReturnNull(this.table) ? null : data,
      error: null
    };
  }
}

const questRow = (id: string, slug: string, proofKind: string): Row => ({
  id,
  slug,
  title: id,
  flavor_text: "opis",
  instructions: "instrukcja",
  success_criteria: "kryterium",
  safety_warning: "bezpiecznie",
  proof_kind: proofKind,
  hint_text: "podpowiedz",
  is_active: true,
  created_at: "2026-05-21T09:00:00.000Z"
});

const progressRow = (teamId: string, questId: string): Row => ({
  id: `${teamId}-${questId}`,
  team_id: teamId,
  quest_id: questId,
  status: "not_started",
  hint_used_at: null,
  approved_at: null,
  skipped_at: null,
  created_at: "2026-05-21T09:00:00.000Z",
  updated_at: "2026-05-21T09:00:00.000Z"
});
