// API Configuration - All APIs are now server-side
// Users don't need to configure any API keys

// Legacy — kept for backward compatibility, always returns empty
export const getApiKey = (service) => {
    return localStorage.getItem(`facelesstube_${service}_key`) || ''
}

// Legacy — kept for backward compatibility
export const setApiKey = (service, key) => {
    if (key) {
        localStorage.setItem(`facelesstube_${service}_key`, key)
    } else {
        localStorage.removeItem(`facelesstube_${service}_key`)
    }
}

// Everything is always configured (server-side)
export const isServiceConfigured = () => true

// Legacy — kept for backward compatibility
export const hasUserKey = (service) => {
    return !!localStorage.getItem(`facelesstube_${service}_key`)
}

// Clear user's key
export const clearUserKey = (service) => {
    localStorage.removeItem(`facelesstube_${service}_key`)
}

// All services are always configured via backend
export const getApiStatus = () => {
    return {
        pexels: { configured: true },
        youtube: { configured: isServiceConfigured('youtube') }
    }
}
