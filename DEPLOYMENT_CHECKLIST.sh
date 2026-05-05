#!/bin/bash
# DEPLOYMENT GUIDE: Admin Login Fix
# Run this checklist to deploy the admin login fix

echo "=== Admin Login Fix - Deployment Checklist ==="
echo ""

# Step 1: Apply code changes
echo "✓ Code changes already applied:"
echo "  - apps/web/actions/auth.ts (ensureProfileExists added)"
echo "  - apps/web/app/auth/callback/route.ts (OAuth sync added)"
echo "  - apps/web/app/api/debug/user-state/route.ts (new debug endpoint)"
echo ""

# Step 2: Apply database migration
echo "Step 1: Apply database migration"
echo "  Command: pnpm supabase db push"
echo "  This will run: 202605060001_normalize_roles.sql"
echo ""

# Step 3: Fix test@example.com profile
echo "Step 2: Fix test@example.com profile in Supabase"
echo "  1. Open: https://app.supabase.com → Table Editor → profiles"
echo "  2. Find row with email: test@example.com"
echo "  3. Check 'role' column:"
echo "     - If empty/NULL: Click and select 'super_admin'"
echo "     - If wrong value: Edit to 'super_admin'"
echo "     - If correct: Skip to testing"
echo ""

# Step 4: Test login
echo "Step 3: Test login at http://localhost:3000/admin"
echo "  Email:    test@example.com"
echo "  Password: test123456"
echo "  Expected: Redirect to /dashboard"
echo ""

# Step 5: Verify everything works
echo "Step 4: Run full test suite"
echo "  - Test admin login (/admin)"
echo "  - Test client marketplace (/login)"
echo "  - Test driver app (/driver)"
echo "  - Test OAuth flows"
echo ""

# Debug
echo "=== Debug Endpoint (if needed) ==="
echo "curl -X POST http://localhost:3000/api/debug/user-state \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"password\":\"test123456\"}'"
echo ""

echo "=== Documentation ==="
echo "- QA_ADMIN_LOGIN_FIX.md (comprehensive QA report)"
echo "- ADMIN_LOGIN_FIX.md (quick fix guide)"
echo "- SOLUTION_SUMMARY.md (this summary)"
echo ""

echo "✅ Deployment ready!"
