const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { paymentValidation } = require("../../validations");
const { paymentController } = require("../../controllers");

// Initialize payment (public - no authentication required)
router.post(
  "/initialize",
  validate(paymentValidation.initializePayment),
  paymentController.initializePayment
);

// Verify payment (public - can be called by anyone with reference)
router.get(
  "/verify/:reference",
  validate(paymentValidation.verifyPayment),
  paymentController.verifyPayment
);

// Paystack webhook (no auth needed, but signature is verified)
// Note: This route needs raw body parsing, which should be configured in index.js
router.post("/webhook", paymentController.handleWebhook);

// Get user's payment history (optional authentication - can use email query param if not authenticated)
router.get(
  "/",
  validate(paymentValidation.getUserPayments),
  paymentController.getUserPayments
);

// Get specific payment by ID (optional authentication - can use email query param if not authenticated)
router.get(
  "/:paymentId",
  validate(paymentValidation.getPaymentById),
  paymentController.getPaymentById
);

// Get all payments - admin endpoint (requires authentication)
// Note: You may want to add admin role check here
router.get(
  "/admin/all",
  isAuthenticated,
  validate(paymentValidation.getAllPayments),
  paymentController.getAllPayments
);

module.exports = router;
