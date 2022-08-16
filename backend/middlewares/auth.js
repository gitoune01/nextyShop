const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const ErrHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');

exports.isAuthUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(
      new ErrHandler(
        'Unauthorized access.Login First to access this ressource',
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});

//handling user role
exports.isAuthRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrHandler(
          `Role ${req.user.role} is not allowed to access the ressource`,
          403
        )
      );
    }
    next();
  };
};
