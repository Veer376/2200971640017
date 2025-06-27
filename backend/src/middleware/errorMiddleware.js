const Log = require('../utils/logger');

// Error handling middleware
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  Log('error', 'middleware', `Error: ${err.message}`);
  
  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// 404 Not Found handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  
  Log('warn', 'middleware', `404 Not Found: ${req.originalUrl}`);
  
  next(error);
};
