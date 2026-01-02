import Budget from "../models/Budget.js";
import Category from "../models/Category.js";


import ApiError from "../utils/ApiError.js"; 
import { StatusCodes } from "http-status-codes";

export const setBudget = async (data) => {
  const existing = await Budget.findOne({
    where: {
      userId: data.userId,
      categoryId: data.categoryId,
      month: data.month,
      year: data.year
    }
  });

  // Nếu có rồi thì update, chưa có thì tạo mới (Upsert)
  if (existing) {
    return await existing.update({ amount: data.amount });
  }

  return await Budget.create(data);
};

export const getBudgets = async (userId, month, year) => {
  
  const whereCondition = { userId };
  if (month) whereCondition.month = month;
  if (year) whereCondition.year = year;

  return await Budget.findAll({
    where: whereCondition,
    include: [{ 
      model: Category
    }]
  });
};


export const deleteBudget = async (id) => {
  const budget = await Budget.findByPk(id);
  
  if (!budget) {
    
    throw new ApiError(StatusCodes.NOT_FOUND, "Hạn mức không tồn tại");
   
  }

  await budget.destroy();
  return { message: "Xóa hạn mức thành công" };
};