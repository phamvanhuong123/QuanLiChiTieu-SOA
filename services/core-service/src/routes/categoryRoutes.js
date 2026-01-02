import { Router } from "express";
import * as controller from "../controllers/categoryController.js";

const router = Router();

router.post("/", controller.createCategory); // Tạo danh mục
router.get("/", controller.getCategories);   // Lấy danh mục
router.delete('/:id', controller.remove) // xoá danh mục
router.put("/:id", controller.updateCategory);// sửa danh mục
export default router;