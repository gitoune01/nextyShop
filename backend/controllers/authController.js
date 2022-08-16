const User = require('../models/userModel');
const ErrHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('cloudinary');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
//setup cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Register user
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar);
    console.log('uploaded image url =>', result);

    const user = await User.create({
      //create call save
      name,
      email,
      password,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    sendToken(user, 200, res);
  } catch (err) {
    console.log(err);
  }
});

//login user

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrHandler('Please provide all credentials', 400));
  }

  //finding user in DB
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrHandler('Invalid credentials1. Please retry', 401));
  }

  //checks password validity

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrHandler('Invalid credentials2. Please retry', 401));
  }

  sendToken(user, 200, res);
});

//forgot password  /api/v1/users/password/forgot

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
console.log('EMAIL:', req.body.email)
  if (!user) {
    return next(new ErrHandler('No matching user found', 404));
  }

  //get reset token

  const resetToken = user.getResetTokenPassword();

  await user.save({ validateBeforeSave: false }); //diactivate required fields validation at saving

  //create reset password url

  const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'NextyShop Password Recovery',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrHandler(error.message, 500));
  }
});

//reset password => /api/v1/users/password/reset/:token

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //hash URL token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //compare if incoming reset token and the one in DB is the same

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrHandler('Password reset token invalid or expired', 400));
  }

  if (req.body.password !== req.body.confPassword) {
    return next(new ErrHandler('Password does not match, 400'));
  }
  //setup new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//logout user

exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('token', null, {
    //send back to the client an empty cookie
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    //send back regular client response
    success: true,
    message: 'Logged Out',
  });
});

//Get current logged in user infos /api/users/me

exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//update /change current logged in user /api/v1/users/password/update

exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //check previous user password
  const isMatch = await user.comparePassword(req.body.oldPassword);
  if (!isMatch) {
    return next(new ErrHandler('Wrong password, does not match!', 400));
  }

  user.password = req.body.password;

  await user.save();

  sendToken(user, 200, res);
});

//update user profile => /api/v1/users/me/update

exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  //update avatar:
  try {
    if (req.body.avatar !== '') {
      const user = await User.findById(req.user.id);
      const image_id = user.avatar.public_id;
      const res = await cloudinary.v2.uploader.destroy(image_id);
    }
    const result = await cloudinary.v2.uploader.upload(req.body.avatar);
    console.log('uploaded image url =>', result);
    newUserData.avatar = {
      public_id: result.public_id,
      url:result.secure_url
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
    });

  } catch (err) {
    console.log(err);
  }


  res.status(200).json({
    success: true,
    user
  });
});

//All profile users admin access /api/v1/users/admin/allprofiles

exports.allUsers = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find();

  res.status(200).json({
    success: true,
    allUsers,
  });
});

//get specific profile user by id admin access /api/v1/users/admin/user/:id

exports.userProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrHandler(`'User profile id: ${id} not found!'`, 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//upsate specific profile on id by admin /api/v1/users/admin/update/user/:id

exports.updateUserProfile = asyncHandler(async (req, res, next) => {

  console.log('YOU GET THERE:',req.body)
  const { id } = req.params;
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
   });
});

//delete specific user on id by admin /api/v1/users/admin/delete/user/:id

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrHandler(`'User profile id: ${id} not found!'`, 400));
  }

  await user.deleteOne({ _id: id });

  //Remove Avatar from cloudinary later

  res.status(200).json({
    success: true,
    message: 'Profile user deleted!',
  });
});
