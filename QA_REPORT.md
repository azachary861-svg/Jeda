# QA Report: Admin Dashboard & Platform Progress
**Date:** May 3, 2026  
**Reviewer:** QA Analyst  
**Status:** ❌ Incomplete — Many Critical Features Missing

---

## Summary

Jeda Wisata application is in early foundation stage. The database schema (PostgreSQL + Supabase) is properly set up with core entities (bookings, profiles, packages, transactions, notifications), but the **Admin Dashboard is severely incomplete** compared to the technical specification. Currently implemented are basic CRUD operations for bookings, dispatch, verification, and finance. **Missing are 80% of required features** including: real-time data feeds, comprehensive analytics, pricing rules UI, dynamic pricing, real trip maps, CRM, team/fleet management, marketing automation, and AI agent integration.

Frontend marketplace is minimal (homepage only). Database migrations exist for core tables, but missing tables for advanced features (marketing_assets, social_posts, ai_conversations, crisis_events, affiliates, memberships, etc.).

**Critical blockers for MVP:** Missing real-time subscriptions in admin dashboard, incomplete finance module, no pagination/filtering, incomplete API routes, and fragmented UI components.

---

## 🔴 Critical — Must Implement Before MVP

### [CRITICAL-01] Admin Dashboard Missing Real-Time Data & Live Feed
**File:** [apps/web/app/(admin)/dashboard/page.tsx](apps/web/app/(admin)/dashboard/page.tsx)  
**Problem:**  
Spec requires a live operations feed showing trip events, booking alerts, and system status with Supabase Realtime subscriptions. Current implementation only shows static card counters with hard-coded bookings and packages count. No real-time channel subscription, no alert system, no per-region breakdown, no performance metrics.

**Impact:**  
Admin cannot monitor active operations, cannot see live trip status, cannot detect urgent issues (unassigned bookings, driver problems). Complete lack of operational visibility.

**Required Implementation:**
```typescript
// apps/web/app/(admin)/dashboard/page.tsx should include:
// 1. Real-time subscriptions to bookings table (status changes)
// 2. Real-time subscriptions to driver_locations (active trips)
// 3. Real-time subscriptions to notifications for system alerts
// 4. Per-region breakdown component
// 5. Live feed component showing last 20 events
// 6. Alert banner for urgent conditions:
//    - Bookings unassigned > 24 hours
//    - Driver certifications expiring
//    - New 5-star reviews

const channel = supabase
  .channel('hq-live-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings'
  }, handleNewBooking)
  .subscribe();
```

---

### [CRITICAL-02] Dispatch Center Missing Map Visualization & Auto-Dispatch Algorithm
**File:** [apps/web/components/admin/dispatch-panel.tsx](apps/web/components/admin/dispatch-panel.tsx), `/api/admin/dispatch`  
**Problem:**  
Spec requires Mapbox GL map with driver pins, region visualization, live GPS tracking, and one-click auto-dispatch. Current implementation has only dropdown selectors for booking and driver. No map, no visual assignment flow, no auto-dispatch algorithm, no GPS tracking visualization.

**Impact:**  
Cannot visually manage dispatch across regions. Cannot see driver locations in real-time. Cannot bulk-assign drivers automatically. Admin must manually scroll through dropdowns to find bookings and drivers.

**Required:**
1. Implement Mapbox GL component for dispatch visualization
2. Display driver locations with status colors (green=on_trip, gray=standby, red=needs_assign)
3. Show unassigned booking pins
4. Implement "Assign Semua Otomatis" button triggering Edge Function
5. Add visual trip assignment flow (drag & drop or click-to-assign)

---

### [CRITICAL-03] Finance Module Incomplete — Missing P&L, Payroll, Tax, and Regional Breakdown
**File:** [apps/web/app/(admin)/finance/page.tsx](apps/web/app/(admin)/finance/page.tsx)  
**Problem:**  
Spec requires multiple finance sub-pages: P&L per region, transaction management, payroll processing, and tax reporting. Current implementation shows only total revenue and recent transactions list. Missing:
- Per-region P&L breakdown (revenue, ops_cost, payroll_cost, fleet_cost, net_profit)
- Payroll sub-page with batch processing
- Tax sub-page with monthly PPN tracking
- Transaction filtering and export
- Invoice/payment receipt generation

