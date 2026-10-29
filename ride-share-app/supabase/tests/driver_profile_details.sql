begin;
do $$
declare invalid jsonb;
begin
  if not public.valid_driver_details('{"conversation":"warm_up","music":"shared","pets":"ask","smoking":"stops","prompts":[{"id":"superpower","answer":"Finding the best bakery on every route"}]}') then
    raise exception 'Valid driver details rejected';
  end if;
  for invalid in select value from jsonb_array_elements('[
    null, [], {}, {"prompts":null}, {"prompts":{}},
    {"conversation":null,"prompts":[]}, {"music":"invalid","prompts":[]},
    {"phone":"private","prompts":[]},
    {"prompts":[{"id":"snack","answer":""}]},
    {"prompts":[{"id":"unknown","answer":"test"}]},
    {"prompts":[{"id":"snack","answer":"a"},{"id":"snack","answer":"b"}]},
    {"prompts":[{"id":"snack","answer":"a","extra":true}]},
    {"prompts":[{"id":"snack","answer":null}]},
    {"prompts":[{"id":"snack","answer":"a"},{"id":"detour","answer":"b"},{"id":"playlist","answer":"c"},{"id":"superpower","answer":"d"}]}
  ]') loop
    if public.valid_driver_details(invalid) then raise exception 'Accepted invalid driver details: %', invalid; end if;
  end loop;
  if public.valid_driver_details(jsonb_build_object('prompts', jsonb_build_array(jsonb_build_object('id','snack','answer',repeat('x',181))))) then
    raise exception 'Accepted oversized prompt';
  end if;
  begin
    update public.profiles set driver_details = '{"prompts":null}' where id = (select id from public.profiles limit 1);
    raise exception 'Expected driver details check violation';
  exception when check_violation then null;
  end;
end;
$$;
rollback;
