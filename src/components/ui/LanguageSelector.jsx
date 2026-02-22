// Language Selector with Flags Dropdown
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Globe } from 'lucide-react'
import { useTranslation, LANGUAGES } from '../../store/i18nStore'

export default function LanguageSelector({ compact = false }) {
    const { language, setLanguage, getCurrentLanguage } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const currentLang = getCurrentLanguage()
    const languages = Object.values(LANGUAGES)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (langCode) => {
        setLanguage(langCode)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-xl transition-all ${compact
                        ? 'p-2 hover:bg-white/10'
                        : 'px-3 py-2 bg-dark-600/50 hover:bg-dark-600 border border-white/10'
                    }`}
            >
                <span className="text-xl">{currentLang?.flag}</span>
                {!compact && (
                    <>
                        <span className="text-sm font-medium">{currentLang?.name}</span>
                        <ChevronDown
                            size={16}
                            className={`text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </>
                )}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl glass border border-white/10 shadow-xl z-50 animate-scale-in origin-top-right">
                    <div className="px-3 py-2 text-xs text-white/50 uppercase tracking-wide flex items-center gap-2">
                        <Globe size={12} />
                        <span>Idioma / Language</span>
                    </div>

                    <div className="mt-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors ${language === lang.code ? 'bg-white/5' : ''
                                    }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className="flex-1 text-left text-sm">{lang.name}</span>
                                {language === lang.code && (
                                    <Check size={16} className="text-neon-green" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