**Impact:**  
Cannot analyze profitability by region. Cannot process payroll. Cannot track tax obligations. Finance team must use external spreadsheets.

**API missing:** No endpoints for P&L calculation, payroll status updates, or tax exports.

---

### [CRITICAL-04] Trip Management Not Implemented
**File:** Missing `/admin/trips` and `/admin/trips/[id]`  
**Problem:**  
Spec requires `/admin/trips` listing page with filtering (region, status, date range, driver, package) and detail page showing timeline, GPS tracking, media, and chat history. Only `/admin/bookings` exists with minimal status change UI.

**Impact:**  
Cannot view trip details. Cannot track trip progress. Cannot see real-time GPS location. Cannot manage media uploads or client communication from admin.

---

### [CRITICAL-05] Team & Fleet Management Not Implemented
**File:** Missing `/admin/team`, `/admin/team/[id]`, `/admin/fleet`  
**Problem:**  
Spec requires team management (drivers, photographers, guides) with status filtering, verification status, certifications tracking, and performance metrics. Fleet management requires vehicle status, fuel tracking, maintenance scheduling. Both completely missing.

**Impact:**  
Cannot manage field team. Cannot track driver status. Cannot schedule maintenance. Cannot see performance metrics by team member.

---

### [CRITICAL-06] Packages & Pricing UI Missing
**File:** Missing `/admin/packages`, `/admin/pricing`  
**Problem:**  
Spec requires package CRUD with rich form (itinerary items, gallery, tags, SEO fields) and pricing rules builder with calendar visualization. Missing from implementation.

**Database:** `pricing_rules` table exists but no UI to manage rules. No calendar component for visualizing pricing periods.

**Impact:**  
Admin cannot create/edit packages. Cannot set dynamic pricing rules. Cannot manage seasonal pricing or promotions.

---

### [CRITICAL-07] CRM & Chat Center Missing
**File:** Missing `/admin/crm`  
**Problem:**  
Spec requires split-view chat interface, conversation filtering (ai_handling, escalated, resolved), client history sidebar, and tag management. Completely missing.

**Database:** `ai_conversations` and `ai_messages` tables don't exist yet.

**Impact:**  
Cannot manage customer support conversations. Cannot escalate AI issues to humans. Cannot track conversation resolution.

---

### [CRITICAL-08] Analytics Module Not Implemented
**File:** Missing `/admin/analytics`  
**Problem:**  
Spec requires 4 tabs: Revenue (charts by region, trend), Booking (heatmap, top packages, conversion rate), Satisfaction (ratings, NPS, reviews sentiment), Marketing (post performance). Missing entirely.

**Impact:**  
Cannot analyze business performance. Cannot see trends. Cannot measure marketing ROI. Cannot identify underperforming packages/regions.

---

### [CRITICAL-09] Database Missing Tables for Advanced Features
**Problem:**  
Several essential tables missing from migrations:
- `marketing_assets` — No storage of driver-uploaded media metadata
- `social_posts` — No queue for social media scheduling
- `ai_conversations` and `ai_messages` — No conversation history
- `knowledge_base` — No knowledge base for AI RAG
- `crisis_events` — No crisis management
- `affiliates` — No affiliate tracking
- `memberships` — No membership plans
- `media_purchases` — No photo digital sales
- `reward_points` — No loyalty points system

**Impact:**  
Cannot store data for marketing automation, AI agent, crisis management, and revenue streams beyond basic booking fees.

---

### [CRITICAL-10] Admin Layout Incomplete — Missing Sidebar Navigation
**File:** [apps/web/app/(admin)/layout.tsx](apps/web/app/(admin)/layout.tsx)  
**Problem:**  
Current layout has basic horizontal navbar. Spec requires proper sidebar with collapsible sections and role-based menu items. Routes should show consistent layout with sidebar navigation.

