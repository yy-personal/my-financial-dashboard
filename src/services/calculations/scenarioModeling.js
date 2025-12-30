/**
 * Scenario Modeling and What-If Analysis Utilities
 *
 * This module provides utilities for financial scenario modeling,
 * what-if analyses, and risk assessments for personal finance planning.
 *
 * References:
 * - Financial planning best practices
 * - Singapore-specific scenarios (job loss, emergency fund, housing)
 * - Monte Carlo simulations for uncertainty
 */

import { calculateTieredCpfInterest } from './cpf/cpf-allocation';
import { calculateRealReturn } from './inflationCalculations';

/**
 * Helper: Calculate monthly mortgage payment
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment amount
 */
const calculateMonthlyMortgagePayment = (principal, annualRate, years) => {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment;
};

/**
 * Emergency Fund Adequacy Analysis
 *
 * @param {Object} financial Data - Current financial situation
 * @param {number} financialData.liquidCash - Available liquid cash
 * @param {number} financialData.monthlyExpenses - Monthly expenses
 * @param {number} financialData.monthlyIncome - Monthly income
 * @param {number} targetMonths - Target months of expenses (default 6)
 * @returns {Object} Emergency fund analysis
 */
export const analyzeEmergencyFund = (financialData, targetMonths = 6) => {
  const { liquidCash, monthlyExpenses, monthlyIncome = 0 } = financialData;

  const targetAmount = monthlyExpenses * targetMonths;
  const currentMonthsCovered = monthlyExpenses > 0 ? liquidCash / monthlyExpenses : 0;
  const shortfall = Math.max(0, targetAmount - liquidCash);
  const monthsToTarget = monthlyIncome > monthlyExpenses ?
    shortfall / (monthlyIncome - monthlyExpenses) : Infinity;

  const adequacyLevel =
    currentMonthsCovered >= 12 ? 'Excellent' :
    currentMonthsCovered >= 6 ? 'Adequate' :
    currentMonthsCovered >= 3 ? 'Fair' : 'Insufficient';

  return {
    currentEmergencyFund: Math.round(liquidCash * 100) / 100,
    targetEmergencyFund: Math.round(targetAmount * 100) / 100,
    monthsCovered: Math.round(currentMonthsCovered * 10) / 10,
    targetMonths,
    shortfall: Math.round(shortfall * 100) / 100,
    monthsToReachTarget: monthsToTarget === Infinity ? 'Cannot reach with current savings rate' :
      Math.round(monthsToTarget * 10) / 10,
    adequacyLevel,
    isAdequate: currentMonthsCovered >= targetMonths,
    recommendation: currentMonthsCovered < targetMonths ?
      `Build up ${Math.round(shortfall)} to reach ${targetMonths}-month emergency fund` :
      'Emergency fund is adequate'
  };
};

/**
 * Job Loss Impact Scenario
 *
 * @param {Object} financialData - Current financial situation
 * @param {number} unemploymentMonths - Expected months of unemployment
 * @param {number} severancePayment - One-time severance payment (optional)
 * @returns {Object} Job loss impact analysis
 */
export const simulateJobLoss = (financialData, unemploymentMonths, severancePayment = 0) => {
  const {
    liquidCash,
    monthlyExpenses,
    cpfBalance = 0
  } = financialData;

  const totalMonthlyBurn = monthlyExpenses;
  const totalFundsAvailable = liquidCash + severancePayment;
  const totalExpectedExpenses = totalMonthlyBurn * unemploymentMonths;

  const cashAfterUnemployment = totalFundsAvailable - totalExpectedExpenses;
  const monthsUntilBroke = totalMonthlyBurn > 0 ? totalFundsAvailable / totalMonthlyBurn : Infinity;

  const needsEmergencyAction = monthsUntilBroke < unemploymentMonths;

  // Calculate CPF OA withdrawal option (if age >= 55)
  const cpfAvailable = cpfBalance * 0.6; // Assume 60% in OA/SA accessible

  return {
    scenario: {
      unemploymentMonths,
      severancePayment: Math.round(severancePayment * 100) / 100,
      monthlyBurnRate: Math.round(totalMonthlyBurn * 100) / 100
    },
    analysis: {
      currentLiquidCash: Math.round(liquidCash * 100) / 100,
      totalFundsAvailable: Math.round(totalFundsAvailable * 100) / 100,
      totalExpectedExpenses: Math.round(totalExpectedExpenses * 100) / 100,
      cashAfterUnemployment: Math.round(cashAfterUnemployment * 100) / 100,
      monthsUntilBroke: monthsUntilBroke === Infinity ? 'More than projection period' :
        Math.round(monthsUntilBroke * 10) / 10,
      needsEmergencyAction,
      cpfFallback: Math.round(cpfAvailable * 100) / 100
    },
    recommendations: needsEmergencyAction ? [
      'Reduce non-essential expenses immediately',
      'Consider part-time or freelance work',
      'Access insurance claims if applicable',
      'Review unemployment benefits eligibility'
    ] : [
      'Current emergency fund is adequate',
      'Continue building emergency reserves',
      'Review insurance coverage'
    ]
  };
};

/**
 * Housing Affordability Scenario
 *
 * @param {Object} housingParams - Housing purchase parameters
 * @param {Object} financialData - Current financial situation
 * @returns {Object} Housing affordability analysis
 */
export const analyzeHousingAffordability = (housingParams, financialData) => {
  const {
    propertyPrice,
    downPaymentPercentage = 25,
    loanTermYears = 25,
    interestRate = 2.6
  } = housingParams;

  const {
    monthlyIncome,
    monthlyExpenses,
    liquidCash,
    cpfBalance = 0
  } = financialData;

  const downPayment = propertyPrice * (downPaymentPercentage / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyLoanPayment = calculateMonthlyMortgagePayment(loanAmount, interestRate, loanTermYears);

  // Total Debt Servicing Ratio (TDSR) - max 55% in Singapore
  const tdsr = ((monthlyLoanPayment) / monthlyIncome) * 100;
  const passesTDSR = tdsr <= 55;

  // Mortgage Servicing Ratio (MSR) - max 30% for HDB/EC
  const msr = (monthlyLoanPayment / monthlyIncome) * 100;
  const passesMSR = msr <= 30;

  // Check if can afford down payment
  const cpfOAAvailable = cpfBalance * 0.6; // Assume 60% in OA
  const totalFundsForDownPayment = liquidCash + cpfOAAvailable;
  const canAffordDownPayment = totalFundsForDownPayment >= downPayment;

  // Cash flow after purchase
  const monthlyNetCashFlow = monthlyIncome - monthlyExpenses - monthlyLoanPayment;
  const annualNetCashFlow = monthlyNetCashFlow * 12;

  // Stamp duty and other costs (rough estimate)
  const buyerStampDuty = propertyPrice * 0.03; // Simplified 3%
  const additionalCosts = propertyPrice * 0.05; // Legal, valuation, etc.
  const totalUpfrontCosts = downPayment + buyerStampDuty + additionalCosts;

  return {
    property: {
      price: Math.round(propertyPrice * 100) / 100,
      downPayment: Math.round(downPayment * 100) / 100,
      downPaymentPercentage,
      loanAmount: Math.round(loanAmount * 100) / 100,
      loanTermYears,
      interestRate
    },
    monthlyPayment: Math.round(monthlyLoanPayment * 100) / 100,
    affordability: {
      tdsr: Math.round(tdsr * 100) / 100,
      passesTDSR,
      msr: Math.round(msr * 100) / 100,
      passesMSR,
      canAffordDownPayment,
      monthlyNetCashFlow: Math.round(monthlyNetCashFlow * 100) / 100,
      annualNetCashFlow: Math.round(annualNetCashFlow * 100) / 100
    },
    upfrontCosts: {
      downPayment: Math.round(downPayment * 100) / 100,
      stampDuty: Math.round(buyerStampDuty * 100) / 100,
      additionalCosts: Math.round(additionalCosts * 100) / 100,
      total: Math.round(totalUpfrontCosts * 100) / 100,
      availableFunds: Math.round(totalFundsForDownPayment * 100) / 100,
      shortfall: Math.max(0, totalUpfrontCosts - totalFundsForDownPayment)
    },
    verdict: passesTDSR && passesMSR && canAffordDownPayment && monthlyNetCashFlow > 0 ?
      'Affordable' : 'Not Affordable',
    recommendations: passesTDSR && passesMSR && canAffordDownPayment ?
      ['Property is within affordability range'] :
      [
        !passesTDSR ? `TDSR is ${Math.round(tdsr)}%, exceeds 55% limit` : null,
        !passesMSR ? `MSR is ${Math.round(msr)}%, exceeds 30% limit` : null,
        !canAffordDownPayment ? 'Insufficient funds for down payment' : null,
        monthlyNetCashFlow < 0 ? 'Negative monthly cash flow after purchase' : null
      ].filter(Boolean)
  };
};

/**
 * Retirement Readiness Scenario
 *
 * @param {Object} currentData - Current financial data
 * @param {number} retirementAge - Target retirement age
 * @param {number} currentAge - Current age
 * @param {number} desiredMonthlyIncome - Desired monthly retirement income
 * @returns {Object} Retirement readiness analysis
 */
export const analyzeRetirementReadiness = (
  currentData,
  retirementAge,
  currentAge,
  desiredMonthlyIncome
) => {
  const {
    liquidCash = 0,
    cpfBalance = 0,
    monthlyIncome = 0,
    monthlySavings = 0
  } = currentData;

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = 85 - retirementAge; // Assume live till 85

  // Current retirement corpus
  const currentCorpus = liquidCash + cpfBalance;

  // Projected retirement corpus (simple calculation)
  const assumedReturnRate = 0.04; // 4% return
  const futureValueCurrent = currentCorpus * Math.pow(1 + assumedReturnRate, yearsToRetirement);

  // Future value of monthly savings
  const monthlyRate = Math.pow(1 + assumedReturnRate, 1/12) - 1;
  const periodsToRetirement = yearsToRetirement * 12;
  const futureValueSavings = monthlySavings *
    ((Math.pow(1 + monthlyRate, periodsToRetirement) - 1) / monthlyRate);

  const projectedCorpus = futureValueCurrent + futureValueSavings;

  // Required corpus using 4% withdrawal rate
  const annualRetirementIncome = desiredMonthlyIncome * 12;
  const requiredCorpus = annualRetirementIncome / 0.04;

  const shortfall = Math.max(0, requiredCorpus - projectedCorpus);
  const surplusDeficit = projectedCorpus - requiredCorpus;

  // Calculate required additional monthly savings
  let additionalMonthlySavings = 0;
  if (shortfall > 0 && yearsToRetirement > 0) {
    additionalMonthlySavings =
      (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, periodsToRetirement) - 1);
  }

  const adequacyRatio = (projectedCorpus / requiredCorpus) * 100;
  const readinessLevel =
    adequacyRatio >= 100 ? 'On Track' :
    adequacyRatio >= 75 ? 'Needs Improvement' : 'Significant Gap';

  return {
    current: {
      age: currentAge,
      corpus: Math.round(currentCorpus * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100
    },
    retirement: {
      targetAge: retirementAge,
      yearsToRetirement,
      yearsInRetirement,
      desiredMonthlyIncome: Math.round(desiredMonthlyIncome * 100) / 100,
      desiredAnnualIncome: Math.round(annualRetirementIncome * 100) / 100
    },
    projection: {
      projectedCorpus: Math.round(projectedCorpus * 100) / 100,
      requiredCorpus: Math.round(requiredCorpus * 100) / 100,
      shortfall: Math.round(shortfall * 100) / 100,
      surplusDeficit: Math.round(surplusDeficit * 100) / 100,
      adequacyRatio: Math.round(adequacyRatio * 100) / 100,
      readinessLevel
    },
    recommendation: {
      additionalMonthlySavings: Math.round(Math.max(0, additionalMonthlySavings) * 100) / 100,
      totalMonthlySavingsNeeded: Math.round((monthlySavings + additionalMonthlySavings) * 100) / 100,
      message: adequacyRatio >= 100 ?
        'You are on track for retirement' :
        `You need to save an additional $${Math.round(additionalMonthlySavings)} per month`
    }
  };
};

/**
 * Salary Increase Impact Scenario
 *
 * @param {Object} currentData - Current financial data
 * @param {number} salaryIncreasePercentage - Salary increase as percentage
 * @param {number} years - Years to project
 * @returns {Object} Impact analysis
 */
export const simulateSalaryIncrease = (currentData, salaryIncreasePercentage, years = 10) => {
  const {
    currentSalary,
    monthlyExpenses,
    monthlySavings = 0
  } = currentData;

  const newSalary = currentSalary * (1 + salaryIncreasePercentage / 100);
  const additionalIncome = newSalary - currentSalary;

  // Assume 50% of additional income goes to savings, 50% to lifestyle
  const lifestyleInflation = additionalIncome * 0.5;
  const additionalSavings = additionalIncome * 0.5;

  const newMonthlyExpenses = monthlyExpenses + lifestyleInflation;
  const newMonthlySavings = monthlySavings + additionalSavings;

  // Project savings growth over years
  const currentSavingsRate = 0.04;
  const monthlyRate = Math.pow(1 + currentSavingsRate, 1/12) - 1;
  const periods = years * 12;

  const oldScenarioFV = monthlySavings *
    ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);

  const newScenarioFV = newMonthlySavings *
    ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);

  const additionalWealth = newScenarioFV - oldScenarioFV;

  return {
    current: {
      salary: Math.round(currentSalary * 100) / 100,
      expenses: Math.round(monthlyExpenses * 100) / 100,
      savings: Math.round(monthlySavings * 100) / 100,
      savingsRate: monthlySavings > 0 ? Math.round((monthlySavings / currentSalary) * 10000) / 100 : 0
    },
    new: {
      salary: Math.round(newSalary * 100) / 100,
      expenses: Math.round(newMonthlyExpenses * 100) / 100,
      savings: Math.round(newMonthlySavings * 100) / 100,
      savingsRate: Math.round((newMonthlySavings / newSalary) * 10000) / 100,
      additionalIncome: Math.round(additionalIncome * 100) / 100
    },
    longTermImpact: {
      years,
      oldScenarioWealth: Math.round(oldScenarioFV * 100) / 100,
      newScenarioWealth: Math.round(newScenarioFV * 100) / 100,
      additionalWealth: Math.round(additionalWealth * 100) / 100,
      wealthMultiplier: oldScenarioFV > 0 ? Math.round((newScenarioFV / oldScenarioFV) * 100) / 100 : 0
    }
  };
};

