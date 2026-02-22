import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    History,
    User,
    Sparkles,
    LogOut,

    Menu,
    X,
    Settings,
    Film,
    GraduationCap
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../store/i18nStore'
import LanguageSelector from '../ui/LanguageSelector'
import SettingsModal from '../ui/SettingsModal'
import InstallPrompt from '../ui/InstallPrompt'

export default function Layout() {
    const { user, logout, getTierInfo } = useAuthStore()
    const { t } = useTranslation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const navigate = useNavigate()
    const tierInfo = getTierInfo()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const navItems = [
        { path: '/app', icon: LayoutDashboard, label: t('nav.dashboard'), end: true },
        { path: '/app/history', icon: History, label: t('nav.history') },
        { path: '/app/library', icon: Film, label: 'Biblioteca' },
        { path: '/app/tutorials', icon: GraduationCap, label: t('nav.tutorials') },
        { path: '/app/premium', icon: Sparkles, label: t('nav.premium') },
        { path: '/app/account', icon: User, label: t('nav.account') },
    ]

    return (
        <div className="min-h-screen flex bg-cosmic-950 overflow-x-hidden">
            {/* Background Effects */}
            <div className="bg-glow-top opacity-50" />

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-3 py-2 flex items-center justify-between" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <span className="font-display font-bold text-aurora">FacelessTube</span>

                <div className="flex items-center gap-2">
                    <LanguageSelector compact />
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 glass border-r border-white/10
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full p-6" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <img
                            src="./logo.png"
                            alt="FacelessTube"
                            className="h-11 w-auto"
                        />
                    </div>

                    {/* Desktop language & settings */}
                    <div className="hidden lg:flex items-center gap-2 mb-8">
                        <LanguageSelector />
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cosmic-700/50 border border-white/10 hover:border-aurora-teal/30 transition-all"
                        >
                            <Settings size={16} className="text-white/60" />
                            <span className="text-sm">API</span>
                        </button>
                    </div>



                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                                    ${isActive
                                        ? 'bg-gradient-to-r from-aurora-teal/15 to-aurora-violet/15 text-white border border-aurora-teal/30 shadow-aurora-teal'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info & tier */}
                    <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            {/* Avatar with aurora border */}
                            <div className="relative">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-aurora-teal via-aurora-violet to-aurora-magenta p-[2px]">
                                    <div className="w-full h-full rounded-full bg-cosmic-800 flex items-center justify-center">
                                        <span className="font-bold text-aurora-teal">
                                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                                <span className={`
                                    text-xs px-2 py-0.5 rounded-full inline-block mt-1
                                    ${user?.tier === 'free' ? 'badge-free' : ''}
                                    ${user?.tier === 'starter' ? 'badge-starter' : ''}
                                    ${user?.tier === 'pro' ? 'badge-pro' : ''}
                                    ${user?.tier === 'unlimited' ? 'badge-unlimited' : ''}
                                `}>
                                    {tierInfo.name}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={20} />
                            <span>{t('nav.logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="flex-1 lg:ml-0 min-h-screen relative z-10 overflow-x-hidden min-w-0">
                <div className="p-3 sm:p-4 lg:p-10 lg:pt-10 pb-8" style={{ paddingTop: 'calc(max(env(safe-area-inset-top, 0px), 44px) + 48px)' }}>
                    <Outlet />
                </div>
            </main>

            {/* Settings Modal */}
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </div>
    )
}
