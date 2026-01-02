const Joi = require("joi");

const getAllBookings = {
  query: Joi.object().keys({
    status: Joi.string().valid("pending", "confirmed", "assigned", "cancelled", "completed").optional(),
    customerEmail: Joi.string().email().optional(),
    hotelId: Joi.string().optional(),
    roomId: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

const getBookingById = {
  params: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
};

const updateBookingStatus = {
  params: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("pending", "confirmed", "assigned", "cancelled", "completed").required(),
  }),
};

const deleteBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};

