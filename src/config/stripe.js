// Stripe Payment Configuration
// For subscription management

// Stripe publishable key from env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Price IDs from Stripe Dashboard
// Replace these with your actual Stripe Price IDs
export const STRIPE_PRICES = {
    starter: {
        monthly: 'price_starter_monthly', // Replace with actual Stripe Price ID
        yearly: 'price_starter_yearly'
    },
    pro: {
        monthly: 'price_pro_monthly',
        yearly: 'price_pro_yearly'
    },
    unlimited: {
        monthly: 'price_unlimited_monthly',
        yearly: 'price_unlimited_yearly'
    }
}

// Check if Stripe is configured
export const isStripeConfigured = () => {
    return stripePublishableKey && !stripePublishableKey.includes('your_stripe')
}

// Load Stripe SDK dynamically
let stripePromise = null
export const getStripe = async () => {
    if (!isStripeConfigured()) {
        console.warn('Stripe not configured')
        return null
    }

    if (!stripePromise) {
        const { loadStripe } = await import('@stripe/stripe-js')
        stripePromise = loadStripe(stripePublishableKey)
    }
    return stripePromise
}

// Create checkout session
// In production, this should call your backend API
export const createCheckoutSession = async (priceId, userId, userEmail) => {
    // For demo/development, we'll simulate the checkout
    // In production, you need a backend endpoint that:
    // 1. Creates a Stripe Checkout Session
    // 2. Returns the session ID

    // Example backend call:
    // const response = await fetch('/api/create-checkout-session', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ priceId, userId, userEmail })
    // })
    // return response.json()

    console.log('Would create checkout for:', { priceId, userId, userEmail })

    // For now, return mock data
    return {
        success: false,
        error: 'Stripe checkout requires backend configuration. See docs/stripe-setup.md'
    }
}

// Create customer portal session
// For managing existing subscriptions
export const createPortalSession = async (customerId) => {
    // In production, call your backend:
    // const response = await fetch('/api/create-portal-session', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ customerId })
    // })
    // return response.json()

    return {
        success: false,
        error: 'Customer portal requires backend configuration'
    }
}

// Price helpers
export const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(price)
}

// Calculate annual savings
export const getAnnualSavings = (monthlyPrice, annualPrice) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - annualPrice
    const percentOff = Math.round((savings / monthlyTotal) * 100)
    return { savings, percentOff }
}
