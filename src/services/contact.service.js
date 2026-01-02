const httpStatus = require("http-status");
const { Contact } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

/**
 * Create a contact message
 */
const createContact = async (contactData) => {
  try {
    const contact = await Contact.create({
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
      metadata: contactData.metadata || {},
    });

    logger.info(
      `Contact message created: ${contact._id} from ${contact.email}`
    );
    return contact;
  } catch (error) {
    logger.error("Error creating contact message:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      error.message || "Failed to save contact message"
    );
  }
};

/**
 * Get all contact messages
 */
const getAllContacts = async (filter, options) => {
  const contacts = await Contact.paginate(filter, options);
  return contacts;
};

/**
 * Get contact by ID
 */
const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact message not found");
  }
  return contact;
};

/**
 * Update contact status
 */
const updateContactStatus = async (contactId, status) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact message not found");
  }

  contact.status = status;
  if (status === "replied") {
    contact.repliedAt = new Date();
  }
  await contact.save();

  return contact;
};

/**
 * Delete contact message
 */
const deleteContact = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, "Contact message not found");
  }
  await contact.deleteOne();
  return contact;
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
