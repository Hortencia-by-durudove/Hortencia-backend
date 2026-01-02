const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const pick = require("../utils/pick");

/**
 * Create a new user (admin only)
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(httpStatus.CREATED).send({
    message: "User created successfully",
    data: user,
  });
});

/**
 * Get all users (admin only)
 */
const getAllUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["role", "isActive"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.getAllUser(filter, options);

  res.status(httpStatus.OK).send({
    message: "Users retrieved successfully",
    data: result,
  });
});

module.exports = {
  createUser,
  getAllUsers,
};

