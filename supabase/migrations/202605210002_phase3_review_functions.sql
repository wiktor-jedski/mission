create or replace function public.approve_submission_for_review(
  reviewed_submission_id text,
  reviewed_at_value timestamptz
)
returns jsonb
language plpgsql
as $$
declare
  reviewed_submission public.submissions%rowtype;
  approved_count integer;
begin
  select *
  into reviewed_submission
  from public.submissions
  where id = reviewed_submission_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if reviewed_submission.status <> 'pending' then
    return jsonb_build_object('status', 'invalid_transition');
  end if;

  update public.submissions
  set
    status = 'approved',
    rejection_reason = null,
    rejection_message = null,
    reviewed_at = reviewed_at_value
  where id = reviewed_submission.id;

  update public.team_quest_progress
  set
    status = 'approved',
    approved_at = coalesce(approved_at, reviewed_at_value),
    skipped_at = null,
    updated_at = reviewed_at_value
  where team_id = reviewed_submission.team_id
    and quest_id = reviewed_submission.quest_id;

  select count(*)
  into approved_count
  from public.team_quest_progress
  where team_id = reviewed_submission.team_id
    and status = 'approved';

  update public.teams
  set
    completed_quest_count = least(approved_count, 25),
    map_progress_count = least(approved_count, 16)
  where id = reviewed_submission.team_id;

  insert into public.audit_logs (
    id,
    actor_type,
    action,
    team_id,
    quest_id,
    submission_id,
    created_at
  )
  values (
    gen_random_uuid()::text,
    'admin',
    'submission_approved',
    reviewed_submission.team_id,
    reviewed_submission.quest_id,
    reviewed_submission.id,
    reviewed_at_value
  );

  return jsonb_build_object('status', 'updated');
end;
$$;

create or replace function public.reject_submission_for_review(
  reviewed_submission_id text,
  rejection_reason_value text,
  rejection_message_value text,
  reviewed_at_value timestamptz
)
returns jsonb
language plpgsql
as $$
declare
  reviewed_submission public.submissions%rowtype;
begin
  select *
  into reviewed_submission
  from public.submissions
  where id = reviewed_submission_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if reviewed_submission.status <> 'pending' then
    return jsonb_build_object('status', 'invalid_transition');
  end if;

  update public.submissions
  set
    status = 'rejected',
    rejection_reason = rejection_reason_value,
    rejection_message = nullif(trim(coalesce(rejection_message_value, '')), ''),
    reviewed_at = reviewed_at_value
  where id = reviewed_submission.id;

  update public.team_quest_progress
  set
    status = 'rejected',
    approved_at = null,
    skipped_at = null,
    updated_at = reviewed_at_value
  where team_id = reviewed_submission.team_id
    and quest_id = reviewed_submission.quest_id;

  insert into public.audit_logs (
    id,
    actor_type,
    action,
    team_id,
    quest_id,
    submission_id,
    metadata,
    created_at
  )
  values (
    gen_random_uuid()::text,
    'admin',
    'submission_rejected',
    reviewed_submission.team_id,
    reviewed_submission.quest_id,
    reviewed_submission.id,
    jsonb_build_object('reason', rejection_reason_value),
    reviewed_at_value
  );

  return jsonb_build_object('status', 'updated');
end;
$$;
