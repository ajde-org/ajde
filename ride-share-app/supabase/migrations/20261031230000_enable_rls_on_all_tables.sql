-- Row Level Security on every public table (AJDE-16). Before this, only messages, ratings and
-- the two rate-limit tables had RLS, so any signed-in user could read or change other users'
-- rides, bookings, cars and profiles through the API.
--
-- Deploy only after the app that reads contact details through profile_contacts() (20261031220000)
-- and the chat roster through ride_room_roster() (20261031225000) is live: this migration withdraws
-- direct SELECT on contact columns and hides co-passengers' bookings.
--
-- Policies call SECURITY DEFINER helpers where they need another table, so rides and bookings
-- policies never evaluate each other recursively.

-- ---------------------------------------------------------------------------------------------
-- Helpers. All derive the caller from auth.uid(); none accepts a viewer identity.
-- ---------------------------------------------------------------------------------------------

create function public.is_ride_driver(target_ride_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.rides r where r.id = target_ride_id and r.driver_id = auth.uid()
  );
$$;

create function public.is_booking_passenger(target_booking_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.bookings b where b.id = target_booking_id and b.passenger_id = auth.uid()
  );
$$;

-- Mirrors requestEligibility() and canRequestSameGenderRide() in the app.
create function public.can_request_seat(target_ride_id uuid, requested_seats integer)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1
    from public.rides r
    join public.profiles driver on driver.id = r.driver_id
    join public.profiles passenger on passenger.id = auth.uid()
    where r.id = target_ride_id
      and r.driver_id <> auth.uid()
      and r.status = 'published'
      and r.departure_at > now()
      and r.seats_available >= requested_seats
      and (
        r.gender_preference = 'any'
        or (driver.gender in ('woman', 'man', 'non_binary') and driver.gender = passenger.gender)
      )
  );
$$;

-- A ride still taking part in the booking flow: published or full, not yet completed or cancelled.
-- Passengers may cancel only then (cancelling after completion would erase ratings), and drivers
-- may decide requests only before departure. Mirrors the app's "active" trips and canDecide.
create function public.is_ride_active(target_ride_id uuid, before_departure boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rides r
    where r.id = target_ride_id
      and r.status in ('published', 'full')
      and (not before_departure or r.departure_at > now())
  );
$$;

revoke all on function public.is_ride_driver(uuid), public.is_booking_passenger(uuid),
  public.can_request_seat(uuid, integer), public.is_ride_active(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.is_ride_driver(uuid), public.is_booking_passenger(uuid),
  public.can_request_seat(uuid, integer), public.is_ride_active(uuid, boolean)
  to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Catalogs: public, read-only (writes were revoked in 20261031210000).
-- ---------------------------------------------------------------------------------------------

alter table public.cities enable row level security;
alter table public.pickup_points enable row level security;
alter table public.car_models enable row level security;

create policy cities_public_read on public.cities for select to anon, authenticated using (true);
create policy pickup_points_public_read on public.pickup_points for select to anon, authenticated using (true);
create policy car_models_public_read on public.car_models for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------------------------
-- Profiles: public identity, private contacts, owner-only writes.
-- ---------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy profiles_public_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_owner_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_owner_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Contact columns (phone, instagram, facebook, social_url) are read only through
-- profile_contacts(). Column grants do not cover columns added later: a new public profile
-- column needs its own SELECT grant here.
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, photo_url, university, bio, gender, verified_at, created_at,
  updated_at, driver_details)
  on public.profiles to anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Rides: everything but other people's drafts is visible to signed-in users. Rides are created
-- only through create_ride_offer(); drivers may change only the status of their own rides.
-- ---------------------------------------------------------------------------------------------

alter table public.rides enable row level security;

create policy rides_visible on public.rides for select to authenticated
  using (status <> 'draft' or driver_id = auth.uid());
create policy rides_driver_updates_status on public.rides for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

revoke all on public.rides from anon;
revoke insert, update, delete on public.rides from authenticated;
grant update (status) on public.rides to authenticated;

-- Status changes made through the API (anon/authenticated) must follow the ride lifecycle, so a
-- driver cannot, for example, complete a future ride to rate passengers who never travelled, or
-- reopen a completed or cancelled ride. Seat syncing (published <-> full) must match availability.
-- Migrations, the service role and SECURITY DEFINER functions (which run as the owner) are trusted.
create function public.guard_ride_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status or current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if (old.status, new.status) in (('published', 'full'), ('full', 'published')) then
    if (new.status = 'full') = (new.seats_available = 0) then return new; end if;
  elsif old.status in ('published', 'full') and new.status = 'completed' then
    if new.departure_at <= now() then return new; end if;
  elsif old.status in ('published', 'full') and new.status = 'cancelled' then
    if new.departure_at > now() then return new; end if;
  elsif old.status = 'draft' and new.status = 'published' then
    if new.departure_at > now() then return new; end if;
  elsif old.status = 'draft' and new.status = 'cancelled' then
    return new;
  end if;
  raise exception 'A ride cannot change from % to %', old.status, new.status using errcode = '23514';
