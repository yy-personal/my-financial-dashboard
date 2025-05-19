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
 * Gets CPF contribution rates based on age
 * @param {number} age - Age of the individual
 * @returns {Object} Employee and employer contribution rates
 */
export const getCPFRatesByAge = (age) => {
  if (!age || isNaN(age)) {
    return { employeeRate: 20, employerRate: 17 }; // Default rates for missing age
  }
  
  // Age-based CPF contribution rates (as of 2023)
  if (age <= 55) {
    return { employeeRate: 20, employerRate: 17 };
  } else if (age <= 60) {
    return { employeeRate: 13, employerRate: 13 };
  } else if (age <= 65) {
    return { employeeRate: 7.5, employerRate: 9 };
  } else if (age <= 70) {
    return { employeeRate: 5, employerRate: 7 };
  } else {
    return { employeeRate: 5, employerRate: 5 };
  }
};

/**
 * Calculates CPF allocation to different accounts based on age
 * @param {number} totalContribution - Total CPF contribution
 * @param {number} age - Age of the individual
 * @returns {Object} Allocation to Ordinary, Special and Medisave accounts
 */
export const allocateCPFContribution = (totalContribution, age) => {
  if (!totalContribution || totalContribution <= 0) {
    return { ordinary: 0, special: 0, medisave: 0 };
  }

  // Default allocation: 61.7% to OA, 14.6% to SA, 23.7% to MA
  let ordinaryPercent = 0.617;
  let specialPercent = 0.146;
  let medisavePercent = 0.237;
  
  // Adjust allocation based on age
  if (age >= 35 && age < 45) {
    // 55 to SA, 22 to MA
    ordinaryPercent = 0.6176;
    specialPercent = 0.1621;
    medisavePercent = 0.2203;
  } else if (age >= 45 && age < 50) {
    // 49 to OA, 26 to SA, 25 to MA
    ordinaryPercent = 0.49;
    specialPercent = 0.26;
    medisavePercent = 0.25;
  } else if (age >= 50 && age < 55) {
    // 37 to OA, 35 to SA, 28 to MA
    ordinaryPercent = 0.37;
    specialPercent = 0.35;
    medisavePercent = 0.28;
  } else if (age >= 55 && age < 60) {
    // 31 to OA, 11.5 to SA, 57.5 to MA
    ordinaryPercent = 0.31;
    specialPercent = 0.115;
    medisavePercent = 0.575;
  } else if (age >= 60 && age < 65) {
    // 13 to OA, 1.5 to SA, 85.5 to MA
    ordinaryPercent = 0.13;
    specialPercent = 0.015;
    medisavePercent = 0.855;
  } else if (age >= 65) {
    // 8 to OA, 1 to SA, 91 to MA
    ordinaryPercent = 0.08;
    specialPercent = 0.01;
    medisavePercent = 0.91;
  }

  // Apply allocation percentages with rounding to 2 decimal places
  const ordinary = Math.round(totalContribution * ordinaryPercent * 100) / 100;
  const special = Math.round(totalContribution * specialPercent * 100) / 100;
  const medisave = Math.round(totalContribution * medisavePercent * 100) / 100;
  
  // Adjust for rounding errors
  const roundingError = totalContribution - (ordinary + special + medisave);
  
  return {
    ordinary: ordinary + roundingError, // Add rounding error to ordinary account
    special,
    medisave
  };
};

/**
 * Calculates CPF contribution caps
 * @returns {Object} Contribution caps for different aspects of CPF
 */
export const getCPFContributionCaps = () => {
  // CPF contribution caps and limits (as of 2023)
  return {
    // Ordinary Wage Ceiling (OWC) per month
    ordinaryWageCeiling: 6000,
    // Additional Wage Ceiling (AWC) per year
    additionalWageCeiling: 102000,
    // CPF Annual Limit
    annualLimit: 37740,
    // CPF Minimum Sum (FRS)
    fullRetirementSum: 198800,
    // Medisave Contribution Ceiling (MCC)
    medisaveCeiling: 63000,
    // Basic Healthcare Sum (BHS)
    basicHealthcareSum: 66000
  };
};

/**
 * Checks if CPF values are within valid ranges
 * @param {Object} cpfData - CPF-related data to validate
 * @returns {Object} Validation result
 */
export const validateCPFData = (cpfData) => {
  const errors = [];
  
  if (!cpfData) {
    return { isValid: false, errors: ['No CPF data provided'] };
  }
  
  // Check contribution rates are within valid range
  if (cpfData.employeeRate !== undefined) {
    const rate = safeParseNumber(cpfData.employeeRate);
    if (rate < 0 || rate > 20) {
      errors.push('Employee CPF rate must be between 0% and 20%');
    }
  }
  
  if (cpfData.employerRate !== undefined) {
    const rate = safeParseNumber(cpfData.employerRate);
    if (rate < 0 || rate > 17) {
      errors.push('Employer CPF rate must be between 0% and 17%');
    }
  }
  
  // Check CPF account balances are non-negative
  if (cpfData.ordinaryAccount !== undefined && safeParseNumber(cpfData.ordinaryAccount) < 0) {
    errors.push('CPF Ordinary Account balance cannot be negative');
  }
  
  if (cpfData.specialAccount !== undefined && safeParseNumber(cpfData.specialAccount) < 0) {
    errors.push('CPF Special Account balance cannot be negative');
  }
  
  if (cpfData.medisaveAccount !== undefined && safeParseNumber(cpfData.medisaveAccount) < 0) {
    errors.push('CPF Medisave Account balance cannot be negative');
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