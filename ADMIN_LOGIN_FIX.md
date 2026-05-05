# Fix: Admin Login Issue for test@example.com

## Problem
User `test@example.com` with `super_admin` role cannot login to `/admin`. Error message: "Akun ini tidak memiliki akses admin dashboard."

## Root Cause Analysis
The login fails because the `isAdminRole()` function in [lib/auth/portal.ts](lib/auth/portal.ts) is returning `false` for the role, even though the role should be `super_admin`.

Possible causes:
1. **Profile entry missing** - The user exists in `auth.users` but NOT in the `profiles` table
2. **Role value format incorrect** - Role might be stored as `"Super Admin"`, `"SUPER_ADMIN"`, `" super_admin "` (with spaces), or other variants
3. **Profile entry NULL** - Role column is NULL or empty

## Quick Manual Fix (Supabase Table Editor)

### Step 1: Verify Profile Exists
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
```sql
SELECT id, email, role FROM profiles WHERE email = 'test@example.com';
```

### Step 2: If Profile Does NOT Exist
Run this SQL to create it:
```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, email || ' User' as full_name, 'super_admin'::user_role
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Step 3: If Profile EXISTS but Role is Wrong
1. Open the `profiles` table in Table Editor
2. Find the row with email `test@example.com`
3. Check the `role` column - it should show one of:
   - `super_admin`
   - `regional_admin`
   - `driver`
   - `client`
   - `photographer`
   - `guide`

4. If role is something else (e.g., `"Super Admin"` with capital S), click the cell and change it to `super_admin` (all lowercase)

5. If role is empty/NULL, click the cell and select `super_admin` from the dropdown

### Step 4: Verify the Fix
After making changes, try logging in at `/admin` with:
- Email: `test@example.com`
- Password: (your password)

## Automatic Fix (Code-Based)

The code has been updated to automatically handle this:

1. **ensureProfileExists()** function added to [actions/auth.ts](actions/auth.ts)
   - Automatically creates profile if it doesn't exist
   - Creates with default `client` role for security

2. **Auth callback updated** to sync profile on OAuth login

3. **Database migration** added to normalize all existing role values

## To Apply Automatic Fix:

1. **Deploy migration:**
   ```bash
   cd /Users/user/Documents/Perkodingan/Jeda
   pnpm supabase migration list
   pnpm supabase db push
   ```

2. **Deploy code changes:**
   - The updated `signInWithEmail()` and callback will auto-create/sync profiles

3. **For test@example.com specifically:**
   - Either manually fix via Supabase Table Editor (Step 1-4 above)
   - OR try logging in again - the new code will auto-create profile with default role
   - Then manually update role to `super_admin` via Table Editor

## Testing

After applying fix, test with:
```bash
curl -X POST http://localhost:3000/api/debug/user-state \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
```json
{
  "found": true,
  "email": "test@example.com",
  "profile": {
    "exists": true,
    "rawRole": "super_admin",
    "normalizedRole": "super_admin",
    "isAdminRole": true
  }
}
```

If `isAdminRole` is still `false`, then the role value in database doesn't match the expected format and needs manual correction.
