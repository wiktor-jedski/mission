import type {
  ActorType,
  AuditAction,
  ProofKind,
  RejectionReason,
  SubmissionStatus,
  TeamQuestStatus
} from "../domain/constants";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: "global";
          required_approval_count: number;
          is_paused: boolean;
          updated_at: string;
        };
        Insert: {
          id?: "global";
          required_approval_count?: number;
          is_paused?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: "global";
          required_approval_count?: number;
          is_paused?: boolean;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_type: ActorType;
          actor_id: string | null;
          action: AuditAction;
          team_id: string | null;
          quest_id: string | null;
          submission_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          actor_type: ActorType;
          actor_id?: string | null;
          action: AuditAction;
          team_id?: string | null;
          quest_id?: string | null;
          submission_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          actor_type?: ActorType;
          actor_id?: string | null;
          action?: AuditAction;
          team_id?: string | null;
          quest_id?: string | null;
          submission_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          slug: string;
          title: string;
          flavor_text: string;
          instructions: string;
          success_criteria: string;
          safety_warning: string;
          proof_kind: ProofKind;
          hint_text: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          flavor_text: string;
          instructions: string;
          success_criteria: string;
          safety_warning: string;
          proof_kind: ProofKind;
          hint_text?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quests"]["Insert"]>;
      };
      submissions: {
        Row: {
          id: string;
          team_id: string;
          quest_id: string;
          contributor_name: string;
          proof_kind: ProofKind;
          proof_value: string;
          note: string | null;
          status: SubmissionStatus;
          rejection_reason: RejectionReason | null;
          rejection_message: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id: string;
          team_id: string;
          quest_id: string;
          contributor_name: string;
          proof_kind: ProofKind;
          proof_value: string;
          note?: string | null;
          status?: SubmissionStatus;
          rejection_reason?: RejectionReason | null;
          rejection_message?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["submissions"]["Insert"]>;
      };
      team_quest_progress: {
        Row: {
          id: string;
          team_id: string;
          quest_id: string;
          status: TeamQuestStatus;
          hint_used_at: string | null;
          approved_at: string | null;
          skipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          team_id: string;
          quest_id: string;
          status?: TeamQuestStatus;
          hint_used_at?: string | null;
          approved_at?: string | null;
          skipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_quest_progress"]["Insert"]>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          pin_hash: string;
          map_progress_count: number;
          completed_quest_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          pin_hash: string;
          map_progress_count?: number;
          completed_quest_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
    };
  };
};
