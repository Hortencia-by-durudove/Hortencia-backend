const Joi = require("joi");
const { password } = require("./custom.validation");

const createUser = {
  body: Joi.object().keys({
    fullName: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().valid("user", "admin").default("user"),
  }),
};

const getAllUsers = {
  query: Joi.object().keys({
    role: Joi.string().valid("user", "admin", "superAdmin").optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
  }),
};

module.exports = {
  createUser,
  getAllUsers,
};

