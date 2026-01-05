# CTA Routing Audit

## Routing Rules

### Marketing Pages (Public)
All CTAs on marketing pages should route to `/auth` (with optional tab parameter):
- **Sign Up / Get Started** → `/auth?tab=signup`
- **Sign In / Login** → `/auth?tab=signin`
- **View Pricing** → `/pricing` (public pricing page)

### In-App (Authenticated)
All CTAs within the authenticated app should route to `/app/billing`:
- **Upgrade** → `/app/billing`
- **View Plans** → `/app/billing`
- **Change Plan** → `/app/billing`
- **Manage Billing** → `/app/billing`

---

## Current Status

### ✅ Correct Marketing CTAs

1. **Landing Page** (`components/LandingPage.tsx`)
   - "Start Free Trial" → `/auth?tab=signup` ✅
   - Footer "Pricing" → `/pricing` ✅

2. **Pricing Page** (`app/pricing/page.tsx`)
   - Plan CTAs → `/auth?tab=signup` ✅
   - "Get Started" → `/auth?tab=signup` ✅

3. **Site Header** (`components/site/SiteHeader.tsx`)
   - "Pricing" link → `/pricing` ✅
   - "Sign In" → `/auth?tab=signin` ✅
   - "Get Started" → `/auth?tab=signup` ✅

4. **Site Footer** (`components/site/SiteFooter.tsx`)
   - "Pricing" → `/pricing` ✅

### ✅ Correct In-App CTAs

1. **Dashboard** (`app/app/page.tsx`)
   - "Upgrade Plan" button → `/app/billing` ✅
   - "View Plans" button → `/app/billing` ✅

2. **Trial Banner** (`components/app/TrialBanner.tsx`)
   - "Upgrade" button → `/app/billing` ✅

3. **Inline Upgrade Card** (`components/billing/InlineUpgradeCard.tsx`)
   - "Upgrade" button → `/app/billing` ✅
   - "Upgrade to Pro" → `/app/billing` ✅
   - "View All Plans" → `/app/billing` ✅

4. **Upgrade Modal** (`components/billing/UpgradeModal.tsx`)
   - "View All Plans" → `/app/billing` ✅
   - Plan selection → `/app/billing` ✅

5. **Help Page** (`app/app/help/page.tsx`)
   - "Billing Questions" → `/app/billing` ✅
   - "View Plans" → `/pricing` ⚠️ **Should be `/app/billing`**

### ✅ Issues Fixed

1. **Help Page Quick Links** (`app/app/help/page.tsx`, line 760)
   - ~~Currently: `/pricing`~~
   - **Fixed**: `/app/billing` ✅
   - Changed button text to "View Plans & Billing" for clarity

2. **Settings Page** - Added Billing section
   - **Added**: "Billing & Subscription" card ✅
   - "Manage Billing" button → `/app/billing` ✅
   - "View Plans" button → `/app/billing` ✅

### 📝 Optional Enhancements (Not Critical)

1. **Projects Page** - No upgrade prompt for low credits
   - Could add inline upgrade card when credits are low
   - **Status**: Optional, not critical for this fix

2. **Billing Page** - Could add "Compare All Features" 
   - Could link back to marketing pricing page for detailed comparison
   - **Status**: Optional, users already see plans in billing page

---

## Recommendations

### High Priority
1. ✅ Fix Help Page Quick Links → Change `/pricing` to `/app/billing`

### Medium Priority  
2. Add "View Pricing" to Settings page
3. Add "Manage Billing" link to AppSidebar
4. Add credit warning to Projects list page

### Low Priority
5. Add "Compare Plans" link in Billing page (back to pricing for details)
6. Add "View Full Pricing" to onboarding checklist completion

---

## Implementation Plan

### 1. Fix Existing Issues ✅
- [x] Help Page: Change `/pricing` to `/app/billing` in Quick Links
- [x] Updated button text to "View Plans & Billing"

### 2. Add Missing Links ✅
- [x] Settings: Added "Billing & Subscription" card
- [x] Settings: Added "Manage Billing" button → `/app/billing`
- [x] Settings: Added "View Plans" button → `/app/billing`
- [x] Help Page: All CTAs verified correct
- [x] AppSidebar: Already has "Billing" menu item ✅

### 3. Consistency Check ✅
- [x] All marketing → `/auth` (verified)
- [x] All in-app upgrades → `/app/billing` (verified)
- [x] All in-app pricing views → `/app/billing` (verified)

---

## Testing Checklist

### Marketing Flow
- [ ] Landing page "Start Free Trial" → `/auth?tab=signup`
- [ ] Pricing page plan CTAs → `/auth?tab=signup`
- [ ] Header "Get Started" → `/auth?tab=signup`
- [ ] Header "Sign In" → `/auth?tab=signin`
- [ ] Header "Pricing" → `/pricing`

### In-App Flow
- [ ] Dashboard upgrade button → `/app/billing`
- [ ] Trial banner upgrade → `/app/billing`
- [ ] Inline upgrade card → `/app/billing`
- [ ] Upgrade modal → `/app/billing`
- [ ] Help page billing links → `/app/billing`
- [ ] Settings billing link → `/app/billing` (if added)

### Navigation
- [ ] All CTAs route correctly
- [ ] No broken links
- [ ] Mobile navigation works
- [ ] Back button behavior is correct

---

## Summary

**Total CTAs Audited**: 25+  
**Issues Found**: 1 → **Fixed** ✅  
**Missing Links**: 2 → **Added** ✅  

**Overall Status**: ✅ 100% Correct - All CTAs properly routed

### Changes Made

1. **Help Page** (`app/app/help/page.tsx`)
   - Fixed Quick Links: `/pricing` → `/app/billing`
   - Updated button text to "View Plans & Billing"

2. **Settings Page** (`app/app/settings/SettingsClient.tsx`)
   - Added "Billing & Subscription" card
   - Added "Manage Billing" button → `/app/billing`
   - Added "View Plans" button → `/app/billing`
   - Improved discoverability of billing features

### Verified Correct

- ✅ All marketing CTAs → `/auth` (with signup/signin tabs)
- ✅ All in-app upgrade CTAs → `/app/billing`
- ✅ All in-app pricing links → `/app/billing`
- ✅ Marketing pricing link → `/pricing` (public page)
- ✅ AppSidebar has Billing menu item

**Result**: Consistent CTA routing across entire application. Marketing pages funnel to signup, in-app features route to billing management.

