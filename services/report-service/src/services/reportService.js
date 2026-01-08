import axios from 'axios';
import dotenv from 'dotenv';

import MonthlyReport from '../models/MonthlyReport.js';

dotenv.config();

export const syncData = async (userId, token) => {
  if (!userId) {
    throw new Error("UserId là bắt buộc");
  }

  try {
    const coreUrl = `${process.env.CORE_SERVICE_URL}/transactions`;

    const { data: transactions } = await axios.get(coreUrl, {
      params: { userId },
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 3000 
    });

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let income = 0, expense = 0;

    for (const t of transactions) {
      const tDate = new Date(t.date);
      if (
        tDate.getMonth() + 1 === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        t.type === "INCOME"
          ? (income += Number(t.amount))
          : (expense += Number(t.amount));
      }
    }

    return await MonthlyReport.findOneAndUpdate(
      { userId, month: currentMonth, year: currentYear },
      {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
      },
      { upsert: true, new: true }
    );

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn("Core Service unavailable, skip sync");
      return null; 
    }
    throw error;
  }
};


export const getDashboard = async (userId, token) => {
  try {
     // Nếu Core Service chết,bắt lỗi để vẫn trả về data cũ (fallback)
     await syncData(userId, token);
  } catch (error) {
      console.error("Sync data failed:", error.message);
    
  }
  const today = new Date();
  const report = await MonthlyReport.findOne({
    userId,
    month: today.getMonth() + 1,
    year: today.getFullYear()
  });

  // Nếu chưa có report nào (user mới tinh), trả về default
  return report || { 
      userId, 
      totalIncome: 0, 
      totalExpense: 0, 
      balance: 0 
  };
};

export const getYearlyStats = async (userId, year) => {
  return await MonthlyReport.find({
    userId,
    year: Number(year)
  }).sort({ month: 1 });
};