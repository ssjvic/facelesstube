# Google Play Billing Setup Guide

## Overview

FacelessTube uses Google Play Billing for all in-app purchases and subscriptions. This is required for apps distributed on the Play Store.

---

## 1. Create Products in Play Console

Go to [Google Play Console](https://play.google.com/console) > Your App > Monetize > Subscriptions

### Create Subscriptions

| Product ID | Name | Price |
|------------|------|-------|
| `starter_monthly` | Starter (Mensual) | $9.00 USD |
| `starter_yearly` | Starter (Anual) | $99.00 USD |
| `pro_monthly` | Pro (Mensual) | $19.00 USD |
| `pro_yearly` | Pro (Anual) | $190.00 USD |
| `unlimited_monthly` | Unlimited (Mensual) | $29.00 USD |
| `unlimited_yearly` | Unlimited (Anual) | $290.00 USD |

### For each subscription

1. Add a base plan (monthly or yearly)
2. Set grace period (3-7 days recommended)
3. Enable prepaid/recurring as needed

---

## 2. Install Capacitor Billing Plugin

```bash
npm install @anthropic-ai/capacitor-play-billing
npx cap sync android
```

---

## 3. Configure Android

In `android/app/build.gradle`:

```gradle
dependencies {
    implementation "com.android.billingclient:billing:6.0.1"
}
```

---

## 4. Backend Verification (Required)

Google Play purchases MUST be verified server-side:

### Option A: Supabase Edge Function

```typescript
// supabase/functions/verify-purchase/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_PACKAGE_NAME = 'com.facelesstube.app'

serve(async (req) => {
  const { purchaseToken, productId, userId } = await req.json()
  
  // Verify with Google Play Developer API
  const googleAuth = await getGoogleAuthToken() // Use service account
  
  const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`
  
  const response = await fetch(verifyUrl, {
    headers: { 'Authorization': `Bearer ${googleAuth}` }
  })
  
  const purchase = await response.json()
  
  if (purchase.paymentState === 1) { // Payment received
    // Update user's subscription in database
    const supabase = createClient(/* ... */)
    await supabase.from('users').update({
      tier: getTierFromProductId(productId)
    }).eq('id', userId)
    
    return new Response(JSON.stringify({ success: true }))
  }
  
  return new Response(JSON.stringify({ success: false }), { status: 400 })
})
```

---

## 5. Real-Time Developer Notifications (RTDN)

Set up webhook to receive purchase updates:

1. Create Cloud Pub/Sub topic in Google Cloud
2. In Play Console > Monetization setup > Real-time notifications
3. Add your Pub/Sub topic
4. Create a Cloud Function to process events:
   - `SUBSCRIPTION_PURCHASED`
   - `SUBSCRIPTION_RENEWED`
   - `SUBSCRIPTION_CANCELED`
   - `SUBSCRIPTION_EXPIRED`

---

## 6. Testing

### License Testers

1. Play Console > Setup > License testing
2. Add tester email addresses
3. Testers can purchase without being charged

### Test Cards

On test devices, use test card flow for validation.

---

## 7. Launch Checklist

- [ ] All subscription products created
- [ ] Base plans configured
- [ ] Backend verification endpoint deployed
- [ ] License testers added
- [ ] RTDN webhook configured
- [ ] Test purchases completed successfully
- [ ] Grace period configured

---

## Code Reference

The billing logic is in:

- `src/config/playBilling.js` - Play Billing integration
- `src/pages/Premium.jsx` - Purchase UI

Products are defined in `playBilling.js`:

```javascript
export const TIER_PRODUCTS = {
    starter: {
        monthly: 'starter_monthly',
        yearly: 'starter_yearly'
    },
    // ...
}
```

---

## Important Notes

1. **30% Fee**: Google takes 30% of subscription revenue (15% for first $1M)
2. **Refunds**: Handle via Play Console or API
3. **Cancellations**: User keeps access until period ends
4. **Price Changes**: Update in Play Console, app fetches current prices
