import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar, Trash2, Edit2, X, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const Goals = () => {
    const { user } = useAuth()
    const [goals, setGoals] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        goal_name: '',
        target_amount: '',
        saved_amount: '0',
        deadline: format(new Date(), 'yyyy-MM-dd')
    })

    useEffect(() => {
        if (user) {
            fetchGoals()
        }
    }, [user])

    const fetchGoals = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('savings_goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data || [])
        } catch (error) {
            console.error('Error fetching goals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = {
                ...formData,
                target_amount: parseFloat(formData.target_amount),
                saved_amount: parseFloat(formData.saved_amount),
                user_id: user.id
            }

            if (editingItem) {
                const { error } = await supabase
                    .from('savings_goals')
                    .update(data)
                    .eq('id', editingItem.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('savings_goals')
                    .insert([data])
                if (error) throw error
            }

            setShowModal(false)
            setEditingItem(null)
            setFormData({ goal_name: '', target_amount: '', saved_amount: '0', deadline: format(new Date(), 'yyyy-MM-dd') })
            fetchGoals()
        } catch (error) {
            console.error('Error saving goal:', error)
        }
    }

    const openEditModal = (goal) => {
        setEditingItem(goal)
        setFormData({
            goal_name: goal.goal_name,
            target_amount: goal.target_amount.toString(),
            saved_amount: goal.saved_amount.toString(),
            deadline: goal.deadline
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this goal?')) {
            try {
                const { error } = await supabase
                    .from('savings_goals')
                    .delete()
                    .eq('id', id)
                if (error) throw error
                fetchGoals()
            } catch (error) {
                console.error('Error deleting goal:', error)
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white transition-colors">Savings Goals</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Plan for your future and reach your milestones.</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setFormData({ goal_name: '', target_amount: '', saved_amount: '0', deadline: format(new Date(), 'yyyy-MM-dd') }); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg dark:shadow-none w-full md:w-auto"
                >
                    <Plus size={20} />
                    Add Savings Goal
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
                ) : goals.length === 0 ? (
                    <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                        No savings goals found. Start dreaming!
                    </div>
                ) : goals.map((goal) => {
                    const progress = (goal.saved_amount / goal.target_amount) * 100
                    const isCompleted = progress >= 100

                    return (
                        <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden group">
                            {isCompleted && (
                                <div className="absolute top-0 right-0 p-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                    <Target size={24} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(goal)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(goal.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{goal.goal_name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                                        <Calendar size={14} />
                                        <span>Target: {format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-end justify-between">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{goal.saved_amount.toLocaleString()}</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Goal: ₹{goal.target_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 bg-emerald-500`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{progress.toFixed(0)}% Saved</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">₹{Math.max(0, goal.target_amount - goal.saved_amount).toLocaleString()} Left</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{editingItem ? 'Update Goal' : 'New Savings Goal'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Goal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.goal_name}
                                    onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                                    placeholder="e.g. Dream House, Euro Trip"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Target (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.target_amount}
                                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Already Saved (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.saved_amount}
                                        onChange={(e) => setFormData({ ...formData, saved_amount: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Target Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                                >
                                    {editingItem ? 'Save Changes' : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Goals
