const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
        
        const result = await authService.register({email, password, fullName});
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res,next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};


exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;
      
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { fullName } = req.body;
      
        const result = await authService.updateProfile(userId, fullName);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};