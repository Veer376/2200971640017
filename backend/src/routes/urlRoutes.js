const express = require('express');
const urlController = require('../controllers/urlController');
const { validateUrlCreation, validateShortcode } = require('../middleware/validation');
const Log = require('../utils/logger');

const router = express.Router();

// Route for creating a shortened URL
router.post(
  '/shorturls', 
  validateUrlCreation, 
  urlController.createShortUrl
);

// Route for retrieving URL statistics
router.get(
  '/shorturls/:shortcode',
  validateShortcode,
  urlController.getUrlStats
);

// Log route access
router.use((req, res, next) => {
  Log('info', 'route', `${req.method} ${req.originalUrl}`);
  next();
});

module.exports = router;
