import * as service from "../services/budgetService.js";

export const upsertBudget = async (req, res, next) => {
  try {
    const result = await service.setBudget(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBudgets = async (req, res, next) => {
  try {
    const { userId, month, year } = req.query;
    const result = await service.getBudgets(userId, month, year);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const removeBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.deleteBudget(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};