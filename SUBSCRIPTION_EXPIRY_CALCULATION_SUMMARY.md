# Subscription Expiry Date Calculation - Implementation Summary

## Changes Made

### 1. **Stripe Webhook Handler** (`backend/routes/stripe.js`)
   - **Enhanced `checkout.session.completed` handler** to process both addon and main plan purchases
   - When a Stripe checkout completes for a main plan:
     - Automatically calculates `endDate` based on `billingCycle`
     - **Monthly plans**: Sets expiry to **30 days** from purchase date
     - **Annual plans**: Sets expiry to **365 days** from purchase date
     - Saves `plan`, `planName`, `billingCycle`, `startDate`, and `endDate` to the company subscription

### 2. **Admin Dashboard** (`src/components/admin/AdminDashboard.js`)
   - **Improved `getCompanyExpiryDate()` function** with new calculation logic:
     1. First checks for direct `endDate` field (returns if found)
     2. Then checks the `billingCycle` field:
        - If `billingCycle` contains "annual", adds **365 days** to `startDate`
        - If `billingCycle` contains "monthly", adds **30 days** to `startDate`
     3. Falls back to old logic using months if above fails
   - Shows accurate expiry dates in the admin "All Companies" table

### 3. **Admin Onboarding** (`backend/routes/companies.js` - Multiple Endpoints)
   
   **Endpoint 1: POST `/companies/onboard-admin`** (Lines 2583-2607)
   - Calculates subscription dates based on `subscriptionMonths`:
     - If `subscriptionMonths >= 12` or plan includes "annual": **365 days**
     - Otherwise: **30 days**
   - Sets `billingCycle` field accordingly
   - Uses `setDate()` method (exact days, not months)

   **Endpoint 2: POST `/companies/create-hierarchical`** (Lines 2455-2476)
   - Similar day-based calculation logic
   - Properly sets `billingCycle` field
   
   **Endpoint 3: POST `/companies/...` (Profile Completion)** (Lines 2265-2281)
   - When a plan is selected, sets start and end dates
   - Calculates expiry based on `billingCycle`
   - Will be updated by Stripe webhook after actual payment

## Calculation Logic

### Monthly Subscription
```javascript
// Input: Purchase date = 2026-04-14
// Plan: Monthly (30 days)
startDate = 2026-04-14
endDate = 2026-05-14  // Exactly 30 days later
```

### Annual Subscription  
```javascript
// Input: Purchase date = 2026-04-14
// Plan: Annual (365 days)
startDate = 2026-04-14
endDate = 2027-04-13  // Exactly 365 days later
```

## Database Fields

The Company model (`backend/models/Company.js`) stores:
```javascript
subscription: {
  plan: String,           // "basic", "premium", "elite", etc.
  planName: String,       // Full plan name
  status: String,         // "active", "inactive", "cancelled"
  startDate: Date,        // When subscription started
  endDate: Date,          // When subscription expires
  months: Number,         // For reference (1 for monthly, 12 for annual)
  billingCycle: String,   // "monthly" or "annual"
  addons: [String],       // Array of addon IDs
  addonDetails: [{
    id: String,
    purchaseDate: Date,
    expiryDate: Date
  }]
}
```

## Backward Compatibility

The updated `getCompanyExpiryDate()` function maintains full backward compatibility:
1. Returns existing `endDate` if available
2. Falls back to old months-based logic if `billingCycle` is not set
3. Ensures no existing data is broken

## Testing Checklist

- [ ] Create admin company with monthly plan → verify endDate is 30 days from start
- [ ] Create admin company with annual plan → verify endDate is 365 days from start  
- [ ] Check "All Companies" admin table shows correct expiry dates
- [ ] Verify CSV export includes correct expiry dates
- [ ] Test Stripe checkout for monthly plan → verify webhook sets correct dates
- [ ] Test Stripe checkout for annual plan → verify webhook sets correct dates
- [ ] Verify existing companies still show correct dates (backward compatibility)
- [ ] Check ManageSubscriptionsPage displays correct dates

## Files Modified

1. `backend/routes/stripe.js` - Webhook handler
2. `backend/routes/companies.js` - Admin onboarding endpoints  
3. `src/components/admin/AdminDashboard.js` - Expiry date calculation & display

## Date Calculation Method Used

- **Not using `setMonth()`** anymore (can be inaccurate due to month-length variations)
- **Using `setDate()`** with exact day counts:
  - Monthly: `date.setDate(date.getDate() + 30)`
  - Annual: `date.setDate(date.getDate() + 365)`

This ensures exact duration calculations regardless of which month the subscription starts.
