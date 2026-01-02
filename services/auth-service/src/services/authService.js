const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');

exports.register = async (data) => {
    try{
    const user = await User.findOne({ where: { email :  data.email  } });
    if(user){
      throw new ApiError(StatusCodes.CONFLICT,"Người dùng đã tồn tại")
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await User.create({ ...data, password: hashedPassword });
    }
    catch(err){
      throw err
    }
};

exports.login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Thất bại đăng nhập không hợp lệ");
    }
    const token = jwt.sign({ id: user.id, fullName : user.fullName,email : user.email }, process.env.JWT_SECRET,{ expiresIn: '2h' });
    return { user, token };
};


exports.changePassword = async (userId, currentPassword, newPassword) => {
    
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
    }

   
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu cũ không chính xác");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
};

exports.updateProfile = async (userId, fullName) => {
   
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
    }

   
    user.fullName = fullName;
    await user.save(); 
    
  
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { 
        message: "Cập nhật thông tin thành công",
        user: userResponse 
    };
};