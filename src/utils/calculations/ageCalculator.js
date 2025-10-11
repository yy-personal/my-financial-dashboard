/**
 * Age Calculation Utilities
 *
 * Centralized utility for calculating age based on birthday information.
 * This prevents duplication across multiple components and hooks.
 */

/**
 * Calculate current age based on birthday month and year
 *
 * @param {Object} birthday - Birthday object with month and year
 * @param {number} birthday.month - Birth month (1-12)
 * @param {number} birthday.year - Birth year (e.g., 1996)
 * @param {Date} referenceDate - Optional reference date (defaults to current date)
 * @returns {number} Current age in years
 */
export const calculateAge = (birthday, referenceDate = new Date()) => {
  if (!birthday || typeof birthday.month !== 'number' || typeof birthday.year !== 'number') {
    return null;
  }

  const birthMonth = birthday.month;
  const birthYear = birthday.year;
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDay = referenceDate.getDate();

  let age = currentYear - birthYear;

  // Adjust if birthday hasn't occurred yet this year
  // Assume birthday is on the 15th of the birth month if no day is specified
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < 15)
  ) {
    age--;
  }

  return age;
};

/**
 * Calculate age at a specific future month and year
 *
 * @param {Object} birthday - Birthday object with month and year
 * @param {number} targetYear - Target year
 * @param {number} targetMonth - Target month (1-12)
 * @returns {number} Age at the target date
 */
export const calculateAgeAt = (birthday, targetYear, targetMonth) => {
  if (!birthday || typeof birthday.month !== 'number' || typeof birthday.year !== 'number') {
    return null;
  }

  if (typeof targetYear !== 'number' || typeof targetMonth !== 'number') {
    return null;
  }

  const birthMonth = birthday.month;
  const birthYear = birthday.year;

  let age = targetYear - birthYear;

  // Adjust if birthday hasn't occurred yet in the target year/month
  if (targetMonth < birthMonth) {
    age--;
  }

  return age;
};

/**
 * Calculate age progression over a period of months
 *
 * @param {Object} birthday - Birthday object with month and year
 * @param {number} startYear - Start year for projection
 * @param {number} startMonth - Start month (1-12)
 * @param {number} totalMonths - Total number of months to project
 * @returns {Array} Array of {month: index, age: number} objects
 */
export const calculateAgeProgression = (birthday, startYear, startMonth, totalMonths) => {
  if (!birthday || typeof birthday.month !== 'number' || typeof birthday.year !== 'number') {
    return [];
  }

  const progression = [];
  const birthMonth = birthday.month;
  const birthYear = birthday.year;

  for (let month = 0; month < totalMonths; month++) {
    const totalMonthsFromStart = startMonth - 1 + month;
    const year = startYear + Math.floor(totalMonthsFromStart / 12);
    const monthIndex = (totalMonthsFromStart % 12) + 1;

    let age = year - birthYear;
    if (monthIndex < birthMonth) {
      age--;
    }

    progression.push({
      month,
      age,
      year,
      monthIndex
    });
  }

  return progression;
};

/**
 * Determine CPF age bracket based on current age
 *
 * @param {number} age - Current age
 * @returns {string} Age bracket identifier
 */
export const getCpfAgeBracket = (age) => {
  if (age <= 55) return '55_and_below';
  if (age <= 60) return '55_to_60';
  if (age <= 65) return '60_to_65';
  if (age <= 70) return '65_to_70';
  return 'above_70';
};

/**
 * Check if age will cross a CPF bracket boundary within projection period
 *
 * @param {number} currentAge - Current age
 * @param {number} projectionYears - Number of years to project
 * @returns {Object} Object with crossesBoundary flag and boundary details
 */
export const checkCpfBracketCrossing = (currentAge, projectionYears) => {
  const futureAge = currentAge + projectionYears;
  const currentBracket = getCpfAgeBracket(currentAge);
  const futureBracket = getCpfAgeBracket(futureAge);

  const boundaries = [55, 60, 65, 70];
  const crossedBoundaries = boundaries.filter(
    boundary => currentAge < boundary && futureAge >= boundary
  );

  return {
    crossesBoundary: currentBracket !== futureBracket,
    currentBracket,
    futureBracket,
    crossedBoundaries,
    affectsCpfRates: crossedBoundaries.length > 0
  };
};

/**
 * Format age as a human-readable string
 *
 * @param {number} age - Age in years
 * @returns {string} Formatted age string
 */
export const formatAge = (age) => {
  if (age === null || age === undefined || typeof age !== 'number') {
    return 'N/A';
  }

  if (age < 0) {
    return 'Invalid';
  }

  return `${age} year${age !== 1 ? 's' : ''} old`;
};
