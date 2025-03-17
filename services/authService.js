const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserModel = require('../models/userModel');
const APIError = require('../utils/apiError');

const sendEmail = require('../utils/sendEmail');
const { sanitizeUser } = require('../utils/sanitizeData');

// UTILS

const createToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const generateResetCode = () => {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
  return resetCode;
};

const hashResetCode = (resetCode, userId) => {
  const secret = userId; // Use user ID or email as a secret key
  const hash = crypto
    .createHmac('sha256', secret)
    .update(resetCode)
    .digest('hex');
  return hash;
};

const hashAndVerifyResetCode = (resetCode, userId, storedHashedCode) => {
  const hashedResetCode = hashResetCode(resetCode, userId);
  return hashedResetCode === storedHashedCode; // Returns true if codes match
};
// // // // // // // // // // // // // // // // // // // // // // // // // //

// MIDDLEWARES

// @ desc   Check if user is logged in

const protect = asyncHandler(async (req, res, next) => {
  // 1- Check if token exist

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new APIError(
        `You are not logged in, Please login to access this route`,
        401
      )
    );
  }

  // 2- Verify token (Change in token - Expired token)

  const decodedToken = verifyToken(token);

  // 3- Check if User exists

  const user = await UserModel.findById(decodedToken.userId);

  if (!user) {
    return next(new APIError(`User for this token no longer exists`, 401));
  }

  // 4- Check if user is deactivated

  if (!user.active) {
    return next(
      new APIError(
        `User account has been deactivated, please activate your account`,
        401
      )
    );
  }

  // 5- Check if User changed password after token creation

  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    //  Password changed after token creation
    if (passwordChangedTimestamp > decodedToken.iat) {
      return next(
        new APIError(
          `User recently changed his password, Please login again`,
          401
        )
      );
    }
  }

  // Add user to request object
  req.user = user;

  next();
});

// @desc Authorization (User Permissions)

const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- Access roles
    // 2- Access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError(`You are not allowed to access this route`, 403)
      );
    }

    next();
  });

// // // // // // // // // // // // // // // // // // // // // // // // // //

// @ desc   Signup
// @ route  POST    /api/v1/auth/signup
// @ access Public

const signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await UserModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- Generate JWT token
  const token = createToken(user._id);

  res.status(201).json({ data: sanitizeUser(user), token });
});

// @ desc   Login
// @ route  POST    /api/v1/auth/login
// @ access Public

const login = asyncHandler(async (req, res, next) => {
  // 1- Check if password and email in the body (valdiation)
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  // 2- Check if users exists and password is correct
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user || !isMatch) {
    return next(new APIError(`Invalid email or password`, 401));
  }

  // 3- Generate JWT token
  const token = createToken(user._id);

  res.status(201).json({ data: sanitizeUser(user), token });
});

// @ desc   Forget Password
// @ route  POST    /api/v1/auth/forgotPassword
// @ access Public

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1) Get User by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new APIError(`No user for this Email ${email}`, 404));
  }

  // 2) If user exists, Generate random 6 digits (Reset Code)
  const resetCode = generateResetCode();

  const hashedResetCode = hashResetCode(resetCode, user.id);

  // 3) Save hashed Reset Code in Database

  user.passwordResetCode = hashedResetCode;

  // Add Expiration time for Reset Code (10 Minutes)
  user.passwordResetCodeExpiredAt = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 4) Send the reset code via email

  const message = `Hi ${user.firstName},
  \n We received a request to reset the password on your E-shop Account. \n 
  ${resetCode} \n 
  Enter this code to complete the reset. \n
  Thanks for helping us keep your acount secure.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password is valid for reset',
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiredAt = undefined;
    user.passwordResetVerified = undefined;

    return next(new APIError(`An error occured during sending the email`, 500));
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset Code sent to the email' });
});

// @ desc  Verify Password Reset Code
// @ route  POST    /api/v1/auth/verifyResetCode
// @ access Public

const verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;

  // 1) Get User by Email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new APIError(`No user for this Email ${email}`, 404));
  }

  // 2) Check expiry of Reset Code
  const resetCodeExpired =
    Date.now() > new Date(user.passwordResetCodeExpiredAt).getTime();
  if (resetCodeExpired) {
    return next(new APIError(`Invalid or expired Reset Code`, 400));
  }

  // 3) Verify the Reset Code

  const isValidResetCode = hashAndVerifyResetCode(
    resetCode,
    user.id,
    user.passwordResetCode
  );
  if (!isValidResetCode) {
    return next(new APIError(`Invalid or expired Reset Code`, 400));
  }

  // 2) Reset Code Valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'Success' });
});

// @ desc  Reset Password
// @ route  POST    /api/v1/auth/resetPassword
// @ access Public

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get User by email
  const { email, newPassword } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new APIError(`No User for this email: ${email}`, 404));
  }

  // 2) Check if Reset Code is verified
  if (!user.passwordResetVerified) {
    return next(new APIError(`Reset Code not verifed`, 400));
  }

  user.password = newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiredAt = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) Generate token
  const token = createToken(user._id);

  res.status(200).json({ token });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  // Middlewares
  protect,
  allowedTo,
};
