// Stripe Payment Configuration
// For subscription management

// Stripe publishable key from env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Price IDs from Stripe Dashboard (LIVE mode)
// Account: acct_1GYkSxBOwXqiDvFM
export const STRIPE_PRICES = {
  starter: {
    monthly: "price_1T6fmFBOwXqiDvFMMcsDLcNw", // $9/mo
  },
  creator: {
    monthly: "price_1T6fmFBOwXqiDvFM5LIiuHNR", // $19/mo
  },
  pro: {
    monthly: "price_1T6fmGBOwXqiDvFMR44xMt1g", // $39/mo
  },
  test: {
    monthly: "price_1T6fmGBOwXqiDvFMBnKlF47a", // $0.01 test plan (LIVE mode)
  },
};

// Early Bird coupon - 20% forever, max 100 redemptions
export const STRIPE_COUPON_ID = "x1YT5QLm";

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return stripePublishableKey && !stripePublishableKey.includes("your_stripe");
};

// Load Stripe SDK dynamically
let stripePromise = null;
export const getStripe = async () => {
  if (!isStripeConfigured()) {
    console.warn("Stripe not configured");
    return null;
  }

  if (!stripePromise) {
    const { loadStripe } = await import("@stripe/stripe-js");
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Create checkout session — calls backend, then redirects to Stripe Checkout
export const createCheckoutSession = async (
  priceId,
  userId,
  userEmail,
  applyCoupon = false,
) => {
  const apiUrl =
    import.meta.env.VITE_API_URL || "https://facelesstube-backend.onrender.com";

  try {
    const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price_id: priceId,
        user_id: userId,
        user_email: userEmail,
        apply_coupon: applyCoupon,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${response.status}`);
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url; // Redirect to Stripe Checkout
    }
    return { success: true };
  } catch (e) {
    console.error("Checkout error:", e);
    return { success: false, error: e.message };
  }
};

// Create customer portal session — redirects user to Stripe's hosted portal
// where they can cancel, upgrade, or view invoices
export const createPortalSession = async (userId) => {
  const apiUrl =
    import.meta.env.VITE_API_URL || "https://facelesstube-backend.onrender.com";

  try {
    const response = await fetch(`${apiUrl}/api/create-portal-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Error ${response.status}`);
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url; // Redirect to Stripe Customer Portal
    }
    return { success: true };
  } catch (e) {
    console.error("Portal session error:", e);
    return { success: false, error: e.message };
  }
};

// Price helpers
export const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
};

// Calculate annual savings
export const getAnnualSavings = (monthlyPrice, annualPrice) => {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  const percentOff = Math.round((savings / monthlyTotal) * 100);
  return { savings, percentOff };
};
