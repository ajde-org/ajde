-- Undoes 20260923120000_seed_remaining_macedonian_cities.sql.
-- Run it by hand (psql, or the Supabase SQL editor) if the wider city catalog needs to be pulled
-- back; it is deliberately NOT a migration so it never runs as part of a normal deploy.
--
--   psql "$DATABASE_URL" -f scripts/rollback-remaining-macedonian-cities.sql
--
-- Cities referenced by a ride are kept, because rides.origin_city_id / dest_city_id have no
-- on-delete behavior and deleting one would abort the whole transaction. Those are reported as a
-- notice instead. Deleting a city cascades to its pickup points, which is intended here: none of
-- these 24 towns had pickup points before the seed.
do $$
declare
  seeded constant text[] := array[
    'Берово', 'Богданци', 'Дебар', 'Делчево', 'Демир Хисар', 'Демир Капија',
    'Гевгелија', 'Кавадарци', 'Кичево', 'Кочани', 'Кратово', 'Крива Паланка',
    'Крушево', 'Македонска Каменица', 'Македонски Брод', 'Неготино', 'Пехчево',
    'Пробиштип', 'Радовиш', 'Ресен', 'Струга', 'Свети Николе', 'Валандово', 'Виница'
  ];
  kept text[];
  removed integer;
begin
  select array_agg(c.name_mk order by c.name_mk)
  into kept
  from public.cities c
  where c.name_mk = any (seeded)
    and exists (
      select 1
      from public.rides r
      where r.origin_city_id = c.id or r.dest_city_id = c.id
    );

  with deleted as (
    delete from public.cities c
    where c.name_mk = any (seeded)
      and not exists (
        select 1
        from public.rides r
        where r.origin_city_id = c.id or r.dest_city_id = c.id
      )
    returning 1
  )
  select count(*) into removed from deleted;

  raise notice 'Removed % seeded cities.', removed;

  if kept is not null then
    raise notice 'Kept % city/cities still referenced by rides: %', array_length(kept, 1), array_to_string(kept, ', ');
  end if;
end;
$$;
