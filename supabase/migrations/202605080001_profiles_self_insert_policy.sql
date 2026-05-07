-- Allow authenticated users to bootstrap their own profile row
-- Needed for first login flow where profile may not exist yet.

BEGIN;

DROP POLICY IF EXISTS "profiles self insert" ON profiles;
CREATE POLICY "profiles self insert"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

COMMIT;
