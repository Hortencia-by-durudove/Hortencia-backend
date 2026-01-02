const httpStatus = require("http-status");
const { Payment, Booking } = require("../models");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const logger = require("../config/logger");
const config = require("../config/config");

const getPaystackClient = () => {
  if (!config.paystack.secretKey) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Paystack secret key is not configured"
    );
  }
  return require("paystack")(config.paystack.secretKey);
};

const generateReference = () => {
  return `HORTENCIA_PAYMENT_${Date.now()}_${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};

/**
 * Generate a unique booking reference
 */
const generateBookingReference = () => {
  return `BOOK_${Date.now()}_${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
};

/**
 * Create a booking from payment data
 */
const createBookingFromPayment = async (payment) => {
  try {
    // Check if booking already exists for this payment
    const existingBooking = await Booking.findOne({ payment: payment._id });
    if (existingBooking) {
      logger.info(`Booking already exists for payment ${payment._id}`);
      return existingBooking;
    }

    // Extract booking information from payment metadata
    const metadata = payment.metadata || {};
    const bookingId = payment.bookingId || metadata.bookingId;
    const hotelId = payment.hotelId || metadata.hotelId || "HORTENCIA_HOTEL";
    const roomType = metadata.roomType || "Room";

    // Handle checkIn and checkOut dates (can be string or Date)
    let checkIn = null;
    let checkOut = null;
    if (metadata.checkIn) {
      checkIn =
        metadata.checkIn instanceof Date
          ? metadata.checkIn
          : new Date(metadata.checkIn);
    }
    if (metadata.checkOut) {
      checkOut =
        metadata.checkOut instanceof Date
          ? metadata.checkOut
          : new Date(metadata.checkOut);
    }

    const numberOfGuests = metadata.numberOfGuests || metadata.guests || 1;
    const numberOfNights = metadata.numberOfNights || metadata.nights || 1;

    // Validate required fields
    if (!checkIn || !checkOut) {
      logger.warn(
        `Cannot create booking: missing checkIn or checkOut dates for payment ${payment._id}`
      );
      return null;
    }

    // Calculate number of nights if not provided
    const nights =
      numberOfNights || Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const booking = await Booking.create({
      user: payment.user || null,
      payment: payment._id,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      customerPhone: payment.customerPhone,
      hotelId: hotelId,
      roomId: bookingId ? bookingId.split("_").pop() : null,
      roomType: roomType,
      checkIn: checkIn,
      checkOut: checkOut,
      numberOfGuests: numberOfGuests,
      numberOfNights: nights,
      totalAmount: payment.amount,
      currency: payment.currency,
      status: "confirmed",
      bookingReference: generateBookingReference(),
      metadata: {
        ...metadata,
        paymentReference: payment.reference,
      },
    });

    logger.info(
      `Booking created successfully: ${booking.bookingReference} for payment ${payment.reference}`
    );
    return booking;
  } catch (error) {
    logger.error(`Error creating booking from payment ${payment._id}:`, error);
    return null;
  }
};

const initializePayment = async (userId, paymentData) => {
  try {
    const {
      amount,
      email,
      name,
      phoneNumber,
      currency = "NGN",
      metadata = {},
    } = paymentData;

    // Generate unique reference
    const reference = generateReference();

    // Initialize payment with Paystack
    const paystack = getPaystackClient();
    const paystackMetadata = {
      ...metadata,
      bookingId: metadata.bookingId || null,
      hotelId: metadata.hotelId || null,
      customerName: name,
      customerPhone: phoneNumber,
    };

    // Add userId to metadata only if user is authenticated
    if (userId) {
      paystackMetadata.userId = userId.toString();
    }

    // Get callback URL from config or use default
    // Paystack will redirect to this URL after payment with reference parameter
    let callbackUrl;
    if (config.clientURL && config.clientURL !== "*") {
      // Remove trailing slash if present
      const baseUrl = config.clientURL.replace(/\/$/, "");
      callbackUrl = `${baseUrl}/payment/success`;
    } else {
      // Default to localhost:3000 (React default port)
      callbackUrl = "http://localhost:3000/payment/success";
    }

    const paystackResponse = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo (Paystack uses smallest currency unit)
      currency: currency.toUpperCase(),
      reference,
      callback_url: callbackUrl, // Paystack redirects here after payment
      metadata: paystackMetadata,
    });

    if (!paystackResponse.status) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        paystackResponse.message || "Failed to initialize payment"
      );
    }

    // Save payment record with pending status
    const payment = await Payment.create({
      user: userId || null,
      customerEmail: email,
      customerName: name,
      customerPhone: phoneNumber,
      amount,
      currency: currency.toUpperCase(),
      reference,
      paystackReference: paystackResponse.data.reference,
      status: "pending",
      description: paymentData.description,
      metadata: {
        ...metadata,
        email,
        name,
        phoneNumber,
      },
      bookingId: metadata.bookingId,
      hotelId: metadata.hotelId,
      paystackResponse: paystackResponse.data,
    });

    return {
      payment,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    };
  } catch (error) {
    logger.error("Error initializing payment:", error);

    // Save failed payment attempt
    if (error.response?.data) {
      const reference = generateReference();
      await Payment.create({
        user: userId || null,
        customerEmail: paymentData.email,
        customerName: paymentData.name,
        customerPhone: paymentData.phoneNumber,
        amount: paymentData.amount,
        currency: paymentData.currency || "NGN",
        reference,
        paystackReference: reference,
        status: "failed",
        description: paymentData.description,
        metadata: {
          ...(paymentData.metadata || {}),
          email: paymentData.email,
          name: paymentData.name,
          phoneNumber: paymentData.phoneNumber,
        },
        failureReason: error.response.data.message || error.message,
        paystackResponse: error.response.data,
      });
    }

    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.message || "Failed to initialize payment"
    );
  }
};

/**
 * Verify payment transaction
 */
const verifyPayment = async (reference) => {
  try {
    // Verify payment with Paystack
    const paystack = getPaystackClient();
    const paystackResponse = await paystack.transaction.verify(reference);

    if (!paystackResponse.status) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        paystackResponse.message || "Payment verification failed"
      );
    }

    const transaction = paystackResponse.data;

    // Find payment record
    const payment = await Payment.findOne({
      $or: [{ reference }, { paystackReference: reference }],
    });

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment record not found");
    }

    // Update payment status based on Paystack response
    const status =
      transaction.status === "success"
        ? "success"
        : transaction.status === "failed"
        ? "failed"
        : "pending";

    payment.status = status;
    payment.paymentMethod = transaction.channel;
    payment.paystackResponse = transaction;

    if (status === "success") {
      payment.paidAt = new Date(transaction.paid_at);
      payment.failureReason = null;

      // Create booking when payment is successful
      await createBookingFromPayment(payment);
    } else if (status === "failed") {
      payment.failureReason = transaction.gateway_response || "Payment failed";
    }

    await payment.save();

    return payment;
  } catch (error) {
    logger.error("Error verifying payment:", error);

    // Try to find and update payment record even if verification fails
    const payment = await Payment.findOne({
      $or: [{ reference }, { paystackReference: reference }],
    });

    if (payment && payment.status === "pending") {
      payment.status = "failed";
      payment.failureReason = error.message || "Payment verification failed";
      await payment.save();
    }

    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.message || "Payment verification failed"
    );
  }
};

/**
 * Handle Paystack webhook
 */
const handleWebhook = async (event) => {
  try {
    const { event: eventType, data } = event;

    if (eventType === "charge.success") {
      const reference = data.reference;
      const payment = await Payment.findOne({
        $or: [{ reference }, { paystackReference: reference }],
      });

      if (payment) {
        payment.status = "success";
        payment.paymentMethod = data.channel;
        payment.paidAt = new Date(data.paid_at);
        payment.paystackResponse = data;
        payment.failureReason = null;
        await payment.save();

        // Create booking when payment is successful via webhook
        await createBookingFromPayment(payment);
      }
    } else if (eventType === "charge.failed") {
      const reference = data.reference;
      const payment = await Payment.findOne({
        $or: [{ reference }, { paystackReference: reference }],
      });

      if (payment) {
        payment.status = "failed";
        payment.paymentMethod = data.channel;
        payment.failureReason = data.gateway_response || "Payment failed";
        payment.paystackResponse = data;
        await payment.save();
      }
    }

    return { success: true };
  } catch (error) {
    logger.error("Error handling webhook:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Webhook processing failed"
    );
  }
};

/**
 * Get user payments by userId, email, or phoneNumber
 */
const getUserPayments = async (userId, email, phoneNumber, filter, options) => {
  const query = { ...filter };

  if (userId) {
    query.user = userId;
  } else if (email) {
    query.customerEmail = email.toLowerCase();
  } else if (phoneNumber) {
    query.customerPhone = phoneNumber;
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Either userId, email, or phoneNumber is required"
    );
  }

  const payments = await Payment.paginate(query, options);
  return payments;
};

/**
 * Get payment by ID (optionally filter by userId or email)
 */
const getPaymentById = async (paymentId, userId, email) => {
  const query = { _id: paymentId };

  // If userId or email provided, add to query for security
  if (userId) {
    query.user = userId;
  } else if (email) {
    query.customerEmail = email.toLowerCase();
  }
  // If neither provided, allow access (for public verification)

  const payment = await Payment.findOne(query);

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return payment;
};

/**
 * Get all payments (admin)
 */
const getAllPayments = async (filter, options) => {
  const payments = await Payment.paginate(filter, options);
  return payments;
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getUserPayments,
  getPaymentById,
  getAllPayments,
};
