-- Backfill/fix admin roles for existing accounts
-- 1) Sync profile roles from auth.users app_metadata if available
-- 2) Ensure known admin test accounts have correct role

BEGIN;

-- Sync privileged roles from auth app metadata
UPDATE profiles p
SET role = CASE
  WHEN lower(trim(coalesce(u.raw_app_meta_data ->> 'role', ''))) IN ('super_admin', 'superadmin', 'super admin', 'super-admin') THEN 'super_admin'::user_role
  WHEN lower(trim(coalesce(u.raw_app_meta_data ->> 'role', ''))) IN ('regional_admin', 'regionaladmin', 'regional admin', 'regional-admin', 'adminregion', 'admin_region', 'admin_regional', 'region_admin', 'regionadmin') THEN 'regional_admin'::user_role
  WHEN lower(trim(coalesce(u.raw_app_meta_data ->> 'role', ''))) = 'driver' THEN 'driver'::user_role
  ELSE p.role
END
FROM auth.users u
WHERE u.id = p.id
  AND lower(trim(coalesce(u.raw_app_meta_data ->> 'role', ''))) IN (
    'super_admin', 'superadmin', 'super admin', 'super-admin',
    'regional_admin', 'regionaladmin', 'regional admin', 'regional-admin', 'adminregion', 'admin_region', 'admin_regional', 'region_admin', 'regionadmin',
    'driver'
  );

-- Ensure super admin test account exists + has proper role
INSERT INTO profiles (id, email, full_name, role)
SELECT
  u.id,
  coalesce(u.email, 'test@example.com') as email,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, 'test@example.com'), '@', 1)) as full_name,
  'super_admin'::user_role
FROM auth.users u
WHERE lower(coalesce(u.email, '')) = 'test@example.com'
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  role = 'super_admin'::user_role,
  updated_at = now();

-- Ensure regional admin test account exists + has proper role
INSERT INTO profiles (id, email, full_name, role)
SELECT
  u.id,
  coalesce(u.email, 'adminregion@example.com') as email,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, 'adminregion@example.com'), '@', 1)) as full_name,
  'regional_admin'::user_role
FROM auth.users u
WHERE lower(coalesce(u.email, '')) = 'adminregion@example.com'
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  role = 'regional_admin'::user_role,
  updated_at = now();

COMMIT;
