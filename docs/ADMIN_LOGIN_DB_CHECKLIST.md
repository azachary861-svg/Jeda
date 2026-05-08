# Admin Login DB Checklist

Gunakan checklist ini setelah deploy migration.

## Query 1 - Auth Users
```sql
select id, email
from auth.users
where lower(email) in ('test@example.com', 'adminregion@example.com');
```

## Query 2 - Profiles
```sql
select id, email, role, region_id, updated_at
from public.profiles
where lower(email) in ('test@example.com', 'adminregion@example.com');
```

## Query 3 - Validasi Enum Role
```sql
select unnest(enum_range(null::user_role)) as allowed_role;
```

## Query 4 - Policy Presence
```sql
select policyname, cmd, permissive, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;
```

## Query 5 - Uji Fungsi Role Runtime
```sql
select auth.uid(), public.current_profile_role(), public.current_profile_region_id();
```

## Expected
- test@example.com = super_admin
- adminregion@example.com = regional_admin
- policy minimal ada:
  - profiles self read
  - profiles admin read
  - profiles self update
  - profiles self insert
