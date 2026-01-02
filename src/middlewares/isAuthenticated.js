const { tokenTypes } = require("../config/token");
const { Token, User } = require("../models");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("Token is required");
    }
    const [, accessToken] = req.headers.authorization.split(" ");
    if (!accessToken) {
      throw new Error("Access token not provided");
    }

    const accessTokenDoc = await Token.findOne({
      token: accessToken,
      type: tokenTypes.ACCESS,
    });

    if (!accessTokenDoc) {
      throw new Error("Invalid or expired access token");
    }
    const user = await User.findById(accessTokenDoc.user);

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isAuthenticated;
