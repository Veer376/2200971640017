const { body, validationResult } = require('express-validator');
const validUrl = require('valid-url');
const Log = require('../utils/logger');

// Middleware for validating URL creation requests
exports.validateUrlCreation = [
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .custom((value) => {
      if (!validUrl.isUri(value)) {
        throw new Error('Invalid URL format');
      }
      return true;
    }),
  body('validity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Validity must be a positive integer representing minutes'),
  body('shortcode')
    .optional()
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage('Shortcode must be between 3-20 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Shortcode can only contain letters, numbers, hyphens, and underscores'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Log('error', 'middleware', `Validation error: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware for validating shortcode parameter
exports.validateShortcode = [
  (req, res, next) => {
    if (!req.params.shortcode) {
      Log('error', 'middleware', 'Missing shortcode parameter');
      return res.status(400).json({ error: 'Shortcode parameter is required' });
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(req.params.shortcode)) {
      Log('error', 'middleware', `Invalid shortcode format: ${req.params.shortcode}`);
      return res.status(400).json({ error: 'Invalid shortcode format' });
    }
    next();
  },
];
