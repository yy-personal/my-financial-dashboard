/**
 * CPF Calculation Utilities
 * 
 * This module provides utilities for calculating CPF contributions based on
 * Singapore's CPF contribution rates as of 2025.
 */

/**
 * Supported employee types for CPF calculations
 */
export const EMPLOYEE_TYPE = {
  SINGAPOREAN: 'singaporean',
  PR_FIRST_YEAR: 'pr_first_year',
  PR_SECOND_YEAR: 'pr_second_year',
  PR_THIRD_YEAR_ONWARDS: 'pr_third_year_onwards',
};

/**
 * CPF contribution rates for Singaporean Citizens based on age
 * 
 * Format: [employeeContributionRate, employerContributionRate]
 */
const CITIZEN_RATES = {
  '55_and_below': [0.20, 0.17],
  '55_to_60': [0.15, 0.15],
  '60_to_65': [0.105, 0.095],
  '65_to_70': [0.075, 0.075],
  'above_70': [0.05, 0.05],
};

/**
 * CPF contribution rates for 1st year Permanent Residents
 */
const PR_FIRST_YEAR_RATES = {
  '55_and_below': [0.05, 0.15],
  '55_to_60': [0.05, 0.15],
  '60_to_65': [0.05, 0.085],
  '65_to_70': [0.05, 0.065],
  'above_70': [0.05, 0.045],
};

/**
 * CPF contribution rates for 2nd year Permanent Residents
 */
const PR_SECOND_YEAR_RATES = {
  '55_and_below': [0.15, 0.15],
  '55_to_60': [0.15, 0.15],
  '60_to_65': [0.085, 0.085],
  '65_to_70': [0.06, 0.065],
  'above_70': [0.05, 0.045],
};

/**
 * CPF contribution rates for 3rd year onwards Permanent Residents
 */
const PR_THIRD_YEAR_ONWARDS_RATES = {
  '55_and_below': [0.20, 0.17],
  '55_to_60': [0.15, 0.15],
  '60_to_65': [0.095, 0.095],
  '65_to_70': [0.075, 0.075],
  'above_70': [0.05, 0.05],
};

/**
 * CPF salary ceiling constants
 */
const OW_CEILING = 6000; // Ordinary Wage Ceiling
const AW_CEILING = 102000; // Additional Wage Ceiling

/**
 * Get age bracket for CPF contribution rates
 * 
 * @param {number} age - Employee's age
 * @returns {string} Age bracket key
 */
export const getAgeBracket = (age) => {
  if (age <= 55) return '55_and_below';
  if (age <= 60) return '55_to_60';
  if (age <= 65) return '60_to_65';
  if (age <= 70) return '65_to_70';
  return 'above_70';
};

/**
 * Get CPF contribution rates based on employee type and age
 * 
 * @param {string} employeeType - Type of employee (from EMPLOYEE_TYPE)
 * @param {number} age - Employee's age
 * @returns {Array} [employeeContributionRate, employerContributionRate]
 */
export const getCpfRates = (employeeType, age) => {
  const ageBracket = getAgeBracket(age);
  
  switch (employeeType) {
    case EMPLOYEE_TYPE.SINGAPOREAN:
      return CITIZEN_RATES[ageBracket];
    case EMPLOYEE_TYPE.PR_FIRST_YEAR:
      return PR_FIRST_YEAR_RATES[ageBracket];
    case EMPLOYEE_TYPE.PR_SECOND_YEAR:
      return PR_SECOND_YEAR_RATES[ageBracket];
    case EMPLOYEE_TYPE.PR_THIRD_YEAR_ONWARDS:
      return PR_THIRD_YEAR_ONWARDS_RATES[ageBracket];
    default:
      throw new Error(`Invalid employee type: ${employeeType}`);
  }
};

/**
 * Calculate CPF contribution amounts based on salary and employee details
 * 
 * @param {number} salary - Monthly salary
 * @param {string} employeeType - Type of employee (from EMPLOYEE_TYPE)
 * @param {number} age - Employee's age
 * @param {number} additionalWage - Additional wage for the year (e.g., bonus)
 * @param {number} totalOrdinaryWageForYear - Total ordinary wage for the year so far
 * @returns {Object} Object containing employee and employer contributions
 */
export const calculateCpfContributions = (
  salary,
  employeeType = EMPLOYEE_TYPE.SINGAPOREAN,
  age = 30,
  additionalWage = 0,
  totalOrdinaryWageForYear = 0
) => {
  try {
    // Get applicable rates
    const [employeeRate, employerRate] = getCpfRates(employeeType, age);
    
    // Apply wage ceiling for ordinary wage (monthly salary)
    const cappedSalary = Math.min(salary, OW_CEILING);
    
    // Calculate ordinary wage contributions
    const employeeContribution = Math.round(cappedSalary * employeeRate * 100) / 100;
    const employerContribution = Math.round(cappedSalary * employerRate * 100) / 100;
    
    // Handle additional wage (e.g., bonus) if provided
    let additionalEmployeeContribution = 0;
    let additionalEmployerContribution = 0;
    
    if (additionalWage > 0) {
      // Calculate remaining allowable additional wage for CPF
      const yearToDateOW = totalOrdinaryWageForYear || (cappedSalary * 12);
      const remainingAWCeiling = Math.max(0, AW_CEILING - yearToDateOW);
      const cappedAdditionalWage = Math.min(additionalWage, remainingAWCeiling);
      
      // Calculate additional wage contributions
      additionalEmployeeContribution = Math.round(cappedAdditionalWage * employeeRate * 100) / 100;
      additionalEmployerContribution = Math.round(cappedAdditionalWage * employerRate * 100) / 100;
    }
    
    // Total contributions
    const totalEmployeeContribution = employeeContribution + additionalEmployeeContribution;
    const totalEmployerContribution = employerContribution + additionalEmployerContribution;
    const totalCpfContribution = totalEmployeeContribution + totalEmployerContribution;
    
    // Calculate take home pay
    const takeHomePay = salary + additionalWage - totalEmployeeContribution;
    
    return {
      employeeContribution: totalEmployeeContribution,
      employerContribution: totalEmployerContribution,
      totalContribution: totalCpfContribution,
      takeHomePay,
      // Include rate details for reference
      rates: {
        employeeRate,
        employerRate
      }
    };
  } catch (error) {
    console.error('Error calculating CPF contributions:', error);
    return {
      employeeContribution: 0,
      employerContribution: 0,
      totalContribution: 0,
      takeHomePay: salary + additionalWage,
      rates: {
        employeeRate: 0,
        employerRate: 0
      }
    };
  }
};

/**
 * Estimate yearly CPF contributions based on monthly salary and bonus months
 * 
 * @param {number} monthlySalary - Monthly salary
 * @param {string} employeeType - Type of employee (from EMPLOYEE_TYPE)
 * @param {number} age - Employee's age
 * @param {number} bonusMonths - Number of months for bonus
 * @returns {Object} Object containing yearly CPF contribution totals
 */
export const estimateYearlyCpfContributions = (
  monthlySalary,
  employeeType = EMPLOYEE_TYPE.SINGAPOREAN,
  age = 30,
  bonusMonths = 0
) => {
  // Calculate monthly CPF contribution
  const monthlyContribution = calculateCpfContributions(
    monthlySalary, 
    employeeType, 
    age
  );
  
  // Calculate bonus contribution (if applicable)
  let bonusContribution = { employeeContribution: 0, employerContribution: 0, totalContribution: 0 };
  
  if (bonusMonths > 0) {
    const bonusSalary = monthlySalary * bonusMonths;
    const yearToDateOW = Math.min(monthlySalary, OW_CEILING) * 12;
    
    bonusContribution = calculateCpfContributions(
      0, // No ordinary wage
      employeeType,
      age,
      bonusSalary,
      yearToDateOW
    );
  }
  
  // Calculate yearly totals
  const yearlyEmployeeContribution = (monthlyContribution.employeeContribution * 12) + 
    bonusContribution.employeeContribution;
  
  const yearlyEmployerContribution = (monthlyContribution.employerContribution * 12) + 
    bonusContribution.employerContribution;
  
  const yearlyTotalContribution = yearlyEmployeeContribution + yearlyEmployerContribution;
  
  return {
    yearlyEmployeeContribution,
    yearlyEmployerContribution,
    yearlyTotalContribution,
    monthlyDetails: monthlyContribution,
    bonusDetails: bonusContribution
  };
};
