const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { authService, tokenService, userService } = require("../services");
const pick = require("../utils/pick");

const registerUser = catchAsync(async (req, res) => {
  const userbody = { ...req.body };
  try {
    const user = await authService.registerUser(userbody);
    const tokens = await tokenService.generateAuthTokens(user);
    const message = "Successfully registered";
    res
      .cookie("refreshToken", tokens.refresh.token, {
        maxAge: tokens.refresh.maxAge,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(httpStatus.CREATED)
      .send({
        user: user,
        token: tokens.access,
        message,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const loginUserWithEmailAndPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  const message = "Successfully signed in";
  res
    .cookie("refreshToken", tokens.refresh.token, {
      maxAge: tokens.refresh.maxAge,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .send({ user, token: tokens.access, message });
});

const getSelf = catchAsync(async (req, res) => {
  const user = await authService.getSelf(req.user);
  const tokens = await tokenService.generateAuthTokens(req.user);

  res
    .cookie("refreshToken", tokens.refresh.token, {
      maxAge: tokens.refresh.maxAge,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .send({ user, token: tokens.access, message: "" });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(req.user, req.body);
  res.status(httpStatus.ACCEPTED).send({
    message: "Successfully changed password",
  });
});

const logoutUser = catchAsync(async (req, res) => {
  await authService.logoutUser(req.cookies.refreshToken);
  res.status(httpStatus.OK).json({ message: "Successfully logged out" });
});

const getAllUser = catchAsync(async (req, res) => {
  if (!req.headers.authorization) {
    throw new Error("Token is required");
  }
  const [, token] = req.headers.authorization.split(" ");
  const filter = pick(req.query, ["fullName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.getAllUser(token, filter, options);
  res.status(httpStatus.ACCEPTED).send({
    user: result,
    message: "Successfully retrieved all users",
  });
});

module.exports = {
  registerUser,
  loginUserWithEmailAndPassword,
  changePassword,
  logoutUser,
  getAllUser,
  getSelf,
};
