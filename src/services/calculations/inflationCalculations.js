/**
 * Inflation and Purchasing Power Calculation Utilities
 *
 * This module provides utilities for calculating inflation-adjusted values,
 * real vs nominal returns, and purchasing power analysis for Singapore context.
 *
 * References:
 * - Singapore CPI and inflation data from MAS/DOS
 * - Real return calculations
 * - Purchasing power parity adjustments
 */

/**
 * Singapore typical inflation rates by category (2020-2025 average)
 */
export const SINGAPORE_INFLATION_RATES = {
  OVERALL: 0.023, // 2.3% overall CPI
  HOUSING: 0.028, // 2.8%
  HEALTHCARE: 0.032, // 3.2%
  EDUCATION: 0.035, // 3.5%
  TRANSPORT: 0.025, // 2.5%
  FOOD: 0.030, // 3.0%
  UTILITIES: 0.020 // 2.0%
};

/**
 * Calculate future value adjusted for inflation
 *
 * @param {number} currentValue - Current value in today's dollars
 * @param {number} inflationRate - Annual inflation rate as percentage
 * @param {number} years - Number of years in the future
 * @returns {Object} Future nominal and real value breakdown
 */
export const calculateInflationAdjusted = (currentValue, inflationRate, years) => {
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, years);
  const futureNominalValue = currentValue * inflationMultiplier;

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    futureNominalValue: Math.round(futureNominalValue * 100) / 100,
    inflationRate,
    years,
    totalInflation: Math.round((inflationMultiplier - 1) * 10000) / 100,
    purchasingPowerLoss: Math.round(((1 - 1 / inflationMultiplier) * 100) * 100) / 100
  };
};

/**
 * Calculate present value from future value (inflation discounting)
 *
 * @param {number} futureValue - Future value in nominal terms
 * @param {number} inflationRate - Annual inflation rate as percentage
 * @param {number} years - Number of years
 * @returns {Object} Present value and purchasing power analysis
 */
export const calculatePresentValue = (futureValue, inflationRate, years) => {
  const discountFactor = Math.pow(1 + inflationRate / 100, years);
  const presentValue = futureValue / discountFactor;

  return {
    futureValue: Math.round(futureValue * 100) / 100,
    presentValue: Math.round(presentValue * 100) / 100,
    inflationRate,
    years,
    purchasingPowerIn2024Dollars: Math.round(presentValue * 100) / 100
  };
};

/**
 * Calculate real return (inflation-adjusted return)
 *
 * @param {number} nominalReturn - Nominal return rate as percentage
 * @param {number} inflationRate - Inflation rate as percentage
 * @returns {Object} Real return and Fisher equation breakdown
 */
export const calculateRealReturn = (nominalReturn, inflationRate) => {
  // Fisher equation: (1 + real) = (1 + nominal) / (1 + inflation)
  const realReturn = ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;

  // Simplified approximation
  const approximateRealReturn = nominalReturn - inflationRate;

  return {
    nominalReturn: Math.round(nominalReturn * 100) / 100,
    inflationRate: Math.round(inflationRate * 100) / 100,
    realReturn: Math.round(realReturn * 100) / 100,
    approximateRealReturn: Math.round(approximateRealReturn * 100) / 100,
    difference: Math.round((realReturn - approximateRealReturn) * 100) / 100
  };
};

/**
 * Project purchasing power over time
 *
 * @param {number} initialAmount - Initial amount
 * @param {number} inflationRate - Annual inflation rate as percentage
 * @param {number} years - Number of years to project
 * @returns {Array} Yearly purchasing power projections
 */
export const projectPurchasingPower = (initialAmount, inflationRate, years) => {
  const projections = [];
  let currentPurchasingPower = initialAmount;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      currentPurchasingPower = currentPurchasingPower / (1 + inflationRate / 100);
    }

    const nominalValue = initialAmount * Math.pow(1 + inflationRate / 100, year);
    const purchasingPowerLoss = ((initialAmount - currentPurchasingPower) / initialAmount) * 100;

    projections.push({
      year,
      nominalValue: Math.round(nominalValue * 100) / 100,
      realValue: Math.round(currentPurchasingPower * 100) / 100,
      purchasingPowerLoss: Math.round(purchasingPowerLoss * 100) / 100,
      equivalentToday: Math.round(currentPurchasingPower * 100) / 100
    });
  }

  return projections;
};

/**
 * Calculate inflation-adjusted retirement needs
 *
 * @param {number} currentMonthlyExpenses - Current monthly expenses
 * @param {number} yearsUntilRetirement - Years until retirement
 * @param {number} yearsInRetirement - Years in retirement (default 30)
 * @param {number} inflationRate - Expected inflation rate as percentage (default 2.3%)
 * @returns {Object} Retirement needs adjusted for inflation
 */
