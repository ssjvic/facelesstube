// Google Play Billing Configuration
// For in-app purchases and subscriptions on Android

// Product IDs - Match these in Google Play Console
export const PLAY_STORE_PRODUCTS = {
    subscriptions: {
        starter_monthly: 'starter_monthly',
        starter_yearly: 'starter_yearly',
        pro_monthly: 'pro_monthly',
        pro_yearly: 'pro_yearly',
        unlimited_monthly: 'unlimited_monthly',
        unlimited_yearly: 'unlimited_yearly'
    },
    credits: {
        credits_100: 'credits_100',
        credits_500: 'credits_500',
        credits_1000: 'credits_1000'
    }
}

// Map tier to product IDs
export const TIER_PRODUCTS = {
    starter: {
        monthly: 'starter_monthly',
        yearly: 'starter_yearly'
    },
    pro: {
        monthly: 'pro_monthly',
        yearly: 'pro_yearly'
    },
    unlimited: {
        monthly: 'unlimited_monthly',
        yearly: 'unlimited_yearly'
    }
}

// Check if running in Capacitor (Android app)
export const isCapacitorApp = () => {
    return typeof window !== 'undefined' &&
        window.Capacitor &&
        window.Capacitor.isNativePlatform()
}

// Check if running on Android
export const isAndroid = () => {
    return isCapacitorApp() && window.Capacitor.getPlatform() === 'android'
}

// Get Play Billing plugin (only available in Android app)
const getPlayBilling = () => {
    if (isAndroid() && window.Capacitor?.Plugins?.InAppPurchase2) {
        return window.Capacitor.Plugins.InAppPurchase2
    }
    return null
}

// Initialize Play Billing (call once on app start)
let billingReady = false
export const initPlayBilling = async () => {
    if (!isAndroid()) {
        console.log('Play Billing only works on Android')
        return false
    }

    const PlayBilling = getPlayBilling()
    if (!PlayBilling) {
        console.log('Play Billing plugin not available')
        return false
    }

    try {
        const result = await PlayBilling.initialize()
        billingReady = result?.ready || true
        console.log('Play Billing initialized:', billingReady)
        return billingReady
    } catch (error) {
        console.error('Play Billing init error:', error)
        return false
    }
}

// Get available products
export const getProducts = async () => {
    if (!billingReady) return []

    const PlayBilling = getPlayBilling()
    if (!PlayBilling) return []

    try {
        const subscriptionIds = Object.values(PLAY_STORE_PRODUCTS.subscriptions)
        const { products } = await PlayBilling.getProducts({
            productIds: subscriptionIds,
            productType: 'SUBS'
        })
        return products || []
    } catch (error) {
        console.error('Error getting products:', error)
        return []
    }
}

// Purchase subscription
export const purchaseSubscription = async (productId, offerToken) => {
    if (!billingReady) {
        return { success: false, error: 'Play Billing not initialized' }
    }

    const PlayBilling = getPlayBilling()
    if (!PlayBilling) {
        return { success: false, error: 'Play Billing not available' }
    }

    try {
        const result = await PlayBilling.subscribe({
            productId,
            offerToken
        })

        if (result?.purchaseToken) {
            return {
                success: true,
                purchaseToken: result.purchaseToken,
                productId
            }
        }

        return { success: false, error: 'Purchase canceled' }
    } catch (error) {
        console.error('Purchase error:', error)
        return { success: false, error: error.message }
    }
}

// Check current subscriptions
export const getActiveSubscriptions = async () => {
    if (!billingReady) return []

    const PlayBilling = getPlayBilling()
    if (!PlayBilling) return []

    try {
        const { purchases } = await PlayBilling.getPurchases({
            productType: 'SUBS'
        })
        return (purchases || []).filter(p => p.acknowledged)
    } catch (error) {
        console.error('Error getting subscriptions:', error)
        return []
    }
}

// Acknowledge purchase (required after successful verification)
export const acknowledgePurchase = async (purchaseToken) => {
    const PlayBilling = getPlayBilling()
    if (!PlayBilling) return false

    try {
        await PlayBilling.acknowledgePurchase({ purchaseToken })
        return true
    } catch (error) {
        console.error('Acknowledge error:', error)
        return false
    }
}

// Map product ID to tier
export const productToTier = (productId) => {
    if (!productId) return 'free'
    if (productId.includes('starter')) return 'starter'
    if (productId.includes('pro')) return 'pro'
    if (productId.includes('unlimited')) return 'unlimited'
    return 'free'
}
