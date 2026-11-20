-- Update the standard interval while preserving accelerated local test policies.
update public.ai_admission_policies
set burst_refill_seconds = 6300
where policy_group = 'explicit' and burst_refill_seconds = 7200;
