import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../core-service/src/utils/ApiError.js";

dotenv.config();

const verifyToken = (req, res, next) => {
  // 1. Lấy token từ Header: Bearer xxx
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Không có token");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn user vào req
    req.user = verified;

    next();
  } catch (err) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Token không hợp lệ");
  }
};

export default verifyToken;
