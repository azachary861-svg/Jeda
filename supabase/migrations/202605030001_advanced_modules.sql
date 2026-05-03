-- Batch 2: Advanced modules for Admin CRM/Marketing/AI/Revenue extensions
-- Date: 2026-05-03

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('image', 'video', 'document');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'facebook');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE crisis_type AS ENUM ('accident', 'medical', 'weather', 'security', 'operational');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE crisis_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

create table if not exists marketing_assets (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references regions(id),
  title text not null,
  content_type content_type not null,
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  file_size bigint,
  duration_sec integer,
  tags text[],
  package_id uuid references packages(id),
  uploaded_by uuid references profiles(id),
  source text default 'manual',
  times_posted integer default 0,
  last_posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references marketing_assets(id),
  platform social_platform not null,
  caption text,
  hashtags text[],
  scheduled_at timestamptz not null,
  published_at timestamptz,
  status post_status default 'draft',
  platform_post_id text,
  retry_count integer default 0,
  error_message text,
  reach integer,
  likes integer,
  comments integer,
  shares integer,
  engagement_rate decimal(5,2),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  language text default 'id',
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id),
  channel text not null,
  channel_user_id text,
  booking_id uuid references bookings(id),
  status text default 'active',
  escalated_to uuid references profiles(id),
  escalation_reason text,
  resolved_at timestamptz,
  csat_score integer check (csat_score between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  intent text,
  confidence decimal(4,2),
  is_ai_generated boolean default true,
  tokens_used integer,
  created_at timestamptz default now()
);

create table if not exists crisis_events (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references regions(id),
  booking_id uuid references bookings(id),
  driver_id uuid references profiles(id),
  crisis_type crisis_type not null,
  severity crisis_severity not null,
  title text not null,
  description text,
  action_taken text,
  reported_by uuid references profiles(id),
  resolved_by uuid references profiles(id),
  client_notified boolean default false,
  status text default 'open',
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  email text not null unique,
  phone text,
  referral_code text not null unique,
  commission_rate decimal(4,2) default 0.07,
  total_referrals integer default 0,
  total_earned bigint default 0,
  total_paid bigint default 0,
  is_active boolean default true,
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) unique,
  plan text not null default 'basic',
  price_idr bigint not null,
  discount_rate decimal(4,2) default 0.10,
  started_at date not null default current_date,
  expires_at date not null,
  stripe_sub_id text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists media_purchases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  booking_id uuid references bookings(id),
  media_ids uuid[] not null,
  total_price bigint not null,
  payment_id text,
  status text default 'pending',
  download_url text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reward_points (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  points integer not null,
  type text not null,
  source text,
  booking_id uuid references bookings(id),
  description text,
  created_at timestamptz default now()
);

-- Updated at triggers
DO $$ BEGIN
  CREATE TRIGGER update_marketing_assets_updated_at BEFORE UPDATE ON marketing_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_crisis_events_updated_at BEFORE UPDATE ON crisis_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_media_purchases_updated_at BEFORE UPDATE ON media_purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- RLS
alter table marketing_assets enable row level security;
alter table social_posts enable row level security;
alter table knowledge_base enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table crisis_events enable row level security;
alter table affiliates enable row level security;
alter table memberships enable row level security;
alter table media_purchases enable row level security;
alter table reward_points enable row level security;

-- Admin full manage policies
create policy "marketing_assets admin manage"
on marketing_assets for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "social_posts admin manage"
on social_posts for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "knowledge_base admin manage"
on knowledge_base for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "ai_conversations admin manage"
on ai_conversations for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "ai_messages admin manage"
on ai_messages for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "crisis_events admin manage"
on crisis_events for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "affiliates admin manage"
on affiliates for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "memberships admin manage"
on memberships for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "media_purchases admin manage"
on media_purchases for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

create policy "reward_points admin manage"
on reward_points for all
using (public.current_profile_role() in ('super_admin','regional_admin'))
with check (public.current_profile_role() in ('super_admin','regional_admin'));

-- client scoped policies
create policy "memberships client own read"
on memberships for select
using (client_id = auth.uid());

create policy "media_purchases client own read"
on media_purchases for select
using (client_id = auth.uid());

create policy "reward_points client own read"
on reward_points for select
using (client_id = auth.uid());

create policy "ai_conversations client own read"
on ai_conversations for select
using (client_id = auth.uid());

create policy "ai_messages client own read"
on ai_messages for select
using (
  exists (
    select 1
    from ai_conversations c
    where c.id = ai_messages.conversation_id
      and c.client_id = auth.uid()
  )
);
