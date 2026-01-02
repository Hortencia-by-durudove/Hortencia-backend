const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { isAdmin } = require("../../middlewares/isAdmin");
const { roomValidation } = require("../../validations");
const { roomController } = require("../../controllers");

// All room routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

router.get(
  "/",
  validate(roomValidation.getAllRooms),
  roomController.getAllRooms
);

router.get(
  "/:roomId",
  validate(roomValidation.getRoomById),
  roomController.getRoomById
);

router.post(
  "/",
  validate(roomValidation.createRoom),
  roomController.createRoom
);

router.patch(
  "/:roomId",
  validate(roomValidation.updateRoom),
  roomController.updateRoom
);

router.post(
  "/:roomId/assign",
  validate(roomValidation.assignRoomToBooking),
  roomController.assignRoomToBooking
);

router.post(
  "/:roomId/assign-manual",
  validate(roomValidation.manuallyAssignRoom),
  roomController.manuallyAssignRoom
);

router.post(
  "/:roomId/unassign",
  validate(roomValidation.unassignRoom),
  roomController.unassignRoom
);

router.delete(
  "/:roomId",
  validate(roomValidation.deleteRoom),
  roomController.deleteRoom
);

module.exports = router;

