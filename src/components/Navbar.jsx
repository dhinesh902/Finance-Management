import { Bell, Search, User, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth()

    return (
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
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 leading-none">{user?.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="md:size-[20px]" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
