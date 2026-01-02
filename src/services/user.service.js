const httpStatus = require("http-status");
const { User, Token } = require("../models");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/token");

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const user = await User.create(userBody);
  return user;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody) => {
  let user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  user = await updateUser(user, updateBody);
  return user;
};

const applyRegexFilter = (filter) => {
  const regexFields = ["fullName", "userName", "email"];

  regexFields.forEach((field) => {
    if (filter[field]) {
      filter[field] = { $regex: filter[field], $options: "i" };
    }
  });

  return filter;
};

const getAllUser = async (filter, options) => {
  filter = applyRegexFilter(filter);

  const result = await User.paginate(filter, options);

  return result;
};

const updateUser = async (user, updateBody) => {
  if (
    updateBody.email &&
    (await User.isEmailTaken(updateBody.email, user.id))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUser = async (userData, userId) => {
  if (userData.role === "user") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You do not have permission to do this"
    );
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Client not found");
  }
  await User.findByIdAndDelete(userId);
  return user;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateUser,
  getAllUser,
  deleteUser,
};
