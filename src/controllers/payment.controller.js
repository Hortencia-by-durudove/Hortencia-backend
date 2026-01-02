const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { paymentService } = require("../services");
const pick = require("../utils/pick");
const logger = require("../config/logger");
const crypto = require("crypto");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");

const initializePayment = catchAsync(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  
  const paymentData = {
    ...req.body,
    metadata: {
      ...req.body.metadata,
    },
  };

  // Add userId to metadata if user is authenticated
  if (userId) {
    paymentData.metadata.userId = userId.toString();
  }

  const result = await paymentService.initializePayment(
    userId,
    paymentData
  );

  res.status(httpStatus.CREATED).send({
    message: "Payment initialized successfully",
    data: {
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference,
      payment: result.payment,
    },
  });
});

/**
 * Verify a payment transaction
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { reference } = req.params;
  const payment = await paymentService.verifyPayment(reference);

  res.status(httpStatus.OK).send({
    message: "Payment verified successfully",
    data: payment,
  });
});

/**
 * Handle Paystack webhook
 */
const handleWebhook = catchAsync(async (req, res) => {
  // Verify webhook signature (Paystack sends a signature header)
  // req.body is raw buffer for webhook route
  const hash = crypto
    .createHmac("sha512", config.paystack.secretKey)
    .update(req.body)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    logger.warn("Invalid webhook signature received");
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid webhook signature");
  }

  const event = JSON.parse(req.body.toString());
  await paymentService.handleWebhook(event);

  res.status(httpStatus.OK).send({ message: "Webhook processed successfully" });
});

/**
 * Get user's payment history
 * Can work with userId (if authenticated), email, or phoneNumber (if not authenticated)
 */
const getUserPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  
  const userId = req.user ? req.user._id : null;
  const email = req.query.email || (req.user ? req.user.email : null);
  const phoneNumber = req.query.phoneNumber || null;
  
  const result = await paymentService.getUserPayments(
    userId,
    email,
    phoneNumber,
    filter,
    options
  );

  res.status(httpStatus.OK).send({
    message: "Payments retrieved successfully",
    data: result,
  });
});

/**
 * Get a specific payment by ID
 * Works with or without authentication
 */
const getPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user ? req.user._id : null;
  const email = req.query.email || (req.user ? req.user.email : null);
  
  const payment = await paymentService.getPaymentById(
    paymentId,
    userId,
    email
  );

  res.status(httpStatus.OK).send({
    message: "Payment retrieved successfully",
    data: payment,
  });
});

/**
 * Get all payments (admin only - you may want to add admin check)
 */
const getAllPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "userId"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await paymentService.getAllPayments(filter, options);

  res.status(httpStatus.OK).send({
    message: "All payments retrieved successfully",
    data: result,
  });
});

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getUserPayments,
  getPaymentById,
  getAllPayments,
};

