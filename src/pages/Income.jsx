import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      setIncomes(data || []);
    } catch (error) {
      console.error("Error fetching income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user.id,
      };
      if (editingItem) {
        const { error } = await supabase
          .from("income")
          .update(incomeData)
          .eq("id", editingItem.id);
        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("income").insert([incomeData]);
        if (error) throw error;
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({
        source: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
      fetchIncomes();
    } catch (error) {
      console.error("Error saving income:", error);
      alert("Failed to save income record");
    }
  };

  const openEditModal = (income) => {
    setEditingItem(income);
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      date: format(new Date(income.date), "yyyy-MM-dd"),
      description: income.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const { error } = await supabase.from("income").delete().eq("id", id);
        if (error) throw error;
        fetchIncomes();
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Income Management
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Track and manage your various income sources.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              source: "",
              amount: "",
              date: format(new Date(), "yyyy-MM-dd"),
              description: "",
            });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 w-full md:w-auto"
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search source..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors flex-1 sm:flex-none">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-4 md:px-6 py-4">Date</th>
                <th className="px-4 md:px-6 py-4">Source</th>
                <th className="px-4 md:px-6 py-4">Amount</th>
                <th className="px-4 md:px-6 py-4">Description</th>
                <th className="px-4 md:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-400 italic"
                  >
                    No income records found
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr
                    key={income.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(income.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 md:px-6 py-4 font-semibold">
                      {income.source}
                    </td>
                    <td className="px-4 md:px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">
                      ₹{income.amount.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm opacity-70 truncate max-w-xs">
                      {income.description || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => openEditModal(income)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
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
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingItem ? "Edit Income" : "Add New Income"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Salary, Freelance"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                  placeholder="Details about the income..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all mt-4"
              >
                {editingItem ? "Update Record" : "Add Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
