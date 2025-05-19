/**
 * ErrorUtils - Utility functions for error handling
 */

/**
 * Log error to console or to an error tracking service like Sentry
 * @param {Error} error - The error object
 * @param {string} componentName - The name of the component where the error occurred
 * @param {Object} additionalData - Any additional data to log with the error
 */
export const logError = (error, componentName = 'Unknown', additionalData = {}) => {
  console.error(`Error in ${componentName}:`, error);

  // In production, you would send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Simulate sending to error service
    console.info('Would send to error tracking service:', {
      error: error.toString(),
      componentName,
      stack: error.stack,
      ...additionalData
    });
    
    // If actually using a service like Sentry:
    // Sentry.captureException(error, {
    //   tags: { component: componentName },
    //   extra: additionalData
    // });
  }
};

/**
 * Format a financial calculation error in a user-friendly way
 * @param {Error} error - The error object
 * @returns {string} A user-friendly error message
 */
export const formatFinancialError = (error) => {
  // Define known error types and their friendly messages
  const errorMessages = {
    'dividend_by_zero': 'Cannot divide by zero in financial calculation',
    'negative_value': 'Negative values are not allowed in this calculation',
    'invalid_date': 'The date provided is invalid',
    'missing_data': 'Some required financial data is missing',
    'calculation_overflow': 'The calculation resulted in a value that is too large',
    'invalid_parameter': 'One of the parameters provided is invalid',
  };

  // Check if this is one of our known error types
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }
  
  // Generic financial error message
  if (error.message && error.message.includes('financial')) {
    return `There was a problem with the financial calculation: ${error.message}`;
  }
  
  // Default message
  return 'An error occurred while processing your financial data. Please check your inputs and try again.';
};

/**
 * Create a financial calculation error with a specific code
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {Error} An error object with a code property
 */
export const createFinancialError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

/**
 * Safely parse a number, returning a default value if parsing fails
 * @param {any} value - The value to parse
 * @param {number} defaultValue - Default value to return if parsing fails
 * @returns {number} The parsed number or default value
 */
export const safeParseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  const parsedValue = Number(value);
  return isNaN(parsedValue) ? defaultValue : parsedValue;
};

/**
 * Safely perform division, avoiding divide by zero errors
 * @param {number} numerator - The numerator
 * @param {number} denominator - The denominator
 * @param {number} defaultValue - Default value to return if denominator is zero
 * @returns {number} The result of the division or defaultValue
 */
export const safeDivide = (numerator, denominator, defaultValue = 0) => {
  if (denominator === 0) {
    return defaultValue;
  }
  return numerator / denominator;
};

/**
 * Safely access a nested property in an object
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the property (e.g., 'user.address.city')
 * @param {any} defaultValue - Default value to return if property doesn't exist
 * @returns {any} The property value or defaultValue
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || !Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Check if financial data is valid for calculations
 * @param {Object} data - The financial data to validate
 * @returns {Object} Object with isValid boolean and any error messages
 */
export const validateFinancialData = (data) => {
  const errors = [];
  
  // Check if data exists
  if (!data) {
    return { isValid: false, errors: ['No financial data provided'] };
  }
  
  // Check for required personal info
  if (!data.personalInfo) {
    errors.push('Personal information is missing');
  } else {
    // Check for negative values
    if (safeGet(data, 'personalInfo.currentSavings', 0) < 0) {
      errors.push('Current savings cannot be negative');
    }
    
    if (safeGet(data, 'personalInfo.monthlyRepayment', 0) < 0) {
      errors.push('Monthly loan repayment cannot be negative');
    }
    
    // Check for missing required fields
    if (safeGet(data, 'personalInfo.monthlySalary') === undefined) {
      errors.push('Monthly salary information is missing');
    }
  }
  
  // Check for required expense info
  if (!data.expenses && !data.expenseItems) {
    errors.push('Expense information is missing');
  }
  
  return { 
    isValid: errors.length === 0,
    errors
  };
};

export default {
  logError,
  formatFinancialError,
  createFinancialError,
  safeParseNumber,
  safeDivide,
  safeGet,
  validateFinancialData
};