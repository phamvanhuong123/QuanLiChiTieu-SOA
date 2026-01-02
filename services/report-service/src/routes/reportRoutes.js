import express from 'express';
import * as controller from '../controllers/reportController.js';

const router = express.Router();


router.get('/dashboard/:userId', controller.getDashboard);
router.get('/yearly/:userId', controller.getYearly);
export default router;
