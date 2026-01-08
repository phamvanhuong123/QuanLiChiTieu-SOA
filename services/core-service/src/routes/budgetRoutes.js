import { Router } from "express";
import * as controller from "../controllers/budgetController.js";

const router = Router();


router.post("/", controller.upsertBudget); 
router.get("/", controller.getBudgets);   
router.delete("/:id", controller.removeBudget); 
export default router;