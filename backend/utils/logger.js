/**
 * Logger utility for consistent logging across the application
 */

const logLevels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

const logger = {
  info: (message, data) => log(logLevels.INFO, message, data),
  warn: (message, data) => log(logLevels.WARN, message, data),
  error: (message, data) => log(logLevels.ERROR, message, data),
  debug: (message, data) => log(logLevels.DEBUG, message, data)
};

module.exports = logger;
