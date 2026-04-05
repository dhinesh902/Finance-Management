import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts'
import { Filter, TrendingUp, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

const Reports = () => {
    const { user } = useAuth()
    const [monthlyData, setMonthlyData] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterRange, setFilterRange] = useState(6) // Number of months
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        if (user) {
            fetchReportData()
        }
    }, [user, filterRange])

    const fetchReportData = async () => {
        try {
            setLoading(true)

            // Fetch Income
            const { data: incomeData } = await supabase
                .from('income')
                .select('amount, date')
                .eq('user_id', user.id)

            // Fetch Expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('amount, date, category')
                .eq('user_id', user.id)

            // Process Monthly Data based on filterRange
            const monthArray = Array.from({ length: filterRange }, (_, i) => {
                const date = subMonths(new Date(), i)
                return {
                    month: format(date, 'MMM'),
                    key: format(date, 'yyyy-MM'),
                    income: 0,
                    expense: 0,
                    savings: 0
                }
            }).reverse()

            monthArray.forEach(m => {
                m.income = incomeData
                    ?.filter(i => i.date.startsWith(m.key))
                    .reduce((acc, curr) => acc + curr.amount, 0) || 0

                m.expense = expensesData
                    ?.filter(e => e.date.startsWith(m.key))
                    .reduce((acc, curr) => acc + curr.amount, 0) || 0

                m.savings = m.income - m.expense
            })

            setMonthlyData(monthArray)

            // Process Category Data (current month)
            const currentMonthKey = format(new Date(), 'yyyy-MM')
            const categories = {}
            expensesData
                ?.filter(e => e.date.startsWith(currentMonthKey))
                .forEach(e => {
                    categories[e.category] = (categories[e.category] || 0) + e.amount
                })

            setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })))

        } catch (error) {
            console.error('Error fetching report data:', error)
            toast.error('Failed to fetch report data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Financial Reports</h1>
                    <p className="text-sm md:text-base text-slate-500">In-depth analysis of your financial health.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto relative">
                    <div className="relative flex-1 md:flex-none">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-lg shadow-primary/20"
                        >
                            <Filter size={18} />
                            Last {filterRange} Months
                            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {[3, 6, 12, 24].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setFilterRange(range)
                                            setShowFilters(false)
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filterRange === range ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        Last {range} Months
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Monthly Spending Trend */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800">Income vs Expenses</h3>
                                <p className="text-xs text-slate-400">Monthly comparison for last {filterRange} months</p>
                            </div>
                            <TrendingUp size={20} className="text-emerald-500" />
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Savings Growth */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800">Savings Growth</h3>
                                <p className="text-xs text-slate-400">Monthly savings trend</p>
                            </div>
                            <TrendingUp size={20} className="text-blue-500" />
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Expenses */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm md:col-span-2">
                        <h3 className="font-bold text-slate-800 mb-8">Expense Breakdown by Category (Current Month)</h3>
                        {categoryData.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 italic">No expenses recorded for this month.</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} width={80} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    {categoryData.sort((a, b) => b.value - a.value).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                <span className="font-semibold text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">₹{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Reports


