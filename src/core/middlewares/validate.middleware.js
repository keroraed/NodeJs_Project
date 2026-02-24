const ApiError = require("../errors/ApiError");

/**
 * Joi validation middleware
 * @param {Object} schema - Joi validation schema with body, params, query keys
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each part of the request
    for (const key of ["body", "params", "query"]) {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const fieldErrors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message.replace(/"/g, ""),
          }));
          errors.push(...fieldErrors);
        } else {
          // Replace req[key] with validated & sanitized value
          req[key] = value;
        }
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest("Validation Error", errors));
    }

    next();
  };
};

module.exports = validate;
