const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { roomService } = require("../services");
const pick = require("../utils/pick");

/**
 * Get all rooms (admin)
 */
const getAllRooms = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "roomType", "roomNumber"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await roomService.getAllRooms(filter, options);

  res.status(httpStatus.OK).send({
    message: "Rooms retrieved successfully",
    data: result,
  });
});

/**
 * Get room by ID (admin)
 */
const getRoomById = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.getRoomById(roomId);

  res.status(httpStatus.OK).send({
    message: "Room retrieved successfully",
    data: room,
  });
});

/**
 * Create a new room (admin)
 */
const createRoom = catchAsync(async (req, res) => {
  const room = await roomService.createRoom(req.body);

  res.status(httpStatus.CREATED).send({
    message: "Room created successfully",
    data: room,
  });
});

/**
 * Update room (admin)
 */
const updateRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.updateRoom(roomId, req.body);

  res.status(httpStatus.OK).send({
    message: "Room updated successfully",
    data: room,
  });
});

/**
 * Assign room to booking (admin)
 */
const assignRoomToBooking = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { bookingId } = req.body;
  const room = await roomService.assignRoomToBooking(roomId, bookingId);

  res.status(httpStatus.OK).send({
    message: "Room assigned to booking successfully",
    data: room,
  });
});

/**
 * Manually assign room (admin)
 */
const manuallyAssignRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.manuallyAssignRoom(roomId, req.body);

  res.status(httpStatus.OK).send({
    message: "Room assigned manually successfully",
    data: room,
  });
});

/**
 * Unassign room (check out) (admin)
 */
const unassignRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const room = await roomService.unassignRoom(roomId);

  res.status(httpStatus.OK).send({
    message: "Room unassigned successfully",
    data: room,
  });
});

/**
 * Delete room (admin)
 */
const deleteRoom = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  await roomService.deleteRoom(roomId);

  res.status(httpStatus.OK).send({
    message: "Room deleted successfully",
  });
});

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
