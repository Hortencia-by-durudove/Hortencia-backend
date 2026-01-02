const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { isAdmin } = require("../../middlewares/isAdmin");
const { userValidation } = require("../../validations");
const { userController } = require("../../controllers");

// All user management routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

router.post(
  "/",
  validate(userValidation.createUser),
  userController.createUser
);

router.get(
  "/",
  validate(userValidation.getAllUsers),
  userController.getAllUsers
);

module.exports = router;

