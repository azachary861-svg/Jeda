# 🚀 Supabase Migration Deployment Guide

## Problem
Migration file `202605030001_advanced_modules.sql` failed to deploy with error: "Failed to fetch (api.supabase.com)"

## Root Cause
- Supabase CLI auth permission issue
- Project not properly linked to CLI
- Migration file exists locally but not deployed to live database

## ✅ Solution: Deploy via Supabase Dashboard

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com/projects/fmoqxwqusuolkxygqrvv

### Step 2: Navigate to SQL Editor
1. Click **SQL Editor** on left sidebar
2. Click **+ New Query**

### Step 3: Copy Migration SQL
Run these commands in order:

#### 1️⃣ Create ENUMs
```sql
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
```
✅ Run this first

#### 2️⃣ Create All Tables
Copy entire file:
📄 `/supabase/migrations/202605030001_advanced_modules.sql` (lines 27-181)

#### 3️⃣ Run Triggers
Copy lines 182-210

#### 4️⃣ Enable RLS
Copy lines 212-220

#### 5️⃣ Create Policies
Copy remaining SQL (lines 222-EOF)

### Step 4: Verify Deployment
After each step, check:
- **✅ No errors in console**
- **✅ Tables appear in Table Editor sidebar**

## Alternative: Use PostgreSQL Client (if available)

```bash
# Install PostgreSQL client
brew install postgresql@15

# Get connection string from Supabase Dashboard > Settings > Database
psql "postgresql://postgres:[password]@db.fmoqxwqusuolkxygqrvv.supabase.co:5432/postgres" < supabase/migrations/202605030001_advanced_modules.sql
```

## Troubleshooting

### If migration fails:
1. **Check error message** in Supabase Dashboard SQL Editor
2. **Verify all dependencies** exist:
   - `profiles` table ✓
   - `packages` table ✓
   - `bookings` table ✓
   - `regions` table ✓
   - `update_updated_at()` function ✓

3. **Check RLS**: Ensure `current_profile_role()` function exists
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'current_profile_role';
   ```

### Permission Denied Error:
- Ensure you're logged in as **project owner**
- Check **Settings > Access Control** permissions

## ✨ After Deployment
Once migration succeeds:
1. All 10 new tables created ✅
2. RLS policies active ✅
3. Admin pages can now store data in:
   - `marketing_assets`
   - `social_posts`
   - `knowledge_base`
   - `ai_conversations`
   - `ai_messages`
   - `crisis_events`
   - `affiliates`
   - `memberships`
   - `media_purchases`
   - `reward_points`

Ready for Batch 3! 🚀