end;
$$;

revoke execute on function public.guard_ride_status_change() from public, anon, authenticated;

create trigger rides_guard_status_change
before update of status on public.rides
for each row execute function public.guard_ride_status_change();

-- ---------------------------------------------------------------------------------------------
-- Bookings: visible to the passenger and the ride's driver (the chat roster uses
-- ride_room_roster(), created in 20261031225000).
-- Passengers request, and cancel while the ride is active; drivers accept or decline before
-- departure. Seat counts follow via triggers.
-- ---------------------------------------------------------------------------------------------

alter table public.bookings enable row level security;

create policy bookings_visible on public.bookings for select to authenticated
  using (passenger_id = auth.uid() or public.is_ride_driver(ride_id));
create policy bookings_passenger_requests on public.bookings for insert to authenticated
  with check (
    passenger_id = auth.uid()
    and status = 'requested'
    and decided_at is null
    and public.can_request_seat(ride_id, seats)
  );
create policy bookings_driver_decides on public.bookings for update to authenticated
  using (status = 'requested' and public.is_ride_driver(ride_id) and public.is_ride_active(ride_id, true))
  with check (
    status in ('accepted', 'declined')
    and public.is_ride_driver(ride_id)
    and public.is_ride_active(ride_id, true)
    and decided_at between statement_timestamp() - interval '5 minutes'
      and statement_timestamp() + interval '5 minutes'
  );
create policy bookings_passenger_cancels on public.bookings for update to authenticated
  using (passenger_id = auth.uid() and status in ('requested', 'accepted') and public.is_ride_active(ride_id))
  with check (passenger_id = auth.uid() and status = 'cancelled' and decided_at is null);

revoke all on public.bookings from anon;
revoke insert, update, delete on public.bookings from authenticated;
grant insert (ride_id, passenger_id, seats, message) on public.bookings to authenticated;
grant update (status, decided_at) on public.bookings to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Cars: owners see and add their own; anyone signed in sees cars attached to visible rides.
-- ---------------------------------------------------------------------------------------------

alter table public.cars enable row level security;

create policy cars_visible on public.cars for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.rides r where r.car_id = cars.id and r.status <> 'draft')
  );
create policy cars_owner_inserts on public.cars for insert to authenticated
  with check (owner_id = auth.uid());

revoke all on public.cars from anon;
revoke update, delete on public.cars from authenticated;

-- ---------------------------------------------------------------------------------------------
-- Imports: private to their creator.
-- ---------------------------------------------------------------------------------------------

alter table public.imports enable row level security;

create policy imports_creator_reads on public.imports for select to authenticated
  using (created_by = auth.uid());
create policy imports_creator_inserts on public.imports for insert to authenticated
  with check (created_by = auth.uid());

revoke all on public.imports from anon;
revoke update, delete on public.imports from authenticated;

-- ---------------------------------------------------------------------------------------------
-- Trip shares: managed by the booking's passenger. Share links are resolved on the server.
-- ---------------------------------------------------------------------------------------------

alter table public.trip_shares enable row level security;

create policy trip_shares_passenger_reads on public.trip_shares for select to authenticated
  using (public.is_booking_passenger(booking_id));
create policy trip_shares_passenger_creates on public.trip_shares for insert to authenticated
  with check (public.is_booking_passenger(booking_id));
create policy trip_shares_passenger_deletes on public.trip_shares for delete to authenticated
  using (public.is_booking_passenger(booking_id));

revoke all on public.trip_shares from anon;
revoke update on public.trip_shares from authenticated;

-- ---------------------------------------------------------------------------------------------
-- Not used by the app yet: closed until a feature adds policies.
-- ---------------------------------------------------------------------------------------------

alter table public.ride_comments enable row level security;
alter table public.reports enable row level security;

-- ---------------------------------------------------------------------------------------------
-- New tables and sequences start closed. Supabase's defaults grant every API role full access to
-- them, so a migration that forgot RLS would expose its table. From here on a migration grants
-- exactly what each new table or sequence needs, next to its RLS policies.
--
-- Functions keep PostgreSQL's built-in PUBLIC execute: revoking it is only possible for every
-- schema at once, which would also lock the API out of extension functions. Instead
-- supabase/tests/api_privileges.sql pins the functions the API roles may call, and each new
-- function revokes PUBLIC execute and grants what it needs, as the existing ones do.
-- ---------------------------------------------------------------------------------------------

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
