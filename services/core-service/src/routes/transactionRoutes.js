import { Router } from "express";
import * as controller from "../controllers/transactionController.js";

const router = Router();


router.post("/", controller.create);        // Tạo giao dịch
router.get("/", controller.getAll);         // Lấy danh sách
router.put("/:id", controller.update);      // Sửa giao dịch
router.delete("/:id", controller.remove);   // Xóa giao dịch

router.get("/search", controller.search);     
router.get("/filter", controller.filter);     
router.get("/recent", controller.getRecent);  
// router.get("/stats", controller.getStats);
router.get("/:id", controller.getOne);
export default router;
