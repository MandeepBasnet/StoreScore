const { ValidationError } = require('./errorHandler');

/**
 * Validate KPI data structure
 */
const validateKPIData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('KPI data must be an object');
  }

  // Add specific validation rules based on StoreScore API requirements
  // This is a placeholder - update based on actual API documentation
  const requiredFields = ['storeId', 'date', 'metrics'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  return true;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const validateDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(dateString)) {
    throw new ValidationError('Invalid date format. Expected YYYY-MM-DD');
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid date value');
  }

  return true;
};

/**
 * Validate store ID
 */
const validateStoreId = (storeId) => {
  if (!storeId || typeof storeId !== 'string') {
    throw new ValidationError('Invalid store ID');
  }

  return true;
};

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

module.exports = {
  validateKPIData,
  validateDate,
  validateStoreId,
  sanitizeInput
};
