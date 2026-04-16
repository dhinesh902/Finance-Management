import { supabase } from "../lib/supabase";
import { messaging } from "../notification/firebase";
import toast from "react-hot-toast";

/**
 * Service to handle notification logic
 * 1. Saves notification to Supabase
 * 2. Triggers Firebase Cloud Messaging (FCM)
 */
export const triggerNotification = async (expenseData, totalIncome, currentTotalExpenses = 0) => {
  try {
    const { user_id, amount, status, date, category } = expenseData;

    let message = status === "Paid"
      ? `New expense recorded: ₹${amount.toLocaleString()} for ${category}.`
      : `You have a pending expense payment of ₹${amount.toLocaleString()} for ${category}.`;
    let type = status === "Paid" ? "success" : status === "Pending" ? "warning" : "error";

    // Income limit checks
    if (totalIncome > 0) {
      const newTotal = currentTotalExpenses + amount;
      if (newTotal > totalIncome) {
        const limitExceededMessage = `⚠️ Budget Alert: Total expenses (₹${newTotal.toLocaleString()}) have exceeded your total income (₹${totalIncome.toLocaleString()})!`;

        // Save alert to Supabase
        await supabase.from("notifications").insert([{
          user_id,
          message: limitExceededMessage,
          amount: newTotal - totalIncome,
          expense_status: "Exceeded",
          type: "error",
          status: "unread",
          created_at: new Date().toISOString(),
        }]);

        toast.error(limitExceededMessage, { duration: 6000 });
      } else if (newTotal > totalIncome * 0.9) {
        const nearLimitMessage = `🔔 Warning: Your total expenses are nearing your income limit (90% reached). Total: ₹${newTotal.toLocaleString()} / Income: ₹${totalIncome.toLocaleString()}`;

        // Save warning to Supabase
        await supabase.from("notifications").insert([{
          user_id,
          message: nearLimitMessage,
          amount: newTotal,
          expense_status: "Warning",
          type: "warning",
          status: "unread",
          created_at: new Date().toISOString(),
        }]);

        toast(nearLimitMessage, { icon: "⚠️", duration: 5000 });
      }
    }

    // 1. Save standard expense notification to Supabase
    const { data, error } = await supabase.from("notifications").insert([
      {
        user_id,
        message,
        amount,
        expense_status: status,
        type,
        status: "unread",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    // 2. Trigger Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Expense Alert", {
        body: message,
        icon: "/logo.png",
      });
    }

    // 3. Show UI feedback
    toast(message, {
      icon: "🔔",
      duration: 5000,
    });

    console.log("Notification triggered and saved:", message);
  } catch (error) {
    console.error("Error triggering notification:", error);
  }
};

/**
 * Backend/Edge Function Logic (Example)
 *
 * This is what you would put in a Supabase Edge Function to trigger FCM
 * via the Firebase Admin SDK.
 *
 * export const backendTriggerFCM = async (payload) => {
 *   const response = await fetch('https://fcm.googleapis.com/fcm/send', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `key=YOUR_SERVER_KEY`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({
 *       to: payload.fcm_token,
 *       notification: {
 *         title: "Pending Expense",
 *         body: payload.message
 *       },
 *       data: payload.data
 *     })
 *   });
 *   return response.json();
 * }
 */
