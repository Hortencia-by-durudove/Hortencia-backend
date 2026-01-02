const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { contactService } = require("../services");
const pick = require("../utils/pick");

/**
 * Create a contact message
 */
const createContact = catchAsync(async (req, res) => {
  const contact = await contactService.createContact(req.body);

  res.status(httpStatus.CREATED).send({
    message: "Your message has been received successfully. We'll get back to you soon!",
    data: contact,
  });
});

/**
 * Get all contact messages (admin)
 */
const getAllContacts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "email"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await contactService.getAllContacts(filter, options);

  res.status(httpStatus.OK).send({
    message: "Contact messages retrieved successfully",
    data: result,
  });
});

/**
 * Get contact by ID (admin)
 */
const getContactById = catchAsync(async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactService.getContactById(contactId);

  res.status(httpStatus.OK).send({
    message: "Contact message retrieved successfully",
    data: contact,
  });
});

/**
 * Update contact status (admin)
 */
const updateContactStatus = catchAsync(async (req, res) => {
  const { contactId } = req.params;
  const { status } = req.body;
  const contact = await contactService.updateContactStatus(contactId, status);

  res.status(httpStatus.OK).send({
    message: "Contact status updated successfully",
    data: contact,
  });
});

/**
 * Delete contact message (admin)
 */
const deleteContact = catchAsync(async (req, res) => {
  const { contactId } = req.params;
  await contactService.deleteContact(contactId);

  res.status(httpStatus.OK).send({
    message: "Contact message deleted successfully",
  });
});

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};

