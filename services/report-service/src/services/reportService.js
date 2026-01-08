import axios from 'axios';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import MonthlyReport from '../models/MonthlyReport.js';

dotenv.config();

export const syncData = async (userId, token) => {

  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "UserId là bắt buộc");
  }

  try {
    const coreUrl = `${process.env.CORE_SERVICE_URL}/transactions`;

    
    const { data: transactions } = await axios.get(coreUrl, {
      params: { userId },
      headers: { Authorization: token } // Chuyển tiếp token để Core xác thực
    });

  
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let income = 0, expense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (
        tDate.getMonth() + 1 === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        if (t.type === 'INCOME') income += Number(t.amount);
        else expense += Number(t.amount);
      }
    });

    const result = await MonthlyReport.findOneAndUpdate(
      { userId, month: currentMonth, year: currentYear },
      {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return result;

  } catch (error) {
    // Xử lý lỗi khi gọi sang Core Service
    if (axios.isAxiosError(error)) {
        console.error("!!! [Sync Lỗi - Core Service]:", error.message);

    }
    


  }
};

export const getDashboard = async (userId, token) => {
  try {
     // Nếu Core Service chết,bắt lỗi để vẫn trả về data cũ 
     await syncData(userId, token);
  } catch (error) {
     console.warn(" [Auto-Sync Warn]: Không thể đồng bộ dữ liệu mới, đang hiển thị dữ liệu cũ.");
    
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