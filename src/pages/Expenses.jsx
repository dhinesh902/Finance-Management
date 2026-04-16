import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Tag, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { triggerNotification } from "../utils/notificationService";

const Expenses = () => {
  const { user } = useAuth();
  const categories = [
    "Food",
    "Rent",
    "Transport",
    "Utilities",
    "Shopping",
    "Health",
    "Entertainment",
    "Others",
  ];
  const [expenses, setExpenses] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: "Food",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    payment_method: "UPI",
    status: "Paid",
  });

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchTotalIncome();
    }
  }, [user]);

  const fetchTotalIncome = async () => {
    try {
      const { data, error } = await supabase
        .from("income")
        .select("amount")
        .eq("user_id", user.id);
      if (error) throw error;
      const total = data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      setTotalIncome(total);
    } catch (error) {
      console.error("Error fetching total income:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert([expenseData]);
        if (error) throw error;
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({
        category: "Food",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        payment_method: "UPI",
        status: "Paid",
      });
      fetchExpenses();
      fetchTotalIncome();

      // Calculate current total expenses (excluding the item if editing)
      const currentTotalExpenses = expenses.reduce((acc, curr) => {
        if (editingItem && curr.id === editingItem.id) return acc;
        return acc + curr.amount;
      }, 0);

      // Trigger notification with income limit checks
      await triggerNotification(expenseData, totalIncome, currentTotalExpenses);
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense record");
    }
  };

  const openEditModal = (expense) => {
    setEditingItem(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      date: format(new Date(expense.date), "yyyy-MM-dd"),
      description: expense.description || "",
      payment_method: expense.payment_method || "UPI",
      status: expense.status || "Paid",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      try {
        const { error } = await supabase.from("expenses").delete().eq("id", id);
        if (error) throw error;
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Expense Management
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Keep track of every rupee you spend.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              category: "Food",
              amount: "",
              date: format(new Date(), "yyyy-MM-dd"),
              description: "",
              payment_method: "UPI",
              status: "Paid",
            });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-200 dark:shadow-none w-full md:w-auto"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search description..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-600 dark:text-slate-400 focus:outline-none flex-1">
              <option>All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-4 md:px-6 py-4">Date</th>
                <th className="px-4 md:px-6 py-4">Category</th>
                <th className="px-4 md:px-6 py-4">Description</th>
                <th className="px-4 md:px-6 py-4">Method</th>
                <th className="px-4 md:px-6 py-4">Amount</th>
                <th className="px-4 md:px-6 py-4">Status</th>
                <th className="px-4 md:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-400 italic"
                  >
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(expense.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold">
                        <Tag size={12} />
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-medium">
                      {expense.description || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-slate-500">
                      {expense.payment_method}
                    </td>
                    <td className="px-4 md:px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold ${expense.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                        expense.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-rose-100 text-rose-600'
                        }`}>
                        {expense.status || 'Paid'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 border dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingItem ? "Update Expense" : "Add New Expense"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                  placeholder="What was this for?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold shadow-lg dark:shadow-none hover:bg-rose-700 transition-all mt-4"
              >
                {editingItem ? "Update Expense" : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
