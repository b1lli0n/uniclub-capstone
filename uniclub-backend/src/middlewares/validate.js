const Joi = require("joi");

/**
 * Middleware factory để validate request
 * Usage: validate({ body: schema, params: schema, query: schema })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const errors = {};

    // Validate body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        errors.body = error.details.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));
      } else {
        req.body = value;
      }
    }

    // Validate params
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false
      });
      if (error) {
        errors.params = error.details.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));
      } else {
        req.params = value;
      }
    }

    // Validate query
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false
      });
      if (error) {
        errors.query = error.details.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));
      } else {
        req.query = value;
      }
    }

    // Nếu có lỗi, return 400 Bad Request
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    next();
  };
};

module.exports = { validate, Joi };
