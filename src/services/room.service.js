const httpStatus = require("http-status");
const { Room, Booking } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

/**
 * Get all rooms
 */
const getAllRooms = async (filter, options) => {
  const rooms = await Room.paginate(filter, options);
  return rooms;
};

/**
 * Get room by ID
 */
const getRoomById = async (roomId) => {
  const room = await Room.findById(roomId).populate(
    "currentBooking",
    "customerName customerEmail customerPhone checkIn checkOut numberOfGuests bookingReference"
  );

  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  return room;
};

/**
 * Create a new room
 */
const createRoom = async (roomData) => {
  // Check if room number already exists
  const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
  if (existingRoom) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room number already exists");
  }

  const room = await Room.create(roomData);
  return room;
};

/**
 * Update room
 */
const updateRoom = async (roomId, updateData) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  // If updating room number, check for duplicates
  if (updateData.roomNumber && updateData.roomNumber !== room.roomNumber) {
    const existingRoom = await Room.findOne({ roomNumber: updateData.roomNumber });
    if (existingRoom) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Room number already exists");
    }
  }

  Object.assign(room, updateData);
  await room.save();
  return room;
};

/**
 * Assign room to a booking
 */
const assignRoomToBooking = async (roomId, bookingId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Check if room is available
  if (room.status === "occupied") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is already occupied");
  }

  if (room.status === "maintenance") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is under maintenance");
  }

  // Check if booking already has a room assigned
  const existingRoomAssignment = await Room.findOne({ currentBooking: booking._id });
  if (existingRoomAssignment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This booking is already assigned to room ${existingRoomAssignment.roomNumber}`
    );
  }

  // Check if booking dates are valid
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  if (checkOut < now) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking check-out date has passed");
  }

  // Update room with booking information
  room.currentBooking = booking._id;
  room.occupantName = booking.customerName;
  room.occupantEmail = booking.customerEmail;
  room.occupantPhone = booking.customerPhone;
  room.checkInDate = checkIn;
  room.checkOutDate = checkOut;
  room.status = "occupied";

  await room.save();

  // Update booking status to "assigned"
  booking.status = "assigned";
  await booking.save();

  logger.info(`Room ${room.roomNumber} assigned to booking ${booking.bookingReference}`);

  return room;
};

/**
 * Manually assign room to a person (walk-in)
 */
const manuallyAssignRoom = async (roomId, occupantData) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  // Check if room is available
  if (room.status === "occupied") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is already occupied");
  }

  if (room.status === "maintenance") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is under maintenance");
  }

  // Update room with occupant information
  room.currentBooking = null; // No booking for walk-ins
  room.occupantName = occupantData.name;
  room.occupantEmail = occupantData.email?.toLowerCase() || null;
  room.occupantPhone = occupantData.phone;
  room.checkInDate = occupantData.checkIn ? new Date(occupantData.checkIn) : new Date();
  room.checkOutDate = occupantData.checkOut ? new Date(occupantData.checkOut) : null;
  room.status = "occupied";

  await room.save();

  logger.info(`Room ${room.roomNumber} manually assigned to ${occupantData.name}`);

  return room;
};

/**
 * Unassign room (check out)
 */
const unassignRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  if (room.status !== "occupied") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Room is not currently occupied");
  }

  // Update booking status to "completed" when room is checked out
  if (room.currentBooking) {
    const booking = await Booking.findById(room.currentBooking);
    if (booking && booking.status === "assigned") {
      booking.status = "completed";
      await booking.save();
      logger.info(`Booking ${booking.bookingReference} status changed to completed after checkout`);
    }
  }

  // Clear occupant information
  room.currentBooking = null;
  room.occupantName = null;
  room.occupantEmail = null;
  room.occupantPhone = null;
  room.checkInDate = null;
  room.checkOutDate = null;
  room.status = "available";

  await room.save();

  logger.info(`Room ${room.roomNumber} has been checked out`);

  return room;
};

/**
 * Delete room
 */
const deleteRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, "Room not found");
  }

  if (room.status === "occupied") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot delete an occupied room");
  }

  await room.deleteOne();
  return room;
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

