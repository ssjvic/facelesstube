// API Validation utilities
// All API keys are now server-side — validation not needed from frontend
// Kept for backward compatibility

// Validate any service — always returns valid since backend handles keys
export const validateApiKey = async (service, apiKey) => {
    return { valid: true, error: null }
}
