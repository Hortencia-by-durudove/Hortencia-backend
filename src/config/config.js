const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

// Base schema - MONGODB_URL_DEV is optional
const baseEnvVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("production", "development").required(),
    PORT: Joi.number().default(3000),
    CLIENT_URL: Joi.string().allow("*").default("*"),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    // MONGODB_URL_DEV is only required in development, optional in production
    MONGODB_URL_DEV: Joi.string().optional().allow("").description("Mongo DB url for development"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(20)
      .description("days after which refresh tokens expire"),
    PAYSTACK_SECRET_KEY: Joi.string()
      .allow("")
      .optional()
      .description("Paystack secret key"),
    PAYSTACK_PUBLIC_KEY: Joi.string()
      .allow("")
      .optional()
      .description("Paystack public key"),
  })
  .unknown();

// Validate base schema first
const { value: envVars, error: baseError } = baseEnvVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

// Additional validation: MONGODB_URL_DEV is required in development
if (!baseError && envVars.NODE_ENV === "development" && !envVars.MONGODB_URL_DEV) {
  throw new Error("Config validation error: MONGODB_URL_DEV is required when NODE_ENV=development");
}

if (baseError) {
  throw new Error(`Config validation error: ${baseError.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  corsOrigin: envVars.CLIENT_URL,
  clientURL: envVars.CLIENT_URL,
  mongoose: {
    url:
      envVars.NODE_ENV === "development"
        ? envVars.MONGODB_URL_DEV
        : envVars.MONGODB_URL,
    options: {
      // MongoDB Atlas connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      // Remove deprecated options that might cause issues
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
    emailVerificationExpirationDays: 15,
  },
  paystack: {
    secretKey: envVars.PAYSTACK_SECRET_KEY || "",
    publicKey: envVars.PAYSTACK_PUBLIC_KEY || "",
  },
};
