-- Jeda Wisata Core Schema (Phase Foundation + Booking + Dispatch)
-- Generated: 2026-05-02

create extension if not exists pgcrypto;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending_payment', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM (
    'scheduled', 'driver_en_route', 'picked_up', 'at_destination', 'returning', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'regional_admin', 'driver', 'photographer', 'guide', 'client'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE driver_status AS ENUM ('offline', 'standby', 'on_trip', 'break');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'midtrans_snap', 'bank_transfer', 'credit_card', 'qris', 'stripe', 'stripe_usd', 'stripe_aud', 'stripe_eur'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_name text not null,
  city text not null,
  province text not null,
  latitude decimal(10,8),
  longitude decimal(11,8),
  timezone text default 'Asia/Jakarta',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'client',
  region_id uuid references regions(id),
  is_active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  destination text not null,
  duration_days integer not null,
  base_price bigint not null,
  min_pax integer not null default 1,
  max_pax integer,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule_type text not null,
  multiplier decimal(4,2) not null,
  package_id uuid references packages(id),
  region_id uuid references regions(id),
  start_date date,
  end_date date,
  days_of_week integer[],
  priority integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique,
  client_id uuid not null references profiles(id),
  package_id uuid not null references packages(id),
  region_id uuid not null references regions(id),
  driver_id uuid references profiles(id),
  trip_date date not null,
  pickup_time time not null,
  pickup_location text not null,
  pax_count integer not null,
  notes text,
  base_price bigint not null,
  price_multiplier decimal(4,2) default 1.00,
  total_price bigint not null,
  service_fee bigint default 0,
  photographer_fee bigint default 0,
  grand_total bigint not null,
  currency text default 'IDR',
  payment_method payment_method,
  payment_status text default 'pending',
  midtrans_order_id text,
  stripe_session_id text,
  status booking_status default 'pending_payment',
  booking_source text default 'web',
  add_photographer boolean default false,
  trip_status trip_status,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists driver_locations (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null unique references profiles(id),
  booking_id uuid references bookings(id),
  latitude decimal(10,8) not null,
  longitude decimal(11,8) not null,
  accuracy decimal(6,2),
  speed decimal(6,2),
  heading decimal(5,2),
  status driver_status default 'offline',
  is_sharing boolean default false,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references regions(id),
  booking_id uuid references bookings(id),
  type text not null,
  category text not null,
  amount bigint not null,
  description text not null,
  reference_id text,
  recorded_by uuid references profiles(id),
  transaction_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text not null,
  body text not null,
  type text not null,
  data jsonb default '{}'::jsonb,
  channel text default 'push',
  is_read boolean default false,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function generate_booking_code()
returns text as $$
declare
  new_code text;
  counter integer;
begin
  select count(*) + 1 into counter from bookings;
  new_code := 'JW-' || lpad(counter::text, 4, '0');
  return new_code;
end;
$$ language plpgsql;

create or replace function set_booking_code()
returns trigger as $$
begin
  if new.booking_code is null then
    new.booking_code := generate_booking_code();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists booking_code_trigger on bookings;
create trigger booking_code_trigger
before insert on bookings
for each row execute function set_booking_code();

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at();
drop trigger if exists update_packages_updated_at on packages;
create trigger update_packages_updated_at before update on packages for each row execute function update_updated_at();
drop trigger if exists update_bookings_updated_at on bookings;
create trigger update_bookings_updated_at before update on bookings for each row execute function update_updated_at();
drop trigger if exists update_transactions_updated_at on transactions;
create trigger update_transactions_updated_at before update on transactions for each row execute function update_updated_at();

create or replace function calculate_booking_price(
  p_package_id uuid,
  p_trip_date date,
  p_pax_count integer,
  p_add_photographer boolean default false
)
returns table(
  base_price bigint,
  multiplier decimal,
  photographer_fee bigint,
  service_fee bigint,
  grand_total bigint,
  applied_rule text
) as $$
declare
  v_package packages%rowtype;
  v_rule pricing_rules%rowtype;
  v_multiplier decimal(4,2) := 1.00;
  v_rule_name text := 'Standard';
  v_base bigint;
  v_photo_fee bigint := 0;
  v_svc_fee bigint;
  v_total bigint;
begin
  select * into v_package from packages where id = p_package_id;

  select * into v_rule
  from pricing_rules
  where is_active = true
    and (package_id is null or package_id = p_package_id)
    and (
      (rule_type = 'date_range' and p_trip_date between start_date and end_date)
      or
      (rule_type = 'day_of_week' and extract(dow from p_trip_date) = any(days_of_week))
    )
  order by priority desc, multiplier desc
  limit 1;

  if v_rule.id is not null then
    v_multiplier := v_rule.multiplier;
    v_rule_name := v_rule.name;
  end if;

  v_base := v_package.base_price * p_pax_count;
  if p_add_photographer then
    v_photo_fee := 250000;
  end if;

  v_svc_fee := round(v_base * v_multiplier * 0.02);
  v_total := round(v_base * v_multiplier) + v_photo_fee + v_svc_fee;

  return query select
    v_package.base_price,
    v_multiplier,
    v_photo_fee,
    v_svc_fee,
    v_total,
    v_rule_name;
end;
$$ language plpgsql;

create index if not exists idx_bookings_client_id on bookings(client_id);
create index if not exists idx_bookings_region_id on bookings(region_id);
create index if not exists idx_bookings_trip_date on bookings(trip_date);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_driver_locations_driver_id on driver_locations(driver_id);
create index if not exists idx_driver_locations_is_sharing on driver_locations(is_sharing) where is_sharing = true;

alter table regions enable row level security;
alter table profiles enable row level security;
alter table packages enable row level security;
alter table pricing_rules enable row level security;
alter table bookings enable row level security;
alter table driver_locations enable row level security;
alter table transactions enable row level security;
alter table notifications enable row level security;

create or replace function public.current_profile_role()
returns user_role
language sql
stable
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.current_profile_region_id()
returns uuid
language sql
stable
as $$
  select region_id from profiles where id = auth.uid();
$$;

-- Regions policies
create policy "regions readable by authenticated"
on regions for select
using (auth.uid() is not null);

-- Profiles policies
create policy "profiles self read"
on profiles for select
using (id = auth.uid());

create policy "profiles admin read"
on profiles for select
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

create policy "profiles self update"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Packages policies
create policy "packages public read active"
on packages for select
using (is_active = true);

create policy "packages admin write"
on packages for all
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

-- Pricing rules policies
create policy "pricing rules public read active"
on pricing_rules for select
using (is_active = true);

create policy "pricing rules admin write"
on pricing_rules for all
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id is null
    or region_id = public.current_profile_region_id()
  )
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id is null
    or region_id = public.current_profile_region_id()
  )
);

-- Bookings policies
create policy "bookings client self read"
on bookings for select
using (client_id = auth.uid());

create policy "bookings client create self"
on bookings for insert
with check (client_id = auth.uid());

create policy "bookings admin region read"
on bookings for select
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

create policy "bookings admin region update"
on bookings for update
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

-- Driver locations policies
create policy "driver locations public for shared only"
on driver_locations for select
using (is_sharing = true);

create policy "driver locations driver upsert own"
on driver_locations for all
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

create policy "driver locations admin region read"
on driver_locations for select
using (
  public.current_profile_role() in ('super_admin','regional_admin')
);

-- Transactions policies
create policy "transactions admin region read"
on transactions for select
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

create policy "transactions admin region write"
on transactions for all
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

-- Notifications policies
create policy "notifications self read"
on notifications for select
using (user_id = auth.uid());

create policy "notifications self update"
on notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notifications admin write"
on notifications for insert
with check (public.current_profile_role() in ('super_admin','regional_admin'));
