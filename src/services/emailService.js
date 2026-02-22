/**
 * Email Service for FacelessTube
 * Uses EmailJS for sending videos via email (free tier: 200 emails/month)
 * 
 * Setup instructions:
 * 1. Create account at https://emailjs.com
 * 2. Add email service (Gmail, Outlook, etc.)
 * 3. Create email template with variables: {{to_email}}, {{from_name}}, {{message}}, {{video_title}}
 * 4. Get your Public Key, Service ID, and Template ID
 */

// EmailJS configuration - user needs to set these
const EMAILJS_CONFIG = {
    publicKey: localStorage.getItem('emailjs_public_key') || '',
    serviceId: localStorage.getItem('emailjs_service_id') || '',
    templateId: localStorage.getItem('emailjs_template_id') || '',
}

/**
 * Check if EmailJS is configured
 */
export function isEmailConfigured() {
    return !!(EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId)
}

/**
 * Save EmailJS configuration
 */
export function saveEmailConfig(publicKey, serviceId, templateId) {
    localStorage.setItem('emailjs_public_key', publicKey)
    localStorage.setItem('emailjs_service_id', serviceId)
    localStorage.setItem('emailjs_template_id', templateId)

    EMAILJS_CONFIG.publicKey = publicKey
    EMAILJS_CONFIG.serviceId = serviceId
    EMAILJS_CONFIG.templateId = templateId
}

/**
 * Get current EmailJS configuration
 */
export function getEmailConfig() {
    return {
        publicKey: localStorage.getItem('emailjs_public_key') || '',
        serviceId: localStorage.getItem('emailjs_service_id') || '',
        templateId: localStorage.getItem('emailjs_template_id') || '',
    }
}

/**
 * Validate email address format
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Convert blob to base64 for email attachment
 * Note: Large videos might exceed email limits
 */
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

/**
 * Get video size in MB
 */
export function getVideoSizeMB(blob) {
    return (blob.size / (1024 * 1024)).toFixed(2)
}

/**
 * Send video notification via email
 * Since email attachments have size limits, we send a notification with video details
 * The actual video can be downloaded or shared via link
 */
export async function sendVideoByEmail(options) {
    const {
        toEmail,
        fromName = 'FacelessTube',
        videoTitle,
        videoDescription = '',
        message = '',
        videoBlob = null,
    } = options

    // Validate email
    if (!validateEmail(toEmail)) {
        throw new Error('Invalid email address')
    }

    // Check configuration
    if (!isEmailConfigured()) {
        throw new Error('EmailJS is not configured. Please set up your EmailJS credentials in Settings.')
    }

    // Load EmailJS dynamically
    if (!window.emailjs) {
        await loadEmailJS()
    }

    // Initialize EmailJS
    window.emailjs.init(EMAILJS_CONFIG.publicKey)

    // Prepare template parameters
    const templateParams = {
        to_email: toEmail,
        from_name: fromName,
        video_title: videoTitle,
        video_description: videoDescription || 'Video generated with FacelessTube AI',
        message: message || '¡Mira este increíble video que generé con FacelessTube!',
        video_size: videoBlob ? `${getVideoSizeMB(videoBlob)} MB` : 'N/A',
        generated_date: new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
    }

    try {
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        )

        if (response.status === 200) {
            return {
                success: true,
                message: `Email sent successfully to ${toEmail}`,
            }
        } else {
            throw new Error('Failed to send email')
        }
    } catch (error) {
        console.error('EmailJS error:', error)
        throw new Error(error.text || 'Failed to send email. Please check your EmailJS configuration.')
    }
}

/**
 * Load EmailJS library dynamically
 */
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

/**
 * Alternative: Send video via native share API (for supported browsers/devices)
 */
export async function shareVideoNative(videoBlob, title) {
    if (!navigator.share) {
        throw new Error('Native sharing is not supported on this device')
    }

    const file = new File([videoBlob], `${title}.webm`, { type: 'video/webm' })

    try {
        await navigator.share({
            title: title,
            text: 'Check out this video I created with FacelessTube!',
            files: [file],
        })
        return { success: true }
    } catch (error) {
        if (error.name === 'AbortError') {
            return { success: false, cancelled: true }
        }
        throw error
    }
}

/**
 * Check if native sharing with files is supported
 */
export function isNativeShareSupported() {
    return navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], 'test.txt')] })
}

export default {
    isEmailConfigured,
    saveEmailConfig,
    getEmailConfig,
    validateEmail,
    sendVideoByEmail,
    shareVideoNative,
    isNativeShareSupported,
    getVideoSizeMB,
}
