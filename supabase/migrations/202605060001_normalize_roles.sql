-- Migration: Normalize user roles
-- This migration ensures all roles in the profiles table are in the correct format
-- (lowercase with underscores, e.g., 'super_admin', 'regional_admin', 'client')

BEGIN;

-- Update profiles table to normalize role values
UPDATE profiles
SET role = CASE LOWER(TRIM(role::text))
  -- Handle super_admin variants
  WHEN 'super admin' THEN 'super_admin'::user_role
  WHEN 'super-admin' THEN 'super_admin'::user_role
  WHEN 'superadmin' THEN 'super_admin'::user_role
  
  -- Handle regional_admin variants
  WHEN 'regional admin' THEN 'regional_admin'::user_role
  WHEN 'regional-admin' THEN 'regional_admin'::user_role
  WHEN 'regionaladmin' THEN 'regional_admin'::user_role
  
  -- Handle driver
  WHEN 'driver' THEN 'driver'::user_role
  
  -- Handle photographer
  WHEN 'photographer' THEN 'photographer'::user_role
  
  -- Handle guide
  WHEN 'guide' THEN 'guide'::user_role
  
  -- Handle client (default)
  WHEN 'client' THEN 'client'::user_role
  
  -- Default to client if no match
  ELSE 'client'::user_role
END
WHERE role IS NOT NULL;

COMMIT;
