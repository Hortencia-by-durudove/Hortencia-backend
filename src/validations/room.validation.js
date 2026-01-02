const Joi = require("joi");

const getAllRooms = {
  query: Joi.object().keys({
    status: Joi.string().valid("available", "occupied", "maintenance", "reserved").optional(),
    roomType: Joi.string().optional(),
    roomNumber: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

const getRoomById = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
};

const createRoom = {
  body: Joi.object().keys({
    roomNumber: Joi.string().required().trim(),
    roomType: Joi.string().required().trim(),
    description: Joi.string().trim().optional(),
    pricePerNight: Joi.number().required().min(0),
    currency: Joi.string().valid("NGN", "USD", "GHS", "ZAR", "KES").default("NGN"),
    maxOccupancy: Joi.number().integer().min(1).default(2),
    status: Joi.string().valid("available", "occupied", "maintenance", "reserved").default("available"),
    metadata: Joi.object().optional(),
  }),
};

const updateRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    roomNumber: Joi.string().trim().optional(),
    roomType: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
    pricePerNight: Joi.number().min(0).optional(),
    currency: Joi.string().valid("NGN", "USD", "GHS", "ZAR", "KES").optional(),
    maxOccupancy: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid("available", "occupied", "maintenance", "reserved").optional(),
    metadata: Joi.object().optional(),
  }),
};

const assignRoomToBooking = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
};

const manuallyAssignRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2),
    email: Joi.string().email().optional().allow(""),
    phone: Joi.string().required().trim(),
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
  }),
};

const unassignRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
};

const deleteRoom = {
  params: Joi.object().keys({
    roomId: Joi.string().required(),
  }),
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  assignRoomToBooking,
  manuallyAssignRoom,
  unassignRoom,
  deleteRoom,
};
