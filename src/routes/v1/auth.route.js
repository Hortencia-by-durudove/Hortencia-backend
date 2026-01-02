const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { authValidation } = require("../../validations");
const { authController } = require("../../controllers");

router.post(
  "/register",
  validate(authValidation.registerUser),
  authController.registerUser
);

router.post(
  "/login",
  validate(authValidation.loginUserWithEmailAndPassword),
  authController.loginUserWithEmailAndPassword
);

router.get(
  "/self",
  isAuthenticated,
  validate(authValidation.getSelf),
  authController.getSelf
);

router.post(
  "/change-password",
  isAuthenticated,
  validate(authValidation.changePassword),
  authController.changePassword
);

router.post(
  "/logout",
  isAuthenticated,
  validate(authValidation.logoutUser),
  authController.logoutUser
);

module.exports = router;
