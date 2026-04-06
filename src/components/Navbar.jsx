import { Search, User, Menu, X, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Navbar = ({ onMenuClick }) => {
    const { user, signOut } = useAuth()
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
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
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
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Profile Details</h2>
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 border-4 border-white shadow-sm ring-1 ring-slate-100">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
                                    ) : (
                                        <User size={32} />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{user?.user_metadata?.full_name || 'User'}</h3>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <SettingsIcon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900">Settings</p>
                                        <p className="text-xs text-slate-500">Manage account & preferences</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-red-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-red-600">Sign Out</p>
                                        <p className="text-xs text-red-400">Exit secure session</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 text-center">
                            <p className="text-xs text-slate-400 font-medium">Finance Manager v1.0</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar
