/**
 * Format a number as a currency string (SGD)
 * 
 * @param {number} value - The number to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number as a percentage
 * 
 * @param {number} value - The decimal value to format (e.g., 0.1 for 10%)
 * @returns {string} - Formatted percentage string
 */
export const formatPercent = (value) => {
  return new Intl.NumberFormat("en-SG", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};
