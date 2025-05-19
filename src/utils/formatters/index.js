/**
 * Formatting utility functions for the Financial Dashboard
 */

/**
 * Format a number as a currency string
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: 'SGD')
 * @param {string} locale - The locale to use (default: 'en-SG')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'SGD', locale = 'en-SG') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number as a percentage string
 * @param {number} value - The value to format
 * @param {number} fractionDigits - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, fractionDigits = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(fractionDigits)}%`;
};

/**
 * Format a number with commas as thousands separators
 * @param {number} value - The value to format
 * @param {number} fractionDigits - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, fractionDigits = 0) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
};

/**
 * Format a date as a string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'medium')
 * @param {string} locale - The locale to use (default: 'en-SG')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium', locale = 'en-SG') => {
  if (!date) {
    return '';
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const options = {};
  
  switch (format) {
    case 'short':
      options.day = 'numeric';
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'long':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'month-year':
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'medium':
    default:
      options.day = 'numeric';
      options.month = 'short';
      options.year = 'numeric';
      break;
  }
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};