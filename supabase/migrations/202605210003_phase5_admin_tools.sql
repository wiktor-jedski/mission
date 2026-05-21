alter table public.audit_logs
  drop constraint if exists audit_logs_action_check;

alter table public.audit_logs
  add constraint audit_logs_action_check
  check (
    action in (
      'team_login',
      'quest_viewed',
      'submission_created',
      'submission_approved',
      'submission_rejected',
      'hint_used',
      'manual_fragment_revealed',
      'manual_fragment_hidden',
      'quest_skipped',
      'broken_quest_overridden',
      'replacement_proof_entered',
      'admin_override',
      'progress_changed',
      'seed_validated',
      'schema_maintenance'
    )
  );
