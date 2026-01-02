const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { bookingService } = require("../services");
const pick = require("../utils/pick");

/**
 * Get all bookings (admin)
 */
const getAllBookings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "customerEmail", "hotelId", "roomId"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await bookingService.getAllBookings(filter, options);

  res.status(httpStatus.OK).send({
    message: "Bookings retrieved successfully",
    data: result,
  });
});

/**
 * Get booking by ID (admin)
 */
const getBookingById = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await bookingService.getBookingById(bookingId);

  res.status(httpStatus.OK).send({
    message: "Booking retrieved successfully",
    data: booking,
  });
});

/**
 * Update booking status (admin)
 */
const updateBookingStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(bookingId, status);

  res.status(httpStatus.OK).send({
    message: "Booking status updated successfully",
    data: booking,
  });
});

/**
 * Delete booking (admin)
 */
const deleteBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  await bookingService.deleteBooking(bookingId);

  res.status(httpStatus.OK).send({
    message: "Booking deleted successfully",
  });
});

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};

