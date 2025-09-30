/**
 * Loan Calculation Utilities
 *
 * This module provides utilities for calculating loan payments, amortization schedules,
 * and analyzing loan scenarios for Singapore mortgages and personal loans.
 *
 * References:
 * - Singapore housing loan calculations (HDB, bank loans)
 * - Reducing balance method (standard in Singapore)
 */

/**
 * Calculate monthly loan payment using standard amortization formula
 * P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 *
 * @param {number} principal - Total loan amount
 * @param {number} annualInterestRate - Annual interest rate as percentage (e.g., 2.5 for 2.5%)
 * @param {number} loanTermYears - Loan term in years
 * @returns {number} Monthly payment amount
 */
export const calculateMonthlyPayment = (principal, annualInterestRate, loanTermYears) => {
  if (principal <= 0 || annualInterestRate < 0 || loanTermYears <= 0) {
    return 0;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Handle zero interest case
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  // Standard amortization formula
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(monthlyPayment * 100) / 100;
};

/**
 * Calculate interest and principal portions of a loan payment
 *
 * @param {number} remainingBalance - Current outstanding loan balance
 * @param {number} monthlyPayment - Fixed monthly payment amount
 * @param {number} annualInterestRate - Annual interest rate as percentage
 * @returns {Object} Object with interestPayment, principalPayment, and newBalance
 */
export const calculatePaymentBreakdown = (remainingBalance, monthlyPayment, annualInterestRate) => {
  if (remainingBalance <= 0) {
    return {
      interestPayment: 0,
      principalPayment: 0,
      newBalance: 0
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const interestPayment = remainingBalance * monthlyRate;
  const principalPayment = Math.min(
    Math.max(0, monthlyPayment - interestPayment),
    remainingBalance
  );
  const newBalance = Math.max(0, remainingBalance - principalPayment);

  return {
    interestPayment: Math.round(interestPayment * 100) / 100,
    principalPayment: Math.round(principalPayment * 100) / 100,
    newBalance: Math.round(newBalance * 100) / 100
  };
};

/**
 * Generate complete amortization schedule for a loan
 *
 * @param {number} principal - Total loan amount
 * @param {number} annualInterestRate - Annual interest rate as percentage
 * @param {number} loanTermYears - Loan term in years
 * @param {Date} startDate - Start date of the loan (optional)
 * @returns {Array} Array of payment objects with monthly breakdown
 */
export const generateAmortizationSchedule = (
  principal,
  annualInterestRate,
  loanTermYears,
  startDate = new Date()
) => {
  const schedule = [];
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, loanTermYears);
  let remainingBalance = principal;
  const numberOfPayments = loanTermYears * 12;

  for (let month = 1; month <= numberOfPayments; month++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month);

    const breakdown = calculatePaymentBreakdown(remainingBalance, monthlyPayment, annualInterestRate);

    schedule.push({
      month,
      date: paymentDate,
      payment: monthlyPayment,
      principal: breakdown.principalPayment,
      interest: breakdown.interestPayment,
      remainingBalance: breakdown.newBalance,
      cumulativeInterest: (schedule[month - 2]?.cumulativeInterest || 0) + breakdown.interestPayment,
      cumulativePrincipal: (schedule[month - 2]?.cumulativePrincipal || 0) + breakdown.principalPayment
    });

    remainingBalance = breakdown.newBalance;

    // Stop if loan is paid off early
    if (remainingBalance === 0) {
      break;
    }
  }

  return schedule;
};

/**
 * Calculate remaining loan term based on current balance and payment
 *
 * @param {number} remainingBalance - Current outstanding balance
 * @param {number} monthlyPayment - Monthly payment amount
 * @param {number} annualInterestRate - Annual interest rate as percentage
 * @returns {Object} Object with months, years, and formattedDuration
 */
export const calculateRemainingTerm = (remainingBalance, monthlyPayment, annualInterestRate) => {
  if (remainingBalance <= 0 || monthlyPayment <= 0) {
    return {
      months: 0,
      years: 0,
      formattedDuration: '0 months'
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;

  // Check if monthly payment is sufficient to cover interest
  const monthlyInterest = remainingBalance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return {
      months: Infinity,
      years: Infinity,
      formattedDuration: 'Never (payment insufficient)'
    };
  }

  // Calculate number of months using loan formula
  // n = -log(1 - (r * P / M)) / log(1 + r)
  // where P = principal, M = monthly payment, r = monthly rate
  const months = Math.ceil(
    -Math.log(1 - (monthlyRate * remainingBalance / monthlyPayment)) / Math.log(1 + monthlyRate)
  );

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let formattedDuration = '';
  if (years > 0) {
    formattedDuration += `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      formattedDuration += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  } else {
    formattedDuration = `${months} month${months > 1 ? 's' : ''}`;
  }

  return {
    months,
    years: parseFloat((months / 12).toFixed(2)),
    formattedDuration
  };
};

/**
 * Calculate total interest paid over the life of the loan
 *
 * @param {number} principal - Total loan amount
 * @param {number} annualInterestRate - Annual interest rate as percentage
 * @param {number} loanTermYears - Loan term in years
 * @returns {Object} Object with totalInterest, totalPayment, and interestRatio
 */
export const calculateTotalInterest = (principal, annualInterestRate, loanTermYears) => {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, loanTermYears);
  const totalPayment = monthlyPayment * loanTermYears * 12;
  const totalInterest = totalPayment - principal;
  const interestRatio = (totalInterest / principal) * 100;

  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    interestRatio: Math.round(interestRatio * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100
  };
};

/**
 * Calculate early payoff scenarios and savings
 *
 * @param {number} remainingBalance - Current outstanding balance
 * @param {number} monthlyPayment - Current monthly payment
 * @param {number} annualInterestRate - Annual interest rate as percentage
 * @param {number} extraPayment - Additional monthly payment amount
 * @returns {Object} Comparison between current and accelerated payoff
 */
export const calculateEarlyPayoff = (
  remainingBalance,
  monthlyPayment,
  annualInterestRate,
  extraPayment
) => {
  // Calculate current scenario
  const currentTerm = calculateRemainingTerm(remainingBalance, monthlyPayment, annualInterestRate);
  let currentInterest = 0;
  let balance = remainingBalance;

  for (let i = 0; i < currentTerm.months && balance > 0; i++) {
    const breakdown = calculatePaymentBreakdown(balance, monthlyPayment, annualInterestRate);
    currentInterest += breakdown.interestPayment;
    balance = breakdown.newBalance;
  }

  // Calculate accelerated scenario
  const acceleratedPayment = monthlyPayment + extraPayment;
  const acceleratedTerm = calculateRemainingTerm(
    remainingBalance,
    acceleratedPayment,
    annualInterestRate
  );
  let acceleratedInterest = 0;
  balance = remainingBalance;

  for (let i = 0; i < acceleratedTerm.months && balance > 0; i++) {
    const breakdown = calculatePaymentBreakdown(balance, acceleratedPayment, annualInterestRate);
    acceleratedInterest += breakdown.interestPayment;
    balance = breakdown.newBalance;
  }

  const interestSaved = currentInterest - acceleratedInterest;
  const timeSaved = currentTerm.months - acceleratedTerm.months;

  return {
    current: {
      months: currentTerm.months,
      years: currentTerm.years,
      totalInterest: Math.round(currentInterest * 100) / 100,
      duration: currentTerm.formattedDuration
    },
    accelerated: {
      months: acceleratedTerm.months,
      years: acceleratedTerm.years,
      totalInterest: Math.round(acceleratedInterest * 100) / 100,
      duration: acceleratedTerm.formattedDuration,
      monthlyPayment: acceleratedPayment
    },
    savings: {
      interestSaved: Math.round(interestSaved * 100) / 100,
      timeSavedMonths: timeSaved,
      timeSavedYears: parseFloat((timeSaved / 12).toFixed(2))
    }
  };
};

/**
 * Calculate loan refinancing analysis
 *
 * @param {number} remainingBalance - Current outstanding balance
 * @param {number} currentRate - Current annual interest rate as percentage
 * @param {number} remainingYears - Remaining years on current loan
 * @param {number} newRate - New annual interest rate as percentage
 * @param {number} refinancingCosts - One-time refinancing costs
 * @returns {Object} Comparison between keeping current loan and refinancing
 */
export const calculateRefinancing = (
  remainingBalance,
  currentRate,
  remainingYears,
  newRate,
  refinancingCosts = 0
) => {
  // Current loan scenario
  const currentPayment = calculateMonthlyPayment(remainingBalance, currentRate, remainingYears);
  const currentTotal = calculateTotalInterest(remainingBalance, currentRate, remainingYears);

  // Refinanced loan scenario
  const newPayment = calculateMonthlyPayment(remainingBalance, newRate, remainingYears);
  const newTotal = calculateTotalInterest(remainingBalance, newRate, remainingYears);
  const newTotalWithCosts = newTotal.totalPayment + refinancingCosts;

  const monthlySavings = currentPayment - newPayment;
  const totalSavings = currentTotal.totalPayment - newTotalWithCosts;
  const breakEvenMonths = refinancingCosts > 0 ? Math.ceil(refinancingCosts / monthlySavings) : 0;

  return {
    currentLoan: {
      monthlyPayment: currentPayment,
      totalPayment: currentTotal.totalPayment,
      totalInterest: currentTotal.totalInterest
    },
    refinancedLoan: {
      monthlyPayment: newPayment,
      totalPayment: newTotalWithCosts,
      totalInterest: newTotal.totalInterest,
      refinancingCosts
    },
    savings: {
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      breakEvenMonths,
      worthRefinancing: totalSavings > 0 && breakEvenMonths <= remainingYears * 12
    }
  };
};

/**
 * Calculate loan affordability based on income
 * Singapore banks typically use 30-40% of gross monthly income for mortgage calculations
 *
 * @param {number} monthlyIncome - Gross monthly income
 * @param {number} annualInterestRate - Expected annual interest rate as percentage
 * @param {number} loanTermYears - Desired loan term in years
 * @param {number} debtServiceRatio - Maximum debt service ratio (default 40%)
 * @returns {Object} Maximum affordable loan and monthly payment
 */
export const calculateAffordability = (
  monthlyIncome,
  annualInterestRate,
  loanTermYears,
  debtServiceRatio = 40
) => {
  const maxMonthlyPayment = (monthlyIncome * debtServiceRatio) / 100;

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Reverse calculation to find max principal
  // P = M[(1 + r)^n - 1] / [r(1 + r)^n]
  let maxLoanAmount = 0;
  if (monthlyRate === 0) {
    maxLoanAmount = maxMonthlyPayment * numberOfPayments;
  } else {
    maxLoanAmount =
      maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
  }

  return {
    maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
    maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
    debtServiceRatio,
    monthlyIncome
  };
};

/**
 * Calculate loan-to-value (LTV) ratio and related metrics
 * Important for Singapore property loans which have LTV limits
 *
 * @param {number} propertyValue - Total property value
 * @param {number} loanAmount - Loan amount requested
 * @param {number} downPayment - Down payment amount (optional)
 * @returns {Object} LTV ratio and breakdown
 */
export const calculateLTV = (propertyValue, loanAmount, downPayment = null) => {
  const calculatedDownPayment = downPayment !== null ? downPayment : propertyValue - loanAmount;
  const ltvRatio = (loanAmount / propertyValue) * 100;
  const downPaymentRatio = (calculatedDownPayment / propertyValue) * 100;

  return {
    ltvRatio: Math.round(ltvRatio * 100) / 100,
    downPaymentRatio: Math.round(downPaymentRatio * 100) / 100,
    loanAmount,
    downPayment: calculatedDownPayment,
    propertyValue
  };
};

/**
 * Validate loan parameters for common errors
 *
 * @param {Object} params - Loan parameters to validate
 * @returns {Object} Validation result with isValid and errors array
 */
export const validateLoanParameters = (params) => {
  const errors = [];
  const { principal, annualInterestRate, loanTermYears, monthlyPayment } = params;

  if (principal !== undefined && principal <= 0) {
    errors.push('Principal must be greater than 0');
  }

  if (annualInterestRate !== undefined && annualInterestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }

  if (loanTermYears !== undefined && loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (monthlyPayment !== undefined && monthlyPayment < 0) {
    errors.push('Monthly payment cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};