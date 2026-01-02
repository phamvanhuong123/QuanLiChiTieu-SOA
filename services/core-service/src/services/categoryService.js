import { Op } from "sequelize";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import sequelize from "../config/database.js";
export const createCategory = async (data) => {
  return await Category.create(data);
};

export const getCategories = async (userId) => {
  return await Category.findAll({
    where: {
      [Op.or]: [{ userId: null }, { userId }] // Lấy danh mục mặc định + danh mục riêng của user
    }
  });
};

export const deleteCategory = async (id, userId) => {
  // 1. Khởi tạo Transaction (Của Database, không phải Transaction chi tiêu)
  const t = await sequelize.transaction();

  try {
    
    const category = await Category.findOne({ where: { id, userId } });
    if (!category) {
      throw new Error("Danh mục không tồn tại hoặc không có quyền xóa");
    }

    await Transaction.destroy({ 
      where: { categoryId: id, userId }, 
      transaction: t 
    });

    await Budget.destroy({ 
      where: { categoryId: id, userId }, 
      transaction: t 
    });
    await category.destroy({ transaction: t });

    await t.commit();

    return { message: "Đã xóa danh mục và toàn bộ dữ liệu liên quan" };

  } catch (error) {
    // 6. Nếu có lỗi -> Hoàn tác tất cả (Không xóa gì cả)
    await t.rollback();
    throw error;
  }
};

// [MỚI] Sửa danh mục
export const updateCategory = async (id, userId, data) => {
  // Chỉ tìm danh mục của user (userId), không cho sửa danh mục hệ thống (userId: null)
  const category = await Category.findOne({ where: { id, userId } });

  if (!category) {
    throw new Error("Danh mục không tồn tại hoặc bạn không có quyền sửa");
  }

  // Chỉ cho update tên và icon
  return await category.update({
    name: data.name,
    icon: data.icon
  });
};