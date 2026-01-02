const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const paymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: false,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "GHS", "ZAR", "KES"],
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paystackReference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    },
    description: {
      type: String,
    },
    metadata: {
      type: mongoose.SchemaTypes.Mixed,
    },
    bookingId: {
      type: String,
    },
    hotelId: {
      type: String,
    },
    paystackResponse: {
      type: mongoose.SchemaTypes.Mixed,
    },
    failureReason: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ customerEmail: 1, createdAt: -1 });
paymentSchema.index({ customerPhone: 1, createdAt: -1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

