const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { isAdmin } = require("../../middlewares/isAdmin");
const { bookingValidation } = require("../../validations");
const { bookingController } = require("../../controllers");

// All booking routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

router.get(
  "/",
  validate(bookingValidation.getAllBookings),
  bookingController.getAllBookings
);

router.get(
  "/:bookingId",
  validate(bookingValidation.getBookingById),
  bookingController.getBookingById
);

router.patch(
  "/:bookingId/status",
  validate(bookingValidation.updateBookingStatus),
  bookingController.updateBookingStatus
);

router.delete(
  "/:bookingId",
  validate(bookingValidation.deleteBooking),
  bookingController.deleteBooking
);

module.exports = router;

