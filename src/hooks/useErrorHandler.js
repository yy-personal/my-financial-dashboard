import { useState, useCallback } from 'react';
import { logError } from '../utils/errors/ErrorUtils';

/**
 * Custom hook for managing errors in components and hooks
 * 
 * @param {string} componentName - Name of the component using this hook
 * @returns {Object} Error handling methods and state
 */
const useErrorHandler = (componentName = 'Unknown') => {
  const [error, setError] = useState(null);
  const [hasError, setHasError] = useState(false);

  /**
   * Handle an error by setting error state and optionally logging it
   * 
   * @param {Error} error - The error object
   * @param {Object} additionalData - Optional additional data to log
   * @param {boolean} shouldLog - Whether to log the error
   */
  const handleError = useCallback((error, additionalData = {}, shouldLog = true) => {
    setError(error);
    setHasError(true);
    
    if (shouldLog) {
      logError(error, componentName, additionalData);
    }
  }, [componentName]);

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  /**
   * Safely execute a function, catching and handling any errors
   * 
   * @param {Function} fn - The function to execute
   * @param {Array} args - Arguments to pass to the function
   * @param {Object} additionalData - Optional additional data to log with any error
   * @returns {any} The result of the function or undefined if an error occurred
   */
  const tryCatch = useCallback((fn, args = [], additionalData = {}) => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, additionalData);
      return undefined;
    }
  }, [handleError]);

  /**
   * Create an async function wrapped with error handling
   * 
   * @param {Function} asyncFn - The async function to wrap
   * @returns {Function} Wrapped function that handles errors
   */
  const withErrorHandling = useCallback((asyncFn) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, { args });
        return undefined;
      }
    };
  }, [handleError]);

  return {
    error,
    hasError,
    handleError,
    clearError,
    tryCatch,
    withErrorHandling
  };
};

export default useErrorHandler;