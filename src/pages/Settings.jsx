import { useState } from 'react'
import { User, Lock, Bell, Globe, Palette, Shield, Laptop, Moon, Sun, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

const Settings = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('Profile')
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')

    const handleUpdateProfile = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })
            if (error) throw error
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm md:text-base text-slate-500">Manage your profile and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {['Profile', 'Security', 'Preferences'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm md:text-base text-left",
                                activeTab === tab
                                    ? "bg-white text-primary shadow-sm border border-slate-100"
                                    : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            {tab === 'Profile' && <User size={20} />}
                            {tab === 'Security' && <Shield size={20} />}
                            {tab === 'Preferences' && <Globe size={20} />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8">
                    {activeTab === 'Profile' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 group relative overflow-hidden shrink-0">
                                    <User size={32} />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <p className="text-white text-[10px] md:text-xs font-bold uppercase">Change</p>
                                    </div>
                                </div>
                                <div className="text-center sm:text-left min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg md:text-xl truncate">{user?.user_metadata?.full_name || 'User'}</h3>
                                    <p className="text-sm text-slate-500 mb-2 truncate">{user?.email}</p>
                                    <button className="text-xs font-bold text-primary hover:underline">Remove photo</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                    <input type="text" disabled value={user?.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none text-sm opacity-60 cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800">Password</h3>
                                <p className="text-xs text-slate-500">To change your password, we will send a reset link to your email.</p>
                                <button
                                    onClick={async () => {
                                        const { error } = await supabase.auth.resetPasswordForEmail(user.email)
                                        if (error) alert(error.message)
                                        else alert('Password reset email sent!')
                                    }}
                                    className="w-full sm:w-auto text-primary font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Send Reset Email
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800">Two-factor Authentication</h3>
                                        <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                                    </div>
                                    <button className="w-full sm:w-auto text-blue-600 font-bold text-sm px-4 py-2 hover:bg-blue-50 rounded-lg whitespace-nowrap">Enable 2FA</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Preferences' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800">General</h3>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <Moon size={20} className="text-slate-500" />
                                        <span className="font-medium text-slate-700">Dark Mode</span>
                                    </div>
                                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <Globe size={20} className="text-slate-500" />
                                        <span className="font-medium">Currency</span>
                                    </div>
                                    <select className="bg-transparent font-bold text-primary outline-none text-sm">
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
