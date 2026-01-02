import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize"; // Thêm Sequelize để dùng hàm tính tổng

import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import {StatusCodes} from 'http-status-codes'
dotenv.config();


const checkBudgetExceeded = async (userId, categoryId, newAmount, date) => {
  const transDate = new Date(date);
  const month = transDate.getMonth() + 1;
  const year = transDate.getFullYear();

  const budget = await Budget.findOne({
    where: { userId, categoryId, month, year },
  });

  if (!budget) return null;

  const totalSpent =
    (await Transaction.sum("amount", {
      where: {
        userId,
        categoryId,
        type: "EXPENSE",
        date: {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        },
      },
    })) || 0;

  if (Number(totalSpent) + Number(newAmount) > Number(budget.amount)) {
    return {
      isExceeded: true,
      limit: budget.amount,
      current: Number(totalSpent) + Number(newAmount),
    };
  }
  return null;
};



// 1. Tạo giao dịch (Có cảnh báo hạn mức)
const createTransaction = async (data) => {
  let warning = null;
  if (data.type === "EXPENSE" && data.categoryId) {
    const check = await checkBudgetExceeded(
      data.userId,
      data.categoryId,
      data.amount,
      data.date
    );

    if (check?.isExceeded) {
      warning = `Cảnh báo: Bạn đã vượt quá ngân sách ${check.limit} đ`;
    }
  }

  const newTrans = await Transaction.create(data);
  // Trả về kèm thông tin warning để frontend hiển thị
  return { ...newTrans.toJSON(), warning };
};


const getTransactions = async (userId) => {
  return await Transaction.findAll({
    where: { userId },
    include: [{ model: Category, attributes: ["name", "icon", "type"] }],
    order: [["date", "DESC"]],
  });
};

const getTransactionById = async (id, userId) => {
  const trans = await Transaction.findOne({
    where: { id, userId },
    include: [{ model: Category, attributes: ["name", "icon", "type"] }],
  });
  if (!trans) throw new ApiError(StatusCodes.NOT_FOUND,"Giao dịch không tìm thấy");
  return trans;
};

// 4. Cập nhật
const updateTransaction = async (id, userId, updateData) => {
  const trans = await Transaction.findOne({ where: { id, userId } });
  if (!trans) throw new ApiError(StatusCodes.NOT_FOUND,"Giao dịch không tìm thấy");

  await trans.update(updateData);
  return trans;
};

// 5. Xóa
const deleteTransaction = async (id, userId) => {
  const trans = await Transaction.findOne({ where: { id, userId } });
  if (!trans) throw new ApiError(StatusCodes.NOT_FOUND,"Giao dịch không tìm thấy");

  await trans.destroy();
  return { message: "Xóa thành công" };
};

// 6. [MỚI] Tìm kiếm theo ghi chú
const searchTransactions = async (userId, keyword) => {
  return await Transaction.findAll({
    where: {
      userId,
      note: { [Op.iLike]: `%${keyword}%` }, 
    },
    include: [{ model: Category, attributes: ["name", "icon"] }],
    order: [["date", "DESC"]],
  });
};

// 7. [MỚI] Bộ lọc nâng cao (Ngày & Loại)
const filterTransactions = async (userId, startDate, endDate, type) => {
  const whereCondition = { userId };

  // Nếu có ngày bắt đầu và kết thúc
  if (startDate && endDate) {
    whereCondition.date = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }
  // Nếu có lọc theo loại (INCOME/EXPENSE)
  if (type) {
    whereCondition.type = type;
  }

  return await Transaction.findAll({
    where: whereCondition,
    include: [{ model: Category, attributes: ["name", "icon"] }],
    order: [["date", "DESC"]],
  });
};

// 8. [MỚI] Lấy 5 giao dịch gần nhất (Widget Dashboard)
const getRecentTransactions = async (userId) => {
  return await Transaction.findAll({
    where: { userId },
    limit: 5,
    order: [["date", "DESC"]],
    include: [{ model: Category, attributes: ["name", "icon"] }],
  });
};

// 9. [MỚI] Thống kê chi tiêu theo danh mục (Cho biểu đồ tròn)
const getStatsByCategory = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Group by Category và tính tổng Amount
  return await Transaction.findAll({
    attributes: [
      'categoryId',
      [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
    ],
    where: {
      userId,
      type: 'EXPENSE',
      date: { [Op.between]: [startDate, endDate] }
    },
    group: ['categoryId'],
    include: [{ model: Category, attributes: ['name', 'icon'] }]
  });
};

export default {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionById,  
  searchTransactions,  
  filterTransactions,  
  getRecentTransactions, 
  getStatsByCategory, 
};