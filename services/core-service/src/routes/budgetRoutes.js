import { Router } from "express";
import * as controller from "../controllers/budgetController.js";

const router = Router();


router.post("/", controller.upsertBudget); // Tạo/Sửa hạn mức
router.get("/", controller.getBudgets);    // Xem danh sách hạn mức
router.delete("/:id", controller.removeBudget); 
export default router;