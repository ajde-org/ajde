-- Completes the city catalog with the remaining 24 official towns of North Macedonia.
-- The initial seed (20260920123000) covered the 10 largest; these fill in the rest so routes can be
-- offered between any pair of towns. Latin names drop diacritics (š->s, č->c, ž->z) to match how
-- people type them; the diacritic spellings are kept as aliases so search still resolves them.
insert into public.cities (name_mk, name_en, aliases, lat, lng) values
  ('Берово', 'Berovo', array['берово', 'berovo'], 41.70694, 22.85694),
  ('Богданци', 'Bogdanci', array['богданци', 'bogdanci'], 41.20194, 22.57611),
  ('Дебар', 'Debar', array['дебар', 'debar', 'dibër', 'diber'], 41.52444, 20.52722),
  ('Делчево', 'Delcevo', array['делчево', 'delcevo', 'delčevo', 'delchevo'], 41.96611, 22.77472),
  ('Демир Хисар', 'Demir Hisar', array['демир хисар', 'demir hisar', 'demirhisar'], 41.22139, 21.20361),
  ('Демир Капија', 'Demir Kapija', array['демир капија', 'demir kapija', 'demirkapija'], 41.41028, 22.24472),
  ('Гевгелија', 'Gevgelija', array['гевгелија', 'gevgelija', 'gevgelia'], 41.13944, 22.50167),
  ('Кавадарци', 'Kavadarci', array['кавадарци', 'kavadarci'], 41.43306, 22.01194),
  ('Кичево', 'Kicevo', array['кичево', 'kicevo', 'kičevo', 'kichevo', 'kërçovë', 'kercove'], 41.51417, 20.96306),
  ('Кочани', 'Kocani', array['кочани', 'kocani', 'kočani', 'kochani'], 41.91639, 22.41278),
  ('Кратово', 'Kratovo', array['кратово', 'kratovo'], 42.07833, 22.18056),
  ('Крива Паланка', 'Kriva Palanka', array['крива паланка', 'kriva palanka', 'krivapalanka', 'паланка', 'palanka'], 42.20194, 22.33194),
  ('Крушево', 'Krusevo', array['крушево', 'krusevo', 'kruševo', 'krushevo'], 41.36944, 21.24889),
  ('Македонска Каменица', 'Makedonska Kamenica', array['македонска каменица', 'makedonska kamenica', 'каменица', 'kamenica'], 42.02083, 22.58722),
  ('Македонски Брод', 'Makedonski Brod', array['македонски брод', 'makedonski brod', 'брод', 'brod'], 41.51361, 21.21528),
  ('Неготино', 'Negotino', array['неготино', 'negotino'], 41.48389, 22.08917),
  ('Пехчево', 'Pehcevo', array['пехчево', 'pehcevo', 'pehčevo', 'pehchevo'], 41.76694, 22.88944),
  ('Пробиштип', 'Probistip', array['пробиштип', 'probistip', 'probištip', 'probishtip'], 42.00056, 22.17806),
  ('Радовиш', 'Radovis', array['радовиш', 'radovis', 'radoviš', 'radovish'], 41.63833, 22.46444),
  ('Ресен', 'Resen', array['ресен', 'resen'], 41.08944, 21.01194),
  ('Струга', 'Struga', array['струга', 'struga', 'strugë', 'struge'], 41.17750, 20.67806),
  ('Свети Николе', 'Sveti Nikole', array['свети николе', 'sveti nikole', 'св. николе', 'sv. nikole', 'свети никола'], 41.86722, 21.94361),
  ('Валандово', 'Valandovo', array['валандово', 'valandovo'], 41.31722, 22.56056),
  ('Виница', 'Vinica', array['виница', 'vinica'], 41.88250, 22.50889)
on conflict (name_mk) do update set
  name_en = excluded.name_en,
  aliases = excluded.aliases,
  lat = excluded.lat,
  lng = excluded.lng;
