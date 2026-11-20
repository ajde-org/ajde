-- Four 8-point imports from full. Give existing balances the additional capacity.
with expanded as (
  update public.ai_admission_policies set burst_capacity = 32
  where policy_group = 'explicit' and burst_capacity = 16
  returning policy_group
)
update public.ai_admission_buckets b set permits = least(32, b.permits + 16)
from expanded where b.policy_group = expanded.policy_group;
