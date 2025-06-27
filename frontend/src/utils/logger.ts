// Frontend logger utility
import LogMiddleware, { Stack, Level, Package } from 'logging-middleware';

/**
 * Frontend logging wrapper function
 * @param {Level} level - Log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {Package} pkg - Package name (e.g., 'api', 'component', 'hook', etc.)
 * @param {string} message - Log message
 */
export const Log = (level: Level, pkg: Package, message: string): void => {
  try {
    // Make the logging async but don't wait for it to complete
    LogMiddleware('frontend', level, pkg, message)
      .then(response => {
        console.log(`Log sent successfully: ${response.data.logID}`);
      })
      .catch(error => {
        console.error(`Logging error: ${error.message}`);
      });
    
    // Also log to console for local debugging
    console.log(`[${level.toUpperCase()}] [${pkg}] ${message}`);
  } catch (error) {
    console.error('Logging error:', error instanceof Error ? error.message : String(error));
  }
};

export default Log;
