const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: false,
    },
    payment: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Payment",
      required: true,
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
    hotelId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "GHS", "ZAR", "KES"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "assigned", "cancelled", "completed"],
      default: "confirmed",
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: mongoose.SchemaTypes.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ customerEmail: 1, createdAt: -1 });
bookingSchema.index({ customerPhone: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;

