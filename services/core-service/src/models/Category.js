import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('INCOME', 'EXPENSE'),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'default-icon' 
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true 
  }
});

export default Category;
