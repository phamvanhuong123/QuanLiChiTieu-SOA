import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: String,
  month: Number,
  year: Number,
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }
});

schema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('MonthlyReport', schema);
