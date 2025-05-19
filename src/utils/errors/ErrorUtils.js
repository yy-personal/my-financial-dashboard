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
    default:
      return 'Something went wrong. Please try again.';
  }
};
