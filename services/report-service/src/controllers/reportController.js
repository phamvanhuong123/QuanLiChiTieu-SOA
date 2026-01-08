import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js'; 
import * as service from '../services/reportService.js';

// export const sync = async (req, res, next) => {
//   try {

//     const userId = req.user?.id 
//     const token = req.headers.authorization;

//     if (!userId) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin userId để đồng bộ');
//     }

//     await service.syncData(userId, token);
    
//     res.status(StatusCodes.OK).json({ 
//       message: 'Đồng bộ dữ liệu thành công' 
//     });
//   } catch (err) {
//     next(err);
//   }
// };


export const getDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization;
    const {month,year} = req.query;
    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'userId không được để trống');
    }

    // await service.syncData(userId, token);
    console.log("Không thể chạy vào cái này")
    const data = await service.getDashboard(userId,token,month,year);
    
    res.status(StatusCodes.OK).json(data || { 
      totalIncome: 0, 
      totalExpense: 0, 
      balance: 0 
    });
  } catch (err) {
    next(err);
  }
};

export const getYearly = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;

    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'userId không được để trống');
    }
    if (!year) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng cung cấp năm (year) cần xem báo cáo');
    }

    const data = await service.getYearlyStats(userId, year);
    
    res.status(StatusCodes.OK).json(data);
  } catch (err) {
    next(err);
  }
};