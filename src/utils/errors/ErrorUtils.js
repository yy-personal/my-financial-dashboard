/**
 * Error utilities for the Financial Dashboard application
 * Provides helper functions for consistent error handling across the app
 */

/**
 * Formats error messages for display to users
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle specific error types with custom messages
  if (error.name === 'NetworkError') {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (error.name === 'TimeoutError') {
    return 'The operation timed out. Please try again later.';
  }
  
  if (error.name === 'ValidationError') {
    return `Validation error: ${error.message}`;
  }
  
  // Return original message for other error types
  return error.message || 'An unexpected error occurred';
};

/**
 * Logs errors to console with enhanced information
 * @param {Error} error - The error object
 * @param {string} componentName - The name of the component where the error occurred
 * @param {Object} metadata - Additional metadata about the error context
 */
export const logError = (error, componentName = 'Unknown', metadata = {}) => {
  console.error(`[${componentName}] Error:`, error);
  
  if (Object.keys(metadata).length > 0) {
    console.error(`Error metadata:`, metadata);
  }
  
  // Add additional logging or error tracking service integration here
  // e.g., Sentry, LogRocket, etc.
};

/**
 * Determines if an error should be reported to the user
 * @param {Error} error - The error object
 * @returns {boolean} Whether to show the error to the user
 */
export const shouldDisplayError = (error) => {
  // Some errors we might want to handle silently
  const silentErrors = [
    'AbortError', // User cancelled operation
    'throttled',  // Rate limiting
  ];
  
  if (error && error.name && silentErrors.includes(error.name)) {
    return false;
  }
  
  return true;
};

/**
 * Creates a standardized error object with additional context
 * @param {string} message - The error message
 * @param {string} type - The error type/category
 * @param {Object} additionalData - Any additional error context
 * @returns {Error} Enhanced error object
 */
export const createError = (message, type = 'ApplicationError', additionalData = {}) => {
  const error = new Error(message);
  error.name = type;
  error.additionalData = additionalData;
  return error;
};

/**
 * Creates a financial-specific error with appropriate type
 * @param {string} message - Error message
 * @param {string} code - Error code for categorization
 * @returns {Error} Financial error object
 */
export const createFinancialError = (message, code = 'calculation_error') => {
  const error = new Error(message);
  error.name = 'FinancialError';
  error.code = code;
  return error;
};

/**
 * Safely get a nested property from an object without errors
 * @param {Object} obj - The object to get value from
 * @param {string} path - The property path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} The property value or default
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj) return defaultValue;
  
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      result = result[key];
      if (result === undefined || result === null) {
        return defaultValue;
      }
    }
    
    return result;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely parse a number from various inputs
 * @param {any} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default
 */
export const safeParseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  try {
    // Handle string inputs
    if (typeof value === 'string') {
      // Remove currency symbols, commas, etc.
      const cleaned = value.replace(/[^-0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // Handle numeric inputs
    if (typeof value === 'number') {
      return isNaN(value) ? defaultValue : value;
    }
    
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safely divide two numbers without division by zero errors
 * @param {number} numerator - The numerator
 * @param {number} denominator - The denominator
 * @param {number} defaultValue - Default value if division is invalid
 * @returns {number} Division result or default
 */
export const safeDivide = (numerator, denominator, defaultValue = 0) => {
  if (denominator === 0 || denominator === undefined || denominator === null) {
    return defaultValue;
  }
  
  try {
    const result = numerator / denominator;
    return isNaN(result) || !isFinite(result) ? defaultValue : result;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Validates financial data structure for required fields and valid values
 * @param {Object} data - Financial data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export const validateFinancialData = (data) => {
  const errors = [];
  
  if (!data) {
    return { isValid: false, errors: ['No financial data provided'] };
  }
  
  // Check basic structure
  if (!data.personalInfo) {
    errors.push('Missing personal information');
  }
  
  if (!data.financialInfo) {
    errors.push('Missing financial information');
  }
  
  // Check for critical fields if sections exist
  if (data.personalInfo) {
    if (data.personalInfo.monthlySalary === undefined) {
      errors.push('Missing monthly salary');
    } else if (safeParseNumber(data.personalInfo.monthlySalary) < 0) {
      errors.push('Monthly salary cannot be negative');
    }
  }
  
  if (data.financialInfo) {
    if (data.financialInfo.monthlyExpenses === undefined) {
      errors.push('Missing monthly expenses');
    } else if (safeParseNumber(data.financialInfo.monthlyExpenses) < 0) {
      errors.push('Monthly expenses cannot be negative');
    }
    
    if (data.financialInfo.liquidCash !== undefined && 
        safeParseNumber(data.financialInfo.liquidCash) < 0) {
      errors.push('Liquid cash cannot be negative');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets fallback UI message based on error type
 * @param {Error} error - The error object 
 * @returns {string} Message to display in fallback UI
 */
export const getFallbackMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';
  
  switch (error.name) {
    case 'DataError':
      return 'There was a problem loading your financial data. Please refresh the page.';
    case 'ChartError':
      return 'Unable to display chart. Your data is still safe.';
    case 'CalculationError':
      return 'Error in financial calculations. Please check your inputs.';
    case 'FinancialError':
      if (error.code === 'negative_value') {
        return 'Financial values cannot be negative. Please check your inputs.';
      } else if (error.code === 'missing_data') {
        return 'Some required financial data is missing. Please complete all required fields.';
      }
      return 'Error in financial calculations. Please check your inputs.';
    default:
      return 'Something went wrong. Please try again.';
  }
};
