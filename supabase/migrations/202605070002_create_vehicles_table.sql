-- Create vehicles table for fleet management

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references regions(id),
  driver_id uuid references profiles(id),
  plate_number text not null unique,
  brand text not null,
  model text not null,
  year integer,
  capacity integer not null default 4,
  fuel_level integer not null default 100 check (fuel_level >= 0 and fuel_level <= 100),
  status text not null default 'active', -- active | service | inactive
  is_active boolean not null default true,
  is_available boolean not null default true,
  last_service date,
  next_service date,
  service_notes text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vehicles_region_id on vehicles(region_id);
create index if not exists idx_vehicles_driver_id on vehicles(driver_id);
create index if not exists idx_vehicles_status on vehicles(status);
create index if not exists idx_vehicles_next_service on vehicles(next_service);

drop trigger if exists update_vehicles_updated_at on vehicles;
create trigger update_vehicles_updated_at
before update on vehicles
for each row execute function update_updated_at();

alter table vehicles enable row level security;

create policy "vehicles admin region read"
on vehicles for select
using (
  public.current_profile_role() in ('super_admin','regional_admin')
  and (
    public.current_profile_role() = 'super_admin'
    or region_id = public.current_profile_region_id()
  )
);

create policy "vehicles admin region write"
on vehicles for all
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

create policy "vehicles driver read own"
on vehicles for select
using (driver_id = auth.uid());
