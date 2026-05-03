-- Phase next: Reviews + Driver Verification

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) unique,
  client_id uuid not null references profiles(id),
  driver_id uuid references profiles(id),
  package_id uuid not null references packages(id),
  rating integer not null check (rating between 1 and 5),
  driver_rating integer check (driver_rating between 1 and 5),
  photo_rating integer check (photo_rating between 1 and 5),
  comment text,
  is_published boolean default true,
  is_featured boolean default false,
  reply text,
  replied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists driver_verifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null unique references profiles(id),
  ktp_url text,
  ktp_number text,
  ktp_verified boolean default false,
  sim_url text,
  sim_number text,
  sim_expiry date,
  sim_verified boolean default false,
  stnk_url text,
  stnk_number text,
  stnk_expiry date,
  stnk_verified boolean default false,
  skck_url text,
  skck_expiry date,
  skck_verified boolean default false,
  first_aid_cert_url text,
  first_aid_expiry date,
  first_aid_verified boolean default false,
  driver_training_url text,
  training_date date,
  training_verified boolean default false,
  has_insurance boolean default false,
  insurance_provider text,
  insurance_number text,
  insurance_expiry date,
  overall_status verification_status default 'pending',
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  rejection_reason text,
  notes text,
  next_review_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reviews_package_id on reviews(package_id);
create index if not exists idx_reviews_client_id on reviews(client_id);
create index if not exists idx_driver_verifications_status on driver_verifications(overall_status);

drop trigger if exists update_reviews_updated_at on reviews;
create trigger update_reviews_updated_at before update on reviews for each row execute function update_updated_at();

drop trigger if exists update_driver_verifications_updated_at on driver_verifications;
create trigger update_driver_verifications_updated_at before update on driver_verifications for each row execute function update_updated_at();

alter table reviews enable row level security;
alter table driver_verifications enable row level security;

-- reviews policies
create policy "reviews public read published"
on reviews for select
using (is_published = true);

create policy "reviews client create own"
on reviews for insert
with check (client_id = auth.uid());

create policy "reviews client read own"
on reviews for select
using (client_id = auth.uid());

create policy "reviews admin manage"
on reviews for all
using (
  public.current_profile_role() in ('super_admin','regional_admin')
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
);

-- driver verifications policies
create policy "driver verification self read"
on driver_verifications for select
using (driver_id = auth.uid());

create policy "driver verification self upsert"
on driver_verifications for all
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

create policy "driver verification admin manage"
on driver_verifications for all
using (
  public.current_profile_role() in ('super_admin','regional_admin')
)
with check (
  public.current_profile_role() in ('super_admin','regional_admin')
);
