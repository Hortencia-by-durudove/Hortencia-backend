const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const httpStatus = require("http-status");
const cookieParser = require("cookie-parser");
const config = require("./src/config/config");
const compression = require("compression");
const logger = require("./src/config/logger");
const routes = require("./src/routes/v1");
const session = require("express-session");
const { errorConverter, errorHandler } = require("./src/middlewares/error");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");

const app = express();

// Paystack webhook needs raw body for signature verification
// This must be before express.json() middleware
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: "/" }));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cookieParser());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

const corsConfig = {
  origin: config.corsOrigin,
  credentials: true,
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.use((req, res, next) => {
  res.set(
    "Content-Security-Policy",
    "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
  );
  next();
});

app.use("/api/v1", routes);

app.use(errorConverter);
app.use(errorHandler);

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("Connected to MongoDB");
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
    logger.error("Connection URL (without password):", 
      config.mongoose.url.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));
    
    // Provide helpful error messages
    if (error.message.includes("authentication failed") || error.code === 8000) {
      logger.error("\n=== MongoDB Atlas Authentication Error ===");
      logger.error("Possible causes:");
      logger.error("1. Incorrect username or password in connection string");
      logger.error("2. Password contains special characters that need URL encoding");
      logger.error("3. Database user doesn't have proper permissions");
      logger.error("4. IP address not whitelisted in Atlas Network Access");
      logger.error("\nTo fix:");
      logger.error("- Check your MONGODB_URL or MONGODB_URL_DEV in .env file");
      logger.error("- Ensure password is URL-encoded (e.g., @ becomes %40)");
      logger.error("- Add your IP address to Atlas Network Access whitelist");
      logger.error("- Verify database user exists and has correct permissions");
    }
    process.exit(1);
  });
