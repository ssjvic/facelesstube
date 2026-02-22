# Stripe Setup Guide for FacelessTube

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Verify your business information

## 2. Create Products and Prices

In Stripe Dashboard > Products, create:

### Product: Starter Plan

- **Monthly**: $9/month (recurring)
- **Yearly**: $99/year (recurring) - Save ~8%

### Product: Pro Plan  

- **Monthly**: $19/month (recurring)
- **Yearly**: $190/year (recurring) - Save ~17%

### Product: Unlimited Plan

- **Monthly**: $29/month (recurring)
- **Yearly**: $290/year (recurring) - Save ~17%

## 3. Get API Keys

From Stripe Dashboard > Developers > API Keys:

- **Publishable key**: `pk_test_...` or `pk_live_...`
- **Secret key**: `sk_test_...` or `sk_live_...`

## 4. Configure Environment Variables

Add to your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 5. Backend Required

⚠️ **Important**: Stripe Checkout requires a backend server to:

1. Create Checkout Sessions securely
2. Handle Webhooks for payment events
3. Update user subscriptions in database

### Option A: Supabase Edge Functions

Create a Supabase Edge Function:

```typescript
// supabase/functions/create-checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
  const { priceId, userId, email, successUrl, cancelUrl } = await req.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId }
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Option B: Vercel/Netlify Serverless

Create an API route for your hosting platform.

## 6. Webhook Setup

Create a webhook endpoint to handle:

- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Payment issues

### Webhook Handler Example

```typescript
// Handle Stripe webhooks
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

switch (event.type) {
  case 'checkout.session.completed':
    const session = event.data.object
    await updateUserTier(session.metadata.userId, session.subscription)
    break
    
  case 'customer.subscription.deleted':
    await downgradeToFree(event.data.object.metadata.userId)
    break
}
```

## 7. Test Mode

Use Stripe test mode first:

- Test card: `4242 4242 4242 4242`
- Any future date and CVC

## 8. Go Live

1. Complete Stripe account verification
2. Switch to live API keys
3. Update webhook endpoints to production URLs