Current routes hard-coded in nav: `/dashboard`, `/bookings`, `/dispatch`, `/verification`, `/finance`. Missing routes for all other features.

**Impact:**  
Cannot easily navigate between admin sections. Missing menu items make it hard to discover features. Hard to expand functionality.

---

## 🟡 Warning — Should Fix Before MVP

### [WARN-01] API Route Auth Check Not Standardized
**Files:** `/api/admin/dispatch/route.ts`, `/api/admin/finance/summary/route.ts`  
**Problem:**  
Auth checks are implemented but could be standardized. Some routes check role twice, some don't verify region_id consistency. No middleware layer for admin auth.

**Recommendation:**  
Create `lib/middleware/admin-auth.ts` with reusable auth verification function:
```typescript
export async function requireAdminAuth(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, region_id')
    .eq('id', user.id)
    .single();
  
  if (!['super_admin', 'regional_admin'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403 };
  }
  
  return { user, profile };
}
```

---

### [WARN-02] Booking Status Panel Doesn't Validate State Transitions
**File:** [apps/web/components/admin/bookings-panel.tsx](apps/web/components/admin/bookings-panel.tsx)  
**Problem:**  
Status dropdown allows any status transition. Spec requires valid state machine: 
- `pending_payment` → `confirmed` (after payment)
- `confirmed` → `assigned` (driver assigned)
- `assigned` → `on_trip` → `completed`
- Any status → `cancelled` or `refunded`

Current code allows invalid transitions like `on_trip` → `pending_payment`.

**Recommendation:**  
Implement status transition validation:
```typescript
const validTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['on_trip', 'cancelled'],
  on_trip: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: []
};

if (!validTransitions[currentStatus].includes(newStatus)) {
  setMessage(`Transisi dari ${currentStatus} ke ${newStatus} tidak valid`);
  return;
}
```

---

### [WARN-03] No Pagination in Admin Lists
**Files:** `/admin/bookings`, `/admin/dispatch`, `/admin/finance`, `/admin/verification`  
**Problem:**  
Current pages fetch all records and display without pagination:
```typescript
.limit(50) // Bookings
.limit(30) // Dispatch
.limit(200) // Verification
.limit(20) // Finance transactions
```

With hundreds or thousands of records, this will cause:
- Slow page loads
- Memory issues
- Poor UX for searching

**Recommendation:**  
Implement pagination with TanStack Query:
- Add `page` and `pageSize` query parameters
- Implement pagination controls (Previous, Next, Jump to page)
- Default page size: 25 records

---

