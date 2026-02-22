import { useState } from 'react'
import { X, Mail, Send, Loader2, CheckCircle2, AlertCircle, Share2 } from 'lucide-react'
import { sendVideoByEmail, validateEmail, isEmailConfigured, shareVideoNative, isNativeShareSupported, getVideoSizeMB } from '../../services/emailService'
import { useTranslation } from '../../store/i18nStore'

export default function EmailModal({ isOpen, onClose, videoData }) {
    const { t, language } = useTranslation()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const texts = {
        es: {
            title: 'Enviar Video por Email',
            subtitle: 'Comparte tu video con alguien especial',
            emailLabel: 'Correo del destinatario',
            emailPlaceholder: 'ejemplo@correo.com',
            messageLabel: 'Mensaje (opcional)',
            messagePlaceholder: '¡Mira este increíble video que hice!',
            videoInfo: 'Información del video',
            videoSize: 'Tamaño',
            cancel: 'Cancelar',
            send: 'Enviar Email',
            sending: 'Enviando...',
            success: '¡Email enviado!',
            successDesc: 'Tu video ha sido compartido exitosamente.',
            close: 'Cerrar',
            shareNative: 'Compartir',
            orShare: 'o compartir directamente',
            notConfigured: 'EmailJS no está configurado. Configúralo en Ajustes > API.',
            invalidEmail: 'Por favor ingresa un email válido',
        },
        en: {
            title: 'Send Video by Email',
            subtitle: 'Share your video with someone special',
            emailLabel: 'Recipient email',
            emailPlaceholder: 'example@email.com',
            messageLabel: 'Message (optional)',
            messagePlaceholder: 'Check out this amazing video I made!',
            videoInfo: 'Video information',
            videoSize: 'Size',
            cancel: 'Cancel',
            send: 'Send Email',
            sending: 'Sending...',
            success: 'Email sent!',
            successDesc: 'Your video has been shared successfully.',
            close: 'Close',
            shareNative: 'Share',
            orShare: 'or share directly',
            notConfigured: 'EmailJS is not configured. Set it up in Settings > API.',
            invalidEmail: 'Please enter a valid email',
        },
        pt: {
            title: 'Enviar Vídeo por Email',
            subtitle: 'Compartilhe seu vídeo com alguém especial',
            emailLabel: 'Email do destinatário',
            emailPlaceholder: 'exemplo@email.com',
            messageLabel: 'Mensagem (opcional)',
            messagePlaceholder: 'Confira este vídeo incrível que eu fiz!',
            videoInfo: 'Informações do vídeo',
            videoSize: 'Tamanho',
            cancel: 'Cancelar',
            send: 'Enviar Email',
            sending: 'Enviando...',
            success: 'Email enviado!',
            successDesc: 'Seu vídeo foi compartilhado com sucesso.',
            close: 'Fechar',
            shareNative: 'Compartilhar',
            orShare: 'ou compartilhar diretamente',
            notConfigured: 'EmailJS não está configurado. Configure em Configurações > API.',
            invalidEmail: 'Por favor insira um email válido',
        }
    }

    const txt = texts[language] || texts.es

    if (!isOpen) return null

    const handleSend = async () => {
        setError('')

        if (!validateEmail(email)) {
            setError(txt.invalidEmail)
            return
        }

        if (!isEmailConfigured()) {
            setError(txt.notConfigured)
            return
        }

        setSending(true)

        try {
            // Get video blob from URL
            let videoBlob = null
            if (videoData?.videoBlob) {
                const response = await fetch(videoData.videoBlob)
                videoBlob = await response.blob()
            }

            await sendVideoByEmail({
                toEmail: email,
                videoTitle: videoData?.title || 'FacelessTube Video',
                videoDescription: videoData?.description || '',
                message: message,
                videoBlob: videoBlob,
            })

            setSent(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setSending(false)
        }
    }

    const handleNativeShare = async () => {
        try {
            const response = await fetch(videoData.videoBlob)
            const blob = await response.blob()
            await shareVideoNative(blob, videoData.title || 'FacelessTube Video')
        } catch (err) {
            if (!err.cancelled) {
                setError(err.message)
            }
        }
    }

    const handleClose = () => {
        setEmail('')
        setMessage('')
        setSent(false)
        setError('')
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aurora-teal/20 to-aurora-violet/20 flex items-center justify-center">
                            <Mail size={24} className="text-aurora-teal" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold">{txt.title}</h2>
                            <p className="text-white/50 text-sm">{txt.subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <X size={20} className="text-white/60" />
                    </button>
                </div>

                {/* Success State */}
                {sent ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-aurora-teal/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                            <CheckCircle2 size={40} className="text-aurora-teal" />
                        </div>
                        <h3 className="text-2xl font-display font-bold mb-2">{txt.success}</h3>
                        <p className="text-white/60 mb-8">{txt.successDesc}</p>
                        <button onClick={handleClose} className="btn-aurora">
                            {txt.close}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Video Info Card */}
                        {videoData && (
                            <div className="mb-6 p-4 rounded-xl bg-cosmic-700/50 border border-white/5">
                                <p className="text-sm font-medium mb-3 text-white/70">{txt.videoInfo}</p>
                                <div className="flex items-start gap-4">
                                    {/* Video Thumbnail */}
                                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-cosmic-600 flex-shrink-0">
                                        {videoData.videoBlob && (
                                            <video
                                                src={videoData.videoBlob}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{videoData.title || 'Video sin título'}</p>
                                        <p className="text-sm text-white/50 truncate">
                                            {videoData.description?.slice(0, 60) || 'Sin descripción'}...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2 text-white/80">
                                {txt.emailLabel}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={txt.emailPlaceholder}
                                className="input-glass"
                                disabled={sending}
                            />
                        </div>

                        {/* Message Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-white/80">
                                {txt.messageLabel}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={txt.messagePlaceholder}
                                className="input-glass min-h-[100px] resize-none"
                                disabled={sending}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                                <span className="text-red-300 text-sm">{error}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="btn-secondary flex-1"
                                disabled={sending}
                            >
                                {txt.cancel}
                            </button>
                            <button
                                onClick={handleSend}
                                className="btn-aurora flex-1 flex items-center justify-center gap-2"
                                disabled={sending || !email}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {txt.sending}
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        {txt.send}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Native Share Alternative */}
                        {isNativeShareSupported() && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-center text-white/40 text-sm mb-3">{txt.orShare}</p>
                                <button
                                    onClick={handleNativeShare}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <Share2 size={18} />
                                    {txt.shareNative}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