/**
 * Career Break Impact Scenario
 *
 * @param {Object} currentData - Current financial data
 * @param {number} breakMonths - Length of career break in months
 * @param {number} monthlyExpensesDuringBreak - Expenses during break period
 * @returns {Object} Career break impact analysis
 */
export const simulateCareerBreak = (currentData, breakMonths, monthlyExpensesDuringBreak) => {
  const {
    liquidCash,
    currentSalary = 0,
    cpfBalance = 0
  } = currentData;

  const totalExpensesDuringBreak = monthlyExpensesDuringBreak * breakMonths;
  const lostIncome = currentSalary * breakMonths;
  const lostCpfContributions = currentSalary * 0.37 * breakMonths; // 37% total CPF

  const cashAfterBreak = liquidCash - totalExpensesDuringBreak;
  const canAffordBreak = cashAfterBreak >= 0;

  // Opportunity cost
  const assumedInvestmentReturn = 0.04;
  const monthlyRate = Math.pow(1 + assumedInvestmentReturn, 1/12) - 1;
  const opportunityCostInvestment = lostIncome * ((Math.pow(1 + monthlyRate, breakMonths) - 1) / monthlyRate);

  return {
    careerBreak: {
      durationMonths: breakMonths,
      monthlyExpenses: Math.round(monthlyExpensesDuringBreak * 100) / 100,
      totalExpenses: Math.round(totalExpensesDuringBreak * 100) / 100
    },
    impact: {
      currentCash: Math.round(liquidCash * 100) / 100,
      cashAfterBreak: Math.round(cashAfterBreak * 100) / 100,
      lostIncome: Math.round(lostIncome * 100) / 100,
      lostCpfContributions: Math.round(lostCpfContributions * 100) / 100,
      opportunityCost: Math.round(opportunityCostInvestment * 100) / 100,
      totalImpact: Math.round((totalExpensesDuringBreak + lostIncome + lostCpfContributions) * 100) / 100
    },
    feasibility: {
      canAffordBreak,
      cashBuffer: canAffordBreak ? Math.round(cashAfterBreak * 100) / 100 : 0,
      monthsOfBufferRemaining: canAffordBreak && monthlyExpensesDuringBreak > 0 ?
        Math.round((cashAfterBreak / monthlyExpensesDuringBreak) * 10) / 10 : 0,
      recommendation: canAffordBreak ?
        'Career break is financially feasible' :
        `Need additional ${Math.round(Math.abs(cashAfterBreak))} to afford career break`
    }
  };
};