### [WARN-04] Verification Panel Uses Hard Reload on Update
**File:** [apps/web/components/admin/verification/verification-panel.tsx](apps/web/components/admin/verification/verification-panel.tsx#L36)  
**Problem:**  
```typescript
window.location.reload(); // Line 36
```
After status update, page reloads fully. This is poor UX and causes:
- Flash of page
- Lost scroll position
- Network overhead

**Recommendation:**  
Use React state to update component without reload:
```typescript
const [verifications, setVerifications] = useState<Verification[]>(initialVerifications);

const updateStatus = async (driverId: string, status: Verification['overall_status']) => {
  // ... update API call
  setVerifications(prev => prev.map(v => 
    v.driver_id === driverId ? { ...v, overall_status: status } : v
  ));
};
```

---

### [WARN-05] Missing Proper Error Handling & Toast Notifications
**Files:** All admin components  
**Problem:**  
API errors show generic messages. No proper error toasts or success confirmations. Users don't get clear feedback about what happened.

**Example from dispatch-panel.tsx:**
```typescript
setMessage(body.error ?? 'Gagal assign driver');
```
Error just sets state without proper UI feedback. No visual distinction between success/error/warning.

**Recommendation:**  
Install `react-hot-toast` and implement proper notifications:
```typescript
import { toast } from 'react-hot-toast';

const response = await fetch(...);
if (!response.ok) {
  toast.error(body.error);
} else {
  toast.success('Driver berhasil di-assign');
}
```

---

### [WARN-06] No Role-Based Menu Visibility in Admin Layout
**File:** [apps/web/app/(admin)/layout.tsx](apps/web/app/(admin)/layout.tsx)  
**Problem:**  
All nav items visible regardless of role. Spec requires role-based menu:
- `regional_admin`: Only sees own region data, no system-wide analytics
- `super_admin`: Sees all features and regions

Current navbar shows same links to everyone.

**Recommendation:**  
Pass profile data to layout and conditionally render menu items:
```typescript
{profile.role === 'super_admin' && (
  <Link href="/admin/analytics">Analytics</Link>
)}
```

---

## 🔵 Info — Nice to Have

### [INFO-01] Component Library Not Documented
No Storybook or component documentation. UI components (dispatch panel, bookings panel, verification) should have stories and prop documentation.

### [INFO-02] Lack of Loading & Error States
Pages don't show loading skeleton during data fetch. Error boundaries not implemented. Add loading states and error fallbacks.

### [INFO-03] Marketplace Not Started
Homepage exists but no package listing page, package detail page, or booking flow. Spec requires full marketplace for clients.

### [INFO-04] Real Trip Maps Not Implemented
No live map visualization for customers or admin. Spec requires Mapbox GL integration with driver pins and media feed.

### [INFO-05] Payment Integration Only Partially Tested
Database has `midtrans_order_id` and `stripe_session_id` fields, but webhook handlers not fully implemented. Payment flow may be incomplete.

---

## 🔗 Cross-Impact Analysis

### Dashboard Changes May Break:
| Feature | Impact | Status |
|---------|--------|--------|
| Booking Status Updates | `/api/admin/bookings/[id]/status` must handle all valid transitions | ⚠️ Needs validation |
| Driver Assignment | Must trigger notification + update driver_locations status | ✅ Partially done |
| Region Filtering | Admin should only see their region data (if regional_admin) | ⚠️ Not implemented |
| Real-time Updates | Dashboard must subscribe to changes, not just show stale data | ❌ Missing |

### Database Queries Accessing Bookings Table:
- `/admin/dashboard` — Counts
- `/admin/bookings` — List with status filter
- `/admin/dispatch` — List for assignment
- `/api/marketplace/booking/create` — Insert new booking
- `/api/admin/bookings/[id]/status` — Update status
- Webhook routes — Update on payment confirmation

All these queries should respect regional isolation via RLS policies.

### Missing RLS Policies for Admin:
Current RLS policies may not properly restrict regional_admin access. Should verify:
- `bookings` table: regional_admin can only access region they're assigned to
- `profiles` table: regional_admin cannot see other regions' team members
- `transactions` table: RLS policy exists but should be tested
- `packages` table: regional_admin can only manage packages in their region

---

## ✅ What Was Done Well

1. **Solid Database Foundation** — PostgreSQL schema with proper ENUM types, foreign keys, and triggers. Migrations are well-organized and incrementally applied.

2. **Auth Middleware in Place** — Supabase integration with `getUser()` checks on protected routes and API handlers. Role hierarchy (super_admin, regional_admin, driver, etc.) properly defined.

3. **API Route Structure** — Routes follow REST conventions with proper HTTP methods. Validation using Zod schema (assignDriverSchema). Error codes standardized.

4. **Component Structure** — Components are modular (dispatch-panel, bookings-panel, verification-panel). Separation between server components (data fetching) and client components (interactivity).

5. **Form State Management** — Using React hooks for form state. Not over-engineered with Redux/Zustand for simple forms.

6. **Dispatch Logic Partially Implemented** — assign-driver validation checks region matching and role verification. Notifications triggered on assignment.

7. **Git Repository Structure** — Monorepo setup with pnpm workspaces. Web app properly organized under `/apps/web`.

8. **TypeScript Strictness** — No `any` types visible in admin routes and components. Proper type definitions for payloads.

---

## 📋 Verdict

| Status | Explanation |
|--------|-------------|
| ❌ **Requires Critical Fixes** | Dashboard severely incomplete. 10 critical features missing. Cannot proceed to production MVP without implementing real-time feeds, dispatch map, finance module, and core admin pages. |

---

## 📊 Completion Estimate

| Module | Status | % Complete | Notes |
|--------|--------|-----------|-------|
| **Database Schema** | ✅ Done | 60% | Core tables exist. Advanced tables (marketing, AI, crisis) missing. |
| **Auth & Roles** | ✅ Done | 100% | Role hierarchy, middleware, profile triggers all implemented. |
| **Admin Dashboard** | ❌ Not Started | 10% | Only basic counter cards. Missing real-time, alerts, per-region breakdown. |
| **Dispatch** | ⚠️ Partial | 30% | Dropdown assignment works. Missing map visualization and auto-dispatch algorithm. |
| **Trip Management** | ❌ Not Started | 0% | No trips page or detail view. |
| **Team Management** | ❌ Not Started | 0% | No team page, status tracking, or verification detail view. |
| **Fleet Management** | ❌ Not Started | 0% | No fleet page or vehicle tracking. |
| **Finance Module** | ⚠️ Partial | 20% | Shows total revenue. Missing P&L, payroll, tax, regional breakdown. |
| **Packages & Pricing** | ❌ Not Started | 0% | No package CRUD UI. No pricing rules builder. |
| **CRM & Chat** | ❌ Not Started | 0% | Database tables missing. No UI. |
| **Analytics** | ❌ Not Started | 0% | No reporting dashboard. |
| **Marketplace** | ❌ Not Started | 5% | Homepage only. No package listing, detail, or booking flow. |
| **Real Trip Maps** | ❌ Not Started | 0% | No map component. No live GPS display. |
| **Payments** | ⚠️ Partial | 40% | Midtrans/Stripe fields in DB. Webhook handling not fully tested. |
| **AI Agent** | ❌ Not Started | 0% | No Claude integration. No knowledge base. Database tables missing. |

**Overall Platform Completion: ~15%** — Foundation laid, core feature development needed.

---

## 🚀 Recommended Next Steps (Priority Order)

1. **Implement Real-Time Dashboard (1-2 days)**
   - Add Supabase Realtime subscriptions
   - Create live feed component
   - Implement alert system
   - Per-region breakdown card

2. **Complete Dispatch with Map (2-3 days)**
   - Integrate Mapbox GL
   - Visualize driver locations
   - Implement auto-dispatch Edge Function
   - Add visual assignment flow

3. **Expand Finance Module (2 days)**
   - Create P&L by region sub-page
   - Implement transaction filters and export
   - Add payroll processing UI
   - Add tax tracking sub-page

4. **Create Trip Management Pages (1-2 days)**
   - Build trips listing with filters
   - Create trip detail page with timeline and GPS
   - Add media gallery and chat interface

5. **Build Core Admin Pages (3-4 days)**
   - Team management with status/verification
   - Fleet management with maintenance tracking
   - Package CRUD with rich form
   - Pricing rules builder with calendar

6. **Build Marketplace Frontend (3-4 days)**
   - Package listing page
   - Package detail with booking form
   - Checkout flow
   - My bookings page

7. **Implement Real Trip Maps (2 days)**
   - Live map component for marketplace
   - Live driver pins
   - Real-time media feed

8. **Complete Payment Integration (1-2 days)**
   - Test Midtrans webhook flow
   - Test Stripe webhook flow
   - Add payment status tracking

9. **Database: Create Missing Tables (1 day)**
   - Marketing assets, social posts, AI conversations
   - Crisis management, affiliates, memberships
   - Media purchases, reward points

10. **AI Agent & CRM (3-4 days)**
    - Knowledge base table & UI
    - Claude API integration
    - Chat interface for admin
    - Conversation filtering

---

## 📝 Notes for Developers

- **When implementing new pages:** Always include pagination for lists > 50 items
- **When implementing forms:** Use Zod validation on both frontend and API route
- **When touching bookings table:** Respect RLS policies to ensure regional isolation
- **When adding realtime features:** Test subscription cleanup on component unmount (prevent memory leaks)
- **When modifying user_role enum:** Update RLS policies and role checks accordingly
- **Testing:** Add Playwright E2E tests for critical admin flows (assign driver, update status, etc.)

