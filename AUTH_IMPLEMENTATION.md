# Authentication Flow - Jeda Wisata

## Overview

Complete Supabase Auth implementation with email/password and OAuth (Google, GitHub) support.

## Files Created/Modified

### 1. **actions/auth.ts** — Server Actions
- `signInWithEmail(email, password)` — Email/password login
- `signUpWithEmail(email, password, fullName)` — User registration
- `signOut()` — Logout user
- `signInWithOAuth(provider)` — OAuth flow (Google/GitHub)

### 2. **app/auth/login/page.tsx** — Login Page
- Email/password form
- Google OAuth button
- GitHub OAuth button
- Error/success messages
- Link to register page

### 3. **app/auth/register/page.tsx** — Register Page
- Full name, email, password fields
- Password confirmation validation
- OAuth buttons
- Success feedback

### 4. **app/auth/callback/route.ts** — OAuth Callback Handler
- Exchanges OAuth code for session
- Handles OAuth errors gracefully
- Redirects after successful auth

## How It Works

### Email/Password Flow

```
1. User fills form on /auth/login
2. Clicks "Masuk" button
3. Server action `signInWithEmail()` called
4. Supabase validates credentials
5. Session created
6. Redirected to home page
```

### OAuth Flow (Google/GitHub)

```
1. User clicks "Google" or "GitHub" button
2. Redirected to OAuth provider
3. User grants permission
4. Provider redirects back to /auth/callback
5. Code exchanged for session via `exchangeCodeForSession()`
6. Redirected to home page
```

### Protected Routes

- `/dashboard` — Requires login + admin role (checked in middleware)
- `/my-bookings` — Requires login (checked in middleware)
- `/profile` — Requires login (checked in middleware)

## Configuration Required

### Supabase Console Setup

1. **Enable Email Provider**
   - Go to Authentication → Providers
   - Enable "Email" provider

2. **Enable Google OAuth**
   - Go to Authentication → Providers → Google
   - Add Google OAuth credentials
   - Redirect URL: `http://localhost:3000/auth/callback`

3. **Enable GitHub OAuth**
   - Go to Authentication → Providers → GitHub
   - Add GitHub OAuth credentials
   - Redirect URL: `http://localhost:3000/auth/callback`

## Environment Variables

Already set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Features

✅ All auth actions run on server (Server Actions)  
✅ No secrets exposed on client  
✅ Password validation (min 6 chars)  
✅ OAuth error handling  
✅ Session management via Supabase SSR  
✅ Middleware protects routes  
✅ User profile auto-created on signup (via database trigger)

## Testing

### Test Email Login
```
Email: test@example.com
Password: test123456
```

### Test OAuth
- Click Google/GitHub buttons
- Grant permissions in OAuth provider
- Verify callback and redirect

## What's Next

- [ ] Add password reset flow
- [ ] Email verification before account active
- [ ] Role-based dashboard redirect (admin vs client)
- [ ] User profile completion after signup
- [ ] Two-factor authentication (optional)
