// Google Play Billing Configuration
// Uses cordova-plugin-purchase (cc.fovea.cordova.purchase)
// Docs: https://github.com/niclas-niclasen/cordova-plugin-purchase

// Product IDs — must match exactly what's in Google Play Console
export const PLAY_STORE_PRODUCTS = {
  subscriptions: {
    starter_monthly: "starter_monthly",
    starter_yearly: "starter_yearly",
    pro_monthly: "pro_monthly",
    pro_yearly: "pro_yearly",
    unlimited_monthly: "unlimited_monthly",
    unlimited_yearly: "unlimited_yearly",
  },
};

// Map UI tier name → Play Store product IDs
// NOTE: UI "Creator" ($19) → product "pro_*" | UI "Pro" ($39) → product "unlimited_*"
export const TIER_PRODUCTS = {
  starter: {
    monthly: "starter_monthly",
    yearly: "starter_yearly",
  },
  creator: {
    monthly: "pro_monthly",
    yearly: "pro_yearly",
  },
  pro: {
    monthly: "unlimited_monthly",
    yearly: "unlimited_yearly",
  },
};

// Check if running in Capacitor (Android app)
export const isCapacitorApp = () => {
  return (
    typeof window !== "undefined" &&
    window.Capacitor &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform()
  );
};

// Check if running on Android
export const isAndroid = () => {
  return isCapacitorApp() && window.Capacitor.getPlatform() === "android";
};

// Get the CdvPurchase store (only available in native apps with the plugin)
const getStore = () => {
  if (typeof window !== "undefined" && window.CdvPurchase?.store) {
    return window.CdvPurchase.store;
  }
  return null;
};

// Callback for when a purchase is verified and approved
let _onPurchaseApproved = null;

export const setOnPurchaseApproved = (callback) => {
  _onPurchaseApproved = callback;
};

// Initialize Play Billing (call once on app start)
let billingReady = false;

export const initPlayBilling = async () => {
  if (!isAndroid()) {
    console.log("Play Billing: Not on Android, skipping");
    return false;
  }

  const store = getStore();
  if (!store) {
    console.log("Play Billing: CdvPurchase.store not available");
    return false;
  }

  try {
    const { ProductType, Platform } = window.CdvPurchase;

    // Register all subscription products
    const productList = Object.values(PLAY_STORE_PRODUCTS.subscriptions).map(
      (id) => ({
        id,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      }),
    );

    store.register(productList);

    // Set up the approval handler
    store.when().approved((transaction) => {
      console.log("✅ Purchase approved:", transaction.products);

      // Auto-finish (acknowledge) the transaction
      transaction.verify();
    });

    store.when().verified((receipt) => {
      console.log("✅ Purchase verified:", receipt);
      receipt.finish();

      // Notify the app about the successful purchase
      if (_onPurchaseApproved && receipt.sourceReceipt?.transactions?.length) {
        const tx = receipt.sourceReceipt.transactions[0];
        const productId = tx.products?.[0]?.id;
        const purchaseToken = tx.nativePurchase?.purchaseToken;

        _onPurchaseApproved({
          productId,
          purchaseToken,
          transactionId: tx.transactionId,
        });
      }
    });

    store.when().unverified((receipt) => {
      console.warn("⚠️ Purchase unverified:", receipt);
    });

    // Set the validator (optional — for server-side verification)
    // store.validator = "https://your-backend.com/api/verify-play-purchase";

    // Initialize the store
    await store.initialize([Platform.GOOGLE_PLAY]);

    billingReady = true;
    console.log("✅ Play Billing initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Play Billing init error:", error);
    return false;
  }
};

// Get available products (after initialization)
export const getProducts = () => {
  if (!billingReady) return [];

  const store = getStore();
  if (!store) return [];

  return Object.values(PLAY_STORE_PRODUCTS.subscriptions)
    .map((id) => store.get(id))
    .filter(Boolean);
};

// Get a specific product's pricing info
export const getProductPrice = (productId) => {
  const store = getStore();
  if (!store) return null;

  const product = store.get(productId);
  if (!product) return null;

  const offer = product.getOffer();
  return offer
    ? {
        price: offer.pricingPhases?.[0]?.price || product.pricing?.price,
        currency:
          offer.pricingPhases?.[0]?.currency || product.pricing?.currency,
        priceMicros:
          offer.pricingPhases?.[0]?.priceMicros || product.pricing?.priceMicros,
      }
    : null;
};

// Purchase a subscription
export const purchaseSubscription = async (productId) => {
  if (!billingReady) {
    return { success: false, error: "Play Billing not initialized" };
  }

  const store = getStore();
  if (!store) {
    return { success: false, error: "Play Billing not available" };
  }

  try {
    const product = store.get(productId);
    if (!product) {
      return {
        success: false,
        error: `Product "${productId}" not found in store`,
      };
    }

    const offer = product.getOffer();
    if (!offer) {
      return { success: false, error: "No offer available for this product" };
    }

    // This triggers the Google Play purchase dialog
    const result = await store.order(offer);

    if (result && result.isError) {
      // User cancelled or error occurred
      if (
        result.code === window.CdvPurchase?.ErrorCode?.PAYMENT_CANCELLED ||
        result.message?.includes("cancel")
      ) {
        return { success: false, error: "Compra cancelada" };
      }
      return { success: false, error: result.message || "Error en la compra" };
    }

    // Purchase was initiated — the actual completion comes through the
    // "approved" → "verified" flow set up in initPlayBilling
    return { success: true, pending: true };
  } catch (error) {
    console.error("❌ Purchase error:", error);
    return { success: false, error: error.message || "Error al comprar" };
  }
};

// Get active subscriptions
export const getActiveSubscriptions = () => {
  const store = getStore();
  if (!store) return [];

  return Object.values(PLAY_STORE_PRODUCTS.subscriptions)
    .map((id) => store.get(id))
    .filter((product) => product && product.owned);
};

// Map product ID back to UI tier name
export const productToTier = (productId) => {
  if (!productId) return "free";
  if (productId.includes("starter")) return "starter";
  if (productId.includes("unlimited")) return "pro";      // unlimited_* → UI "Pro" ($39)
  if (productId.includes("pro")) return "creator";         // pro_* → UI "Creator" ($19)
  return "free";
};
