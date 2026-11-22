begin;
insert into public.route_estimates(origin_city_id,dest_city_id,origin_lat,origin_lng,dest_lat,dest_lng,distance_km,duration_minutes)
select a.id,b.id,a.lat,a.lng,b.lat,b.lng,174.3,150 from public.cities a,public.cities b where a.id=1 and b.id=3;
insert into auth.users(id) values ('96000000-0000-4000-8000-000000000001');
insert into public.profiles(id,full_name,photo_url,university)
values ('96000000-0000-4000-8000-000000000001','Timing Verification','https://example.com/photo.png','UKIM');
set local role authenticated;
select set_config('request.jwt.claim.sub','96000000-0000-4000-8000-000000000001',true);
do $$
declare
  offer jsonb := jsonb_build_object('source','native','origin',jsonb_build_object('cityId',1),
    'destination',jsonb_build_object('cityId',3),'departureAt',now()+interval '7 days',
    'seatsTotal',3,'pricePerSeatMkd',400,'tags','[]'::jsonb,'genderPreference','any');
  vehicle jsonb := '{"mode":"manual","make":"Verification","model":"Compact","fuelType":"petrol","consumptionL100Km":6,"seatsTotal":4}';
  result jsonb;
  saved public.rides%rowtype;
begin
  result := public.create_ride_offer(offer || '{"durationMinutes":170}',vehicle,gen_random_uuid());
  select * into saved from public.rides where id=(result->>'rideId')::uuid;
  if saved.duration_minutes <> 170 or saved.estimated_duration_minutes <> 150 then raise exception 'Duration not persisted'; end if;
  begin
    perform public.create_ride_offer(offer || '{"durationMinutes":149}',vehicle,gen_random_uuid());
    raise exception 'Shortened estimate accepted';
  exception when check_violation then null; end;
  begin
    update public.rides set estimated_duration_minutes=1,duration_minutes=2 where id=saved.id;
    raise exception 'Forged baseline accepted';
  exception when check_violation then null; end;
  begin
    insert into public.route_estimates(origin_city_id,dest_city_id,origin_lat,origin_lng,dest_lat,dest_lng,distance_km,duration_minutes)
    values(3,1,0,0,0,0,1,1);
    raise exception 'Client can forge cache';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
