import * as service from "../services/categoryService.js";

export const createCategory = async (req, res, next) => {
  try {
    const result = await service.createCategory(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await service.getCategories(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res,next) => {
  try {
    const { id } = req.params; // Lấy ID danh mục từ URL
    const userId = req.user.id; // Lấy ID user từ Token

    await service.deleteCategory(id, userId);

    res.json({ message: "Xóa thành công!" });
  } catch (error) {
    next(error)
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy ID danh mục từ URL
    const userId =  req.user.id
    
    const result = await service.updateCategory(id, userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};