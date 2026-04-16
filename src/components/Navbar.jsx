import { User, Menu, X, LogOut, Settings as SettingsIcon, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Navbar = ({ onMenuClick }) => {
    const { user, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/login')
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    return (
        <>
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                    >
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="md:size-[20px]" />
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Dialog */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</h2>
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 border-4 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
                                    ) : (
                                        <User size={32} />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.user_metadata?.full_name || 'User'}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <SettingsIcon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Settings</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage account & preferences</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-red-600">Sign Out</p>
                                        <p className="text-xs text-red-400">Exit secure session</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                            <p className="text-xs text-slate-400 font-medium">Finance Manager v1.0</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar
