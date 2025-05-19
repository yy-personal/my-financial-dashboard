/**
 * Get the month name from its number
 * 
 * @param {number} monthNumber - Month number (1-12)
 * @returns {string} - Month name
 */
export const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return months[monthNumber - 1] || "January";
};

/**
 * Format a date object with month and year as a string
 * 
 * @param {Object} dateObj - Date object with month and year properties
 * @param {number} dateObj.month - Month number (1-12)
 * @param {number} dateObj.year - Year
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateObj) => {
  return `${getMonthName(dateObj.month)} ${dateObj.year}`;
};

/**
 * Get month number from month name
 * 
 * @param {string} monthName - Month name
 * @returns {number} - Month number (1-12)
 */
export const getMonthNumber = (monthName) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    months.findIndex((m) =>
      monthName.toLowerCase().startsWith(m.toLowerCase())
    ) + 1 || 1
  );
};
