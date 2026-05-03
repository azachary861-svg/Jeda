# 🔧 Supabase Migration Deployment - Troubleshooting & Solution

**Date:** May 3, 2026  
**Project:** Jeda Wisata (Batch 2 Completion)  
**Issue:** Failed to deploy migration `202605030001_advanced_modules.sql`

---

## 📊 Problem Summary

### Error Message
```
Failed to fetch (api.supabase.com) error saat migrasi ke supabase
```

### Root Cause
1. **Supabase CLI authentication issue** - Permission denied accessing remote project
2. **Project linking failed** - CLI tried to link wrong project (palawa-system instead of jeda)
3. **Migration not deployed** - File created locally but never executed on live database

---

## ✅ Solution: Manual Deployment via Dashboard

### Why Manual?
- Supabase CLI has permission restrictions in this setup
- Direct PostgreSQL client not available
- Dashboard SQL Editor is fastest & most reliable option

### 🚀 Step-by-Step Deployment

#### 1. Open Supabase Dashboard
```
URL: https://app.supabase.com/projects/fmoqxwqusuolkxygqrvv
```

#### 2. Go to SQL Editor
- Click **SQL Editor** on left sidebar
- Click **+ New Query**

#### 3. Copy-Paste Migration SQL
File location: `DEPLOY_MIGRATION_MANUAL.sql` (in repo root)

**Execution order:**
1. **STEP 1:** Create ENUMs (lines 1-25)
2. **STEP 2:** Create Tables (lines 27-175)
3. **STEP 3:** Create Triggers (lines 177-210)
4. **STEP 4:** Enable RLS (lines 212-220)
5. **STEP 5:** Create Policies (lines 222-EOF)

**Recommendation:** Run entire script at once - all SQL is wrapped in `IF NOT EXISTS` conditions to avoid errors.

#### 4. Verify Success
After running SQL, check:
- ✅ No errors in console
- ✅ 10 new tables appear in sidebar:
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

---

## 🎯 What Migration Does

### New Tables (10 total)

| Table | Purpose | Key Fields |
|---|---|---|
| `marketing_assets` | Image/video storage metadata | content_type, storage_path, public_url, tags |
| `social_posts` | Social media scheduling | platform, caption, scheduled_at, status |
| `knowledge_base` | AI RAG knowledge | category, title, content, language |
| `ai_conversations` | Client chat history | client_id, channel, booking_id, status |
| `ai_messages` | Individual chat messages | conversation_id, role, content, intent |
| `crisis_events` | Incident management | crisis_type, severity, status, reported_by |
| `affiliates` | Referral program | referral_code, commission_rate, total_earned |
| `memberships` | Subscription plans | client_id, plan, started_at, expires_at |
| `media_purchases` | Photo digital sales | client_id, media_ids, total_price, status |
| `reward_points` | Loyalty points | client_id, points, type, source |

### ENUMs Created
- `content_type` = image, video, document
- `social_platform` = instagram, tiktok, youtube, facebook
- `post_status` = draft, scheduled, published, failed
- `crisis_type` = accident, medical, weather, security, operational
- `crisis_severity` = low, medium, high, critical

### RLS Policies
- **Admin access:** `super_admin` and `regional_admin` roles have full CRUD
- **Client access:** Only read own data (memberships, media_purchases, reward_points, ai_conversations)

---

## 🔍 Troubleshooting

### If you get "ERROR: relation ... already exists"
✅ This is OK - migration uses `IF NOT EXISTS` and wrapped `DO $$ EXCEPTION WHEN duplicate_object THEN null`

### If you get "ERROR: function update_updated_at does not exist"
⚠️ This means core migration `202605020001_init_core.sql` wasn't deployed  
**Fix:** Deploy earlier migrations first:
1. `202605020001_init_core.sql`
2. `202605020002_seed_regions.sql`
3. `202605020003_transactions_reference_unique.sql`
4. `202605020004_reviews_and_verification.sql`
5. `202605030001_advanced_modules.sql` ← our target

### If you get "ERROR: function current_profile_role does not exist"
⚠️ RLS policies need this custom function  
**Fix:** Create in SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;
```

---

## 📋 Files Generated

| File | Purpose |
|---|---|
| `DEPLOY_MIGRATION_MANUAL.sql` | Complete migration SQL ready to copy-paste |
| `MIGRATION_DEPLOYMENT.md` | Detailed deployment guide |
| `supabase/migrations/202605030001_advanced_modules.sql` | Original migration file (already exists) |

---

## 🎯 Next Steps After Deployment

### 1. Verify Tables in Next.js
```typescript
// In your API route
const { data, error } = await supabase
  .from('marketing_assets')
  .select('*')
  .limit(1);

console.log(error?.message); // Should be null if migration succeeded
```

### 2. Resume Batch 3 Implementation
Once migration is live:
- ✅ Marketplace pages can use `packages` data
- ✅ CRM page can store `ai_conversations`
- ✅ Marketing can use `social_posts` for scheduling
- ✅ Finance can track `affiliates` commissions

### 3. Commit Migration (if using git)
```bash
git add supabase/migrations/202605030001_advanced_modules.sql
git commit -m "feat: add advanced modules migration (marketing, AI, affiliates, memberships)"
git push
```

---

## ⏱️ Timeline

| Phase | Status | Notes |
|---|---|---|
| **Batch 1** | ✅ Complete | 7 admin pages + core features deployed |
| **Batch 2** | ✅ Code Complete | Maps, trip detail, CRM, API auth standardization |
| **Migration** | ⏳ Pending | Waiting for manual SQL deployment to Supabase |
| **Batch 3** | 🔜 Ready | Marketplace, real-trip-maps, payment webhooks, analytics |

---

## 📞 Support

If deployment still fails:
1. Check **Settings > Database** for connection details
2. Verify **Auth > Policies** RLS is enabled
3. Try running queries individually instead of all at once
4. Check **Logs** in Supabase Dashboard for detailed error

---

**Migration Status:** Ready to Deploy  
**Expected Time:** < 30 seconds  
**Risk Level:** Low (IF NOT EXISTS everywhere, non-destructive)
