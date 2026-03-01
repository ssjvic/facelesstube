// Stripe Payment Configuration
// For subscription management

// Stripe publishable key from env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Price IDs from Stripe Dashboard (TEST mode)
// Account: acct_1GYkSxBOwXqiDvFM
export const STRIPE_PRICES = {
  starter: {
    monthly: "price_1T62zQBOwXqiDvFMfQHmxn6h", // $9/mo
  },
  creator: {
    monthly: "price_1T630LBOwXqiDvFM96pEfpky", // $19/mo
  },
  pro: {
    monthly: "price_1T6318BOwXqiDvFMm0CtoVJX", // $39/mo
  },
  // ⚠️ Solo para pruebas — eliminar antes de producción
  test: {
    monthly: "price_1T63EoBOwXqiDvFMX2gebq5r", // $0.01/mo TEST ONLY
  },
};

// Early Bird coupon - 20% forever, max 100 redemptions
export const STRIPE_COUPON_ID = "JaghrCfF";

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

// Create customer portal session
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
    error: "Customer portal requires backend configuration",
  };
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
