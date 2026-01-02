const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const isAuthenticated = require("./isAuthenticated");

/**
 * Middleware to check if user is admin or superAdmin
 * Must be used after isAuthenticated middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    // Ensure user is authenticated first
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
    }

    // Check if user has admin or superAdmin role
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied. Admin privileges required."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is superAdmin only
 */
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
    }

    if (req.user.role !== "superAdmin") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied. Super admin privileges required."
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isAdmin, isSuperAdmin };

