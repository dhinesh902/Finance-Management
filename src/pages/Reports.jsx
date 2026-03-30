import { useState, useEffect } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts'
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

const Reports = () => {
    const { user } = useAuth()
    const [monthlyData, setMonthlyData] = useState([])
    const [categoryData, setCategoryData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchReportData()
        }
    }, [user])

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

            // Process Monthly Data (last 6 months)
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const date = subMonths(new Date(), i)
                return {
                    month: format(date, 'MMM'),
                    key: format(date, 'yyyy-MM'),
                    income: 0,
                    expense: 0,
                    savings: 0
                }
            }).reverse()

            last6Months.forEach(m => {
                m.income = incomeData
                    ?.filter(i => i.date.startsWith(m.key))
                    .reduce((acc, curr) => acc + curr.amount, 0) || 0

                m.expense = expensesData
                    ?.filter(e => e.date.startsWith(m.key))
                    .reduce((acc, curr) => acc + curr.amount, 0) || 0

                m.savings = m.income - m.expense
            })

            setMonthlyData(last6Months)

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
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filters
                    </button>
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
                                <p className="text-xs text-slate-400">Monthly comparison for last 6 months</p>
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
