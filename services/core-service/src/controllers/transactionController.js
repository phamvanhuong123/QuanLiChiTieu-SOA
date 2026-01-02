import service from "../services/transactionService.js";

export const create = async (req, res, next) => {
  try {
    const result = await service.createTransaction(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await service.getTransactions(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await service.updateTransaction(id, userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;


    const result = await service.deleteTransaction(id, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await service.getTransactionById(id, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.query; // ?keyword=coffee
    const result = await service.searchTransactions(userId, keyword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
export const filter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type } = req.query; 
    const result = await service.filterTransactions(userId, startDate, endDate, type);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getRecent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await service.getRecentTransactions(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    const result = await service.getStatsByCategory(userId, month, year);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};