const httpStatus = require("http-status");
const { Booking } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

/**
 * Get all bookings
 */
const getAllBookings = async (filter, options) => {
  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get booking by ID
 */
const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate("user", "fullName email")
    .populate("payment", "reference status amount currency");

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

/**
 * Get bookings by user ID
 */
const getBookingsByUserId = async (userId, filter, options) => {
  const query = { user: userId, ...filter };
  const bookings = await Booking.paginate(query, options);
  return bookings;
};

/**
 * Get bookings by email
 */
const getBookingsByEmail = async (email, filter, options) => {
  const query = { customerEmail: email.toLowerCase(), ...filter };
  const bookings = await Booking.paginate(query, options);
  return bookings;
};

/**
 * Update booking status
 */
const updateBookingStatus = async (bookingId, status) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  booking.status = status;
  await booking.save();

  return booking;
};

/**
 * Delete booking
 */
const deleteBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  await booking.deleteOne();
  return booking;
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  getBookingsByEmail,
  updateBookingStatus,
  deleteBooking,
};

