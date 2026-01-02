const Joi = require("joi");

const initializePayment = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(0.01),
    email: Joi.string().required().email(),
    name: Joi.string().required().trim().min(2).max(100),
    phoneNumber: Joi.string().required().trim().min(10).max(20),
    currency: Joi.string()
      .valid("NGN", "USD", "GHS", "ZAR", "KES")
      .default("NGN"),
    description: Joi.string().optional(),
    metadata: Joi.object()
      .keys({
        bookingId: Joi.string().optional(),
        hotelId: Joi.string().optional(),
        roomType: Joi.string().optional(),
        checkIn: Joi.string().optional(),
        checkOut: Joi.string().optional(),
        guests: Joi.number().optional(),
        nights: Joi.number().optional(),
        numberOfGuests: Joi.number().optional(),
        numberOfNights: Joi.number().optional(),
      })
      .optional(),
  }),
};

const verifyPayment = {
  params: Joi.object().keys({
    reference: Joi.string().required(),
  }),
};

const getUserPayments = {
  query: Joi.object().keys({
    status: Joi.string()
      .valid("pending", "success", "failed", "cancelled")
      .optional(),
    email: Joi.string()
      .email()
      .optional()
      .description("Email to filter payments (required if not authenticated)"),
    phoneNumber: Joi.string()
      .optional()
      .description("Phone number to filter payments (alternative to email)"),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

const getPaymentById = {
  params: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    email: Joi.string()
      .email()
      .optional()
      .description("Email to verify payment ownership (optional)"),
  }),
};

const getAllPayments = {
  query: Joi.object().keys({
    status: Joi.string()
      .valid("pending", "success", "failed", "cancelled")
      .optional(),
    userId: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

module.exports = {
  initializePayment,
  verifyPayment,
  getUserPayments,
  getPaymentById,
  getAllPayments,
};
