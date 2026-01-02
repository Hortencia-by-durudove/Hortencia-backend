const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const roomSchema = mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      enum: ["NGN", "USD", "GHS", "ZAR", "KES"],
    },
    maxOccupancy: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    // Current booking/occupant information
    currentBooking: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Booking",
      default: null,
    },
    occupantName: {
      type: String,
      trim: true,
    },
    occupantEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    occupantPhone: {
      type: String,
      trim: true,
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    metadata: {
      type: mongoose.SchemaTypes.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.plugin(toJSON);
roomSchema.plugin(paginate);

roomSchema.index({ roomNumber: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ currentBooking: 1 });

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;

