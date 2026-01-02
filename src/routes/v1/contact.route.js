const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { isAdmin } = require("../../middlewares/isAdmin");
const { contactValidation } = require("../../validations");
const { contactController } = require("../../controllers");

// Create contact message (public - no authentication required)
router.post(
  "/",
  validate(contactValidation.createContact),
  contactController.createContact
);

// Admin routes - require authentication and admin role
router.use(isAuthenticated);
router.use(isAdmin);

// Get all contacts (admin)
router.get(
  "/",
  validate(contactValidation.getAllContacts),
  contactController.getAllContacts
);

// Get contact by ID (admin)
router.get(
  "/:contactId",
  validate(contactValidation.getContactById),
  contactController.getContactById
);

// Update contact status (admin)
router.patch(
  "/:contactId/status",
  validate(contactValidation.updateContactStatus),
  contactController.updateContactStatus
);

// Delete contact (admin)
router.delete(
  "/:contactId",
  validate(contactValidation.deleteContact),
  contactController.deleteContact
);

module.exports = router;

