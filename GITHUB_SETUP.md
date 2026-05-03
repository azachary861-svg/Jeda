# GitHub Repository Setup

## 1. Connect to Remote Repository

```bash
cd /Users/user/Documents/Perkodingan/Jeda

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify remote is added
git remote -v

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

## 2. Environment Variables

### Local Development (`.env.local`)
Already created with Supabase credentials. Never commit this file.

### GitHub Secrets Setup
Go to: `Settings → Secrets and variables → Actions`

Add these secrets:
```
SUPABASE_URL=https://supabase.com/dashboard/project/fmoqxwqusuolkxygqrvv
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

## 3. CI/CD Configuration
GitHub Actions workflow is ready at `.github/workflows/ci.yml`

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

## 4. Deployment Setup
Ready for:
- **Frontend**: Vercel (connect GitHub repo directly)
- **Backend**: Supabase (migrations auto-apply on push)
- **Webhooks**: Configure in Midtrans & Stripe dashboards

## 5. Supabase Migrations
Run locally before push:
```bash
pnpm --filter web run db:push
```

## 6. Branch Protection (Optional)
Recommended settings:
- Require PR reviews
- Require status checks to pass (CI/CD)
- Require branches to be up to date before merging
