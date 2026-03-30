import { useState, useEffect } from 'react'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Calendar
} from 'lucide-react'
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar
} from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const Dashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlySavings: 0
    })
    const [recentTransactions, setRecentTransactions] = useState([])
    const [expenseData, setExpenseData] = useState([])
    const [comparisonData, setComparisonData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch Income
            const { data: incomeData } = await supabase
                .from('income')
                .select('amount, date, source')
                .eq('user_id', user.id)

            // Fetch Expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('amount, date, category, description')
                .eq('user_id', user.id)

            const totalIncome = incomeData?.reduce((acc, curr) => acc + curr.amount, 0) || 0
            const totalExpenses = expensesData?.reduce((acc, curr) => acc + curr.amount, 0) || 0

            setStats({
                totalIncome,
                totalExpenses,
                balance: totalIncome - totalExpenses,
                monthlySavings: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0
            })

            // Prepare recent transactions
            const combined = [
                ...(incomeData?.map(i => ({ ...i, type: 'Income', category: 'Source', description: i.source })) || []),
                ...(expensesData?.map(e => ({ ...e, type: 'Expense' })) || [])
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

            setRecentTransactions(combined)

            // Prepare expense distribution
            const categories = {}
            expensesData?.forEach(e => {
                categories[e.category] = (categories[e.category] || 0) + e.amount
            })
            setExpenseData(Object.entries(categories).map(([name, value]) => ({ name, value })))

            // Mock comparison data for chart (can be refined to use actual data)
            setComparisonData([
                { name: 'Jan', income: 4000, expense: 2400 },
                { name: 'Feb', income: 3000, expense: 1398 },
                { name: 'Mar', income: 2000, expense: 9800 },
                { name: 'Apr', income: 2780, expense: 3908 },
                { name: 'May', income: 1890, expense: 4800 },
                { name: 'Jun', income: 2390, expense: 3800 },
            ])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
                <p className="text-slate-500">Welcome back! Here's what's happening with your money.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Income"
                    amount={stats.totalIncome}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                    trend="+12% from last month"
                    trendUp={true}
                />
                <StatCard
                    title="Total Expenses"
                    amount={stats.totalExpenses}
                    icon={TrendingDown}
                    color="text-rose-600"
                    bgColor="bg-rose-50"
                    trend="+5% from last month"
                    trendUp={false}
                />
                <StatCard
                    title="Remaining Balance"
                    amount={stats.balance}
                    icon={Wallet}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    trend="On track"
                />
                <StatCard
                    title="Monthly Savings"
                    amount={`${stats.monthlySavings}%`}
                    icon={ArrowUpRight}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                    trend="Goal: 20%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Income vs Expenses</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">Last 6 Months</button>
                        </div>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Distribution */}
                <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Expense Distribution</h3>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseData.length > 0 ? expenseData : [{ name: 'Empty', value: 1 }]}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    {expenseData.length === 0 && <Cell fill="#f1f5f9" />}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                    <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-4 md:px-6 py-4">Transaction</th>
                                <th className="px-4 md:px-6 py-4">Category</th>
                                <th className="px-4 md:px-6 py-4">Date</th>
                                <th className="px-4 md:px-6 py-4">Amount</th>
                                <th className="px-4 md:px-6 py-4">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentTransactions.map((t, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {t.type === 'Income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <span className="font-medium text-slate-700 truncate max-w-[150px] md:max-w-none">{t.description || t.source || 'No description'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-slate-500 text-sm">{t.category}</td>
                                    <td className="px-4 md:px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                                    <td className={`px-4 md:px-6 py-4 font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {t.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentTransactions.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No recent transactions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ title, amount, icon: Icon, color, bgColor, trend, trendUp }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center`}>
                    <Icon size={24} />
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">
                    {typeof amount === 'number' ? `₹${amount.toLocaleString()}` : amount}
                </h3>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span className={`text-xs font-medium ${trendUp === true ? 'text-emerald-500' : trendUp === false ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trend}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
