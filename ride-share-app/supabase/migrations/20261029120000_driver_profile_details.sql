-- Optional public travel preferences and up to three driving prompt answers.
create function public.valid_driver_details(details jsonb)
returns boolean
language plpgsql immutable
set search_path = ''
as $$
declare
  entry jsonb;
  prompt_ids text[] := '{}';
begin
  if jsonb_typeof(details) is distinct from 'object'
    or details - array['conversation', 'music', 'pets', 'smoking', 'prompts'] <> '{}'::jsonb then
    return false;
  end if;
  if details ? 'conversation' and (jsonb_typeof(details->'conversation') <> 'string' or details->>'conversation' not in ('chatty', 'warm_up', 'quiet')) then return false; end if;
  if details ? 'music' and (jsonb_typeof(details->'music') <> 'string' or details->>'music' not in ('playlist', 'shared', 'quiet')) then return false; end if;
  if details ? 'pets' and (jsonb_typeof(details->'pets') <> 'string' or details->>'pets' not in ('welcome', 'ask', 'no_pets')) then return false; end if;
  if details ? 'smoking' and (jsonb_typeof(details->'smoking') <> 'string' or details->>'smoking' not in ('no_smoking', 'stops')) then return false; end if;
  if jsonb_typeof(details->'prompts') is distinct from 'array' then return false; end if;
  if jsonb_array_length(details->'prompts') > 3 then return false; end if;
  for entry in select value from jsonb_array_elements(details->'prompts') loop
    if jsonb_typeof(entry) is distinct from 'object' then return false; end if;
    if entry - array['id', 'answer'] <> '{}'::jsonb
      or jsonb_typeof(entry->'id') is distinct from 'string'
      or jsonb_typeof(entry->'answer') is distinct from 'string' then return false; end if;
    if entry->>'id' not in ('superpower', 'playlist', 'snack', 'detour', 'passenger', 'unpopular_opinion')
      or entry->>'id' = any(prompt_ids)
      or char_length(btrim(entry->>'answer', E' \t\n\r')) not between 1 and 180 then return false; end if;
    prompt_ids := array_append(prompt_ids, entry->>'id');
  end loop;
  return true;
end;
$$;

alter table public.profiles
  add column driver_details jsonb not null default '{"prompts": []}'::jsonb,
  add constraint profiles_driver_details_valid check (public.valid_driver_details(driver_details));

comment on column public.profiles.driver_details is 'Public optional travel descriptors and driving prompt answers; no contact data.';