export const calculateInflationAdjustedRetirement = (
  currentMonthlyExpenses,
  yearsUntilRetirement,
  yearsInRetirement = 30,
  inflationRate = 2.3
) => {
  // Calculate future monthly expenses at retirement
  const futureMonthlyExpenses = currentMonthlyExpenses * Math.pow(1 + inflationRate / 100, yearsUntilRetirement);

  // Calculate total needed for retirement (simple calculation)
  const totalYearsExpenses = futureMonthlyExpenses * 12 * yearsInRetirement;

  // More sophisticated: present value of annuity with inflation
  const realDiscountRate = 0.04; // Assume 4% real return during retirement
  const presentValueOfRetirement =
    (futureMonthlyExpenses * 12) *
    ((1 - Math.pow(1 + realDiscountRate, -yearsInRetirement)) / realDiscountRate);

  return {
    currentMonthlyExpenses: Math.round(currentMonthlyExpenses * 100) / 100,
    currentAnnualExpenses: Math.round(currentMonthlyExpenses * 12 * 100) / 100,
    futureMonthlyExpenses: Math.round(futureMonthlyExpenses * 100) / 100,
    futureAnnualExpenses: Math.round(futureMonthlyExpenses * 12 * 100) / 100,
    yearsUntilRetirement,
    yearsInRetirement,
    inflationRate,
    totalRetirementNeed: Math.round(totalYearsExpenses * 100) / 100,
    presentValueRetirementNeed: Math.round(presentValueOfRetirement * 100) / 100,
    inflationImpact: Math.round((futureMonthlyExpenses - currentMonthlyExpenses) * 100) / 100
  };
};

/**
 * Calculate real vs nominal investment growth
 *
 * @param {number} principal - Initial investment
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} nominalReturn - Nominal annual return as percentage
 * @param {number} inflationRate - Inflation rate as percentage
 * @param {number} years - Investment period in years
 * @returns {Object} Nominal and real growth comparison
 */
export const calculateRealVsNominalGrowth = (
  principal,
  monthlyContribution,
  nominalReturn,
  inflationRate,
  years
) => {
  const realReturn = calculateRealReturn(nominalReturn, inflationRate).realReturn;
  const monthlyNominalRate = Math.pow(1 + nominalReturn / 100, 1 / 12) - 1;
  const monthlyRealRate = Math.pow(1 + realReturn / 100, 1 / 12) - 1;
  const periods = years * 12;

  // Nominal growth
  const nominalPrincipalGrowth = principal * Math.pow(1 + monthlyNominalRate, periods);
  const nominalContributionGrowth =
    monthlyContribution * ((Math.pow(1 + monthlyNominalRate, periods) - 1) / monthlyNominalRate);
  const nominalTotal = nominalPrincipalGrowth + nominalContributionGrowth;

  // Real growth (purchasing power)
  const realPrincipalGrowth = principal * Math.pow(1 + monthlyRealRate, periods);
  const realContributionGrowth =
    monthlyContribution * ((Math.pow(1 + monthlyRealRate, periods) - 1) / monthlyRealRate);
  const realTotal = realPrincipalGrowth + realContributionGrowth;

  const totalContributions = principal + monthlyContribution * periods;
  const nominalReturns = nominalTotal - totalContributions;
  const realReturns = realTotal - totalContributions;

  return {
    nominal: {
      finalValue: Math.round(nominalTotal * 100) / 100,
      returns: Math.round(nominalReturns * 100) / 100,
      returnRate: nominalReturn
    },
    real: {
      finalValue: Math.round(realTotal * 100) / 100,
      returns: Math.round(realReturns * 100) / 100,
      returnRate: Math.round(realReturn * 100) / 100,
      purchasingPowerInTodaysDollars: Math.round(realTotal * 100) / 100
    },
    comparison: {
      inflationImpact: Math.round((nominalTotal - realTotal) * 100) / 100,
      purchasingPowerLoss: Math.round(((nominalTotal - realTotal) / nominalTotal) * 10000) / 100,
      realValueOfNominal: Math.round(realTotal * 100) / 100
    },
    totalContributions: Math.round(totalContributions * 100) / 100,
    years
  };
};

/**
 * Calculate inflation-adjusted milestones
 *
 * @param {Array} milestones - Array of milestone objects {name, targetAmount, yearsFromNow}
 * @param {number} inflationRate - Expected inflation rate as percentage
 * @returns {Array} Milestones with inflation-adjusted targets
 */
