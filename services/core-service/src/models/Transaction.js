import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Category from './Category.js'; // giữ nguyên, KHÔNG chỉnh quan hệ

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL, allowNull: false },
  type: { type: DataTypes.ENUM('INCOME', 'EXPENSE'), allowNull: false },
  note: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  categoryId: { type: DataTypes.INTEGER, allowNull: true }
});

// GIỮ NGUYÊN
Transaction.belongsTo(Category, { foreignKey: 'categoryId' });

export default Transaction;
