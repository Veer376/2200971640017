// Log wrapper
const { default: LogMiddleware } = require('logging-middleware');

/**
 * Wrapper function around the logging middleware
 * @param {string} level - Log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} pkg - Package name (e.g., 'handler', 'controller', 'db', etc.')
 * @param {string} message - Log message
 */
const Log = (level, pkg, message) => {
  // Always use 'backend' as stack for backend service
  try {
    // Make sure pkg is one of the allowed package names
    // Make the logging async but don't wait for it to complete
    LogMiddleware('backend', level, pkg, message)
      .then(response => {
        console.log(`Log sent successfully: ${response.data.logID}`);
      })
      .catch(error => {
        console.error(`Logging error: ${error.message}`);
      });
    
    // Also log to console for local debugging
    console.log(`[${level.toUpperCase()}] [${pkg}] ${message}`);
  } catch (error) {
    console.error('Logging error:', error.message);
  }
};

module.exports = Log;