export const adjustMilestonesForInflation = (milestones, inflationRate) => {
  return milestones.map((milestone) => {
    const inflationMultiplier = Math.pow(1 + inflationRate / 100, milestone.yearsFromNow);
    const inflationAdjustedTarget = milestone.targetAmount * inflationMultiplier;
    const additionalNeeded = inflationAdjustedTarget - milestone.targetAmount;

    return {
      name: milestone.name,
      originalTarget: Math.round(milestone.targetAmount * 100) / 100,
      yearsFromNow: milestone.yearsFromNow,
      inflationRate,
      inflationAdjustedTarget: Math.round(inflationAdjustedTarget * 100) / 100,
      additionalNeeded: Math.round(additionalNeeded * 100) / 100,
      inflationImpactPercentage: Math.round(((inflationMultiplier - 1) * 100) * 100) / 100
    };
  });
};

/**
 * Calculate cost of living increase over time
 *
 * @param {Object} expenses - Object with expense categories and amounts
 * @param {Object} inflationRates - Object with inflation rates per category (optional)
 * @param {number} years - Number of years to project
 * @returns {Object} Projected cost of living increases
 */
export const projectCostOfLiving = (expenses, inflationRates = {}, years) => {
  const projections = [];
  const categories = Object.keys(expenses);

  for (let year = 0; year <= years; year++) {
    const yearProjection = { year };
    let totalExpenses = 0;

    categories.forEach((category) => {
      const currentAmount = expenses[category];
      const categoryInflation = inflationRates[category] || SINGAPORE_INFLATION_RATES.OVERALL;
      const futureAmount = currentAmount * Math.pow(1 + categoryInflation, year);

      yearProjection[category] = Math.round(futureAmount * 100) / 100;
      totalExpenses += futureAmount;
    });

    yearProjection.total = Math.round(totalExpenses * 100) / 100;
    projections.push(yearProjection);
  }

  const initialTotal = projections[0].total;
  const finalTotal = projections[years].total;
  const totalIncrease = finalTotal - initialTotal;
  const percentageIncrease = (totalIncrease / initialTotal) * 100;

  return {
    projections,
    summary: {
      initialTotal: Math.round(initialTotal * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      totalIncrease: Math.round(totalIncrease * 100) / 100,
      percentageIncrease: Math.round(percentageIncrease * 100) / 100,
      years
    }
  };
};

/**
 * Calculate salary needed to maintain purchasing power
 *
 * @param {number} currentSalary - Current salary
 * @param {number} years - Number of years from now
 * @param {number} inflationRate - Expected inflation rate as percentage
 * @returns {Object} Required salary adjustments
 */
export const calculateSalaryForPurchasingPower = (currentSalary, years, inflationRate) => {
  const requiredSalary = currentSalary * Math.pow(1 + inflationRate / 100, years);
  const totalIncrease = requiredSalary - currentSalary;
  const annualRaise = ((Math.pow(requiredSalary / currentSalary, 1 / years) - 1) * 100);

  return {
    currentSalary: Math.round(currentSalary * 100) / 100,
    requiredSalary: Math.round(requiredSalary * 100) / 100,
    totalIncrease: Math.round(totalIncrease * 100) / 100,
    annualRaiseNeeded: Math.round(annualRaise * 100) / 100,
    years,
    inflationRate
  };
};

/**
 * Compare inflation impact across different asset classes
 *
 * @param {number} amount - Initial amount
 * @param {number} years - Number of years
 * @param {number} inflationRate - Inflation rate as percentage
 * @returns {Object} Comparison of inflation impact on different holdings
 */
export const compareInflationImpactByAsset = (amount, years, inflationRate) => {
  const cash = {
    name: 'Cash (0% return)',
    nominalValue: amount,
    realValue: amount / Math.pow(1 + inflationRate / 100, years),
    returnRate: 0
  };

  const cpfOA = {
    name: 'CPF OA (2.5% return)',
    nominalValue: amount * Math.pow(1.025, years),
    realValue: (amount * Math.pow(1.025, years)) / Math.pow(1 + inflationRate / 100, years),
    returnRate: 2.5
  };

  const cpfSA = {
    name: 'CPF SA (4% return)',
    nominalValue: amount * Math.pow(1.04, years),
    realValue: (amount * Math.pow(1.04, years)) / Math.pow(1 + inflationRate / 100, years),
    returnRate: 4
  };

  const equities = {
    name: 'Equities (7% return)',
    nominalValue: amount * Math.pow(1.07, years),
    realValue: (amount * Math.pow(1.07, years)) / Math.pow(1 + inflationRate / 100, years),
    returnRate: 7
  };

  const assets = [cash, cpfOA, cpfSA, equities];

  return {
    inflationRate,
    years,
    assets: assets.map(asset => ({
      ...asset,
      nominalValue: Math.round(asset.nominalValue * 100) / 100,
      realValue: Math.round(asset.realValue * 100) / 100,
      nominalGain: Math.round((asset.nominalValue - amount) * 100) / 100,
      realGain: Math.round((asset.realValue - amount) * 100) / 100,
      purchasingPowerMultiple: Math.round((asset.realValue / amount) * 100) / 100,
      beatsInflation: asset.realValue > amount
    }))
  };
};