// src/adapters/FinancialDataAdapter.js
import { safeGet, safeParseNumber } from '../utils/errors/ErrorUtils';

/**
 * This adapter maps the data from FinancialContext format to the format 
 * expected by useFinancialCalculations hook
 * 
 * @param {Object} financialContextData - Data from FinancialContext
 * @returns {Object} - Data in the format expected by useFinancialCalculations
 */
export const mapFinancialDataForCalculations = (financialContextData) => {
  if (!financialContextData) return null;
  
  // Check if we're dealing with the old or new data structure
  const isNewFormat = financialContextData.income !== undefined;
  
  if (isNewFormat) {
    const { personalInfo, income, expenses } = financialContextData;
    
    // Map to the expected structure for new format
    return {
      personalInfo: {
        monthlySalary: safeGet(income, 'currentSalary', 0),
        age: calculateAgeFromBirthday(safeGet(personalInfo, 'birthday', { month: 1, year: 1990 })),
        cpfContributionRate: safeGet(income, 'cpfRate', 20),
        employerCpfContributionRate: safeGet(income, 'employerCpfRate', 17),
        monthlyRepayment: safeGet(personalInfo, 'monthlyRepayment', 0)
      },
      financialInfo: {
        monthlyExpenses: Array.isArray(expenses) 
          ? expenses.reduce((total, expense) => total + safeParseNumber(expense.amount, 0), 0) 
          : 0,
        housingLoanRemaining: safeGet(personalInfo, 'remainingLoan', 0),
        liquidCash: safeGet(personalInfo, 'currentSavings', 0),
        cpfOrdinaryAccount: personalInfo?.currentCpfBalance ? (personalInfo.currentCpfBalance * 0.6) : 0,
        cpfSpecialAccount: personalInfo?.currentCpfBalance ? (personalInfo.currentCpfBalance * 0.2) : 0, 
        cpfMedisaveAccount: personalInfo?.currentCpfBalance ? (personalInfo.currentCpfBalance * 0.2) : 0
      },
      expenseItems: Array.isArray(expenses) 
        ? expenses.map(expense => ({
            category: expense.name,
            amount: safeParseNumber(expense.amount, 0)
          }))
        : []
    };
  } else {
    // Handle the legacy structure directly
    return {
      personalInfo: {
        monthlySalary: safeGet(financialContextData, 'personalInfo.monthlySalary', 0) || 
                      safeGet(financialContextData, 'income.currentSalary', 0),
        age: calculateAgeFromBirthday(safeGet(financialContextData, 'personalInfo.birthday', { month: 1, year: 1990 })),
        cpfContributionRate: safeGet(financialContextData, 'personalInfo.cpfContributionRate', 20),
        employerCpfContributionRate: safeGet(financialContextData, 'personalInfo.employerCpfContributionRate', 17),
        monthlyRepayment: safeGet(financialContextData, 'personalInfo.monthlyRepayment', 0)
      },
      financialInfo: {
        monthlyExpenses: safeGet(financialContextData, 'financialInfo.monthlyExpenses', 0),
        housingLoanRemaining: safeGet(financialContextData, 'financialInfo.housingLoanRemaining', 0),
        liquidCash: safeGet(financialContextData, 'financialInfo.liquidCash', 0),
        cpfOrdinaryAccount: safeGet(financialContextData, 'financialInfo.cpfOrdinaryAccount', 0),
        cpfSpecialAccount: safeGet(financialContextData, 'financialInfo.cpfSpecialAccount', 0),
        cpfMedisaveAccount: safeGet(financialContextData, 'financialInfo.cpfMedisaveAccount', 0)
      },
      expenseItems: safeGet(financialContextData, 'expenseItems', [])
    };
  }
};

/**
 * Calculate age from birthday object
 * @param {Object} birthday - Object with month and year properties
 * @returns {number} - Calculated age
 */
const calculateAgeFromBirthday = (birthday) => {
  if (!birthday || !birthday.year) return 35;
  
  const today = new Date();
  const birthMonth = birthday.month || 1;
  const birthYear = birthday.year;

  let age = today.getFullYear() - birthYear;

  // Adjust age if birthday hasn't occurred yet this year
  if (today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < 15)) {
    age--;
  }

  return age;
};