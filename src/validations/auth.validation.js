const Joi = require("joi");
const { password } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

const loginUserWithEmailAndPassword = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

const getSelf = {
  headers: Joi.object({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({}),
};

const changePassword = {
  headers: Joi.object({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    new_password: Joi.string().required().custom(password),
    confirm_password: Joi.string().required().custom(password),
  }),
};

const logoutUser = {
  body: Joi.object().keys({}),
  cookies: Joi.object()
    .keys({
      refreshToken: Joi.string().required(),
    })
    .unknown(true),
};

module.export = {
  register,
  loginUserWithEmailAndPassword,
  getSelf,
  changePassword,
  logoutUser,
};
