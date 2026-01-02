const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const { Token, User } = require("../models");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/token");
const logger = require("../config/logger");

const registerUser = async (userData) => {
  if (await User.isEmailTaken(userData.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const user = await User.create({
    ...userData,
  });
  return user;
};

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  
  // Only allow admin and superAdmin to login to the portal
  if (user.role !== "admin" && user.role !== "superAdmin") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Access denied. Only administrators can access the portal."
    );
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated. Please contact support."
    );
  }
  
  return user;
};

const changePassword = async (user, data) => {
  if (!(await user.isPasswordMatch(data.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }
  if (data.new_password !== data.confirm_password) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "New password and confirm password must be the same"
    );
  }

  await userService.updateUserById(user._id, { password: data.new_password });
};

const getSelf = async (data) => {
  const user = User.findOne({ _id: data._id });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const logoutUser = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Refresh token not found");
  }

  await refreshTokenDoc.deleteOne();
  logger.info("Successfully logged out");
};

module.exports = {
  registerUser,
  loginUserWithEmailAndPassword,
  changePassword,
  logoutUser,
  getSelf,
};