/**
 * Compare multiple financial scenarios
 *
 * @param {Array} scenarios - Array of scenario objects
 * @returns {Object} Scenario comparison
 */
export const compareScenarios = (scenarios) => {
  const comparison = scenarios.map((scenario, index) => {
    const {
      name,
      monthlyIncome = 0,
      monthlyExpenses = 0,
      monthlySavings = 0,
      projectionYears = 10
    } = scenario;

    const annualSavings = monthlySavings * 12;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Project 10 years
    const assumedReturn = 0.04;
    const monthlyRate = Math.pow(1 + assumedReturn, 1/12) - 1;
    const periods = projectionYears * 12;
    const futureValue = monthlySavings *
      ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);

    return {
      name: name || `Scenario ${index + 1}`,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      projectedWealth10Years: Math.round(futureValue * 100) / 100
    };
  });

  // Rank scenarios by savings rate
  const ranked = [...comparison].sort((a, b) => b.savingsRate - a.savingsRate);

  return {
    scenarios: comparison,
    bestScenario: ranked[0],
    comparison: {
      highestSavingsRate: ranked[0].savingsRate,
      lowestSavingsRate: ranked[ranked.length - 1].savingsRate,
      wealthGapIn10Years: Math.round((ranked[0].projectedWealth10Years -
        ranked[ranked.length - 1].projectedWealth10Years) * 100) / 100
    }
  };
};