const Joi = require("joi");

const createContact = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().required().email(),
    message: Joi.string().required().trim().min(10).max(2000),
  }),
};

const getAllContacts = {
  query: Joi.object().keys({
    status: Joi.string().valid("new", "read", "replied", "archived").optional(),
    email: Joi.string().email().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

const getContactById = {
  params: Joi.object().keys({
    contactId: Joi.string().required(),
  }),
};

const updateContactStatus = {
  params: Joi.object().keys({
    contactId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("new", "read", "replied", "archived").required(),
  }),
};

const deleteContact = {
  params: Joi.object().keys({
    contactId: Joi.string().required(),
  }),
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};

