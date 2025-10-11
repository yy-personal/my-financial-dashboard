/**
 * Investment Calculation Utilities
 *
 * This module provides utilities for investment projections, portfolio allocation,
 * risk-adjusted returns, and dollar-cost averaging calculations.
 *
 * References:
 * - Modern Portfolio Theory
 * - Singapore investment landscape (CPF, bonds, equities, REITs)
 * - Risk-adjusted performance metrics (Sharpe ratio, volatility)
 *
 * Performance Optimizations:
 * - Memoization cache for frequently called calculations
 * - Input validation for robustness
 */

// Memoization cache for compound growth calculations (max 100 entries)
const compoundGrowthCache = new Map();
const CACHE_MAX_SIZE = 100;

// Helper function to create cache key
const createCacheKey = (...args) => {
  return args.map(arg => {
    if (typeof arg === 'number') return arg.toFixed(4);
    return String(arg);
  }).join('|');
};

// Helper function to manage cache size
const manageCacheSize = (cache) => {
  if (cache.size >= CACHE_MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
};

/**
 * Asset class definitions with typical Singapore market characteristics
 */
export const ASSET_CLASSES = {
  CASH: {
    name: 'Cash/Savings',
    expectedReturn: 0.015, // 1.5% (savings account)
    volatility: 0,
    liquidity: 'High'
  },
  SINGAPORE_BONDS: {
    name: 'Singapore Government Bonds (SGS)',
    expectedReturn: 0.03, // 3%
    volatility: 0.03,
    liquidity: 'High'
  },
  CPF_OA: {
    name: 'CPF Ordinary Account',
    expectedReturn: 0.025, // 2.5% guaranteed
    volatility: 0,
    liquidity: 'Low'
  },
  CPF_SA: {
    name: 'CPF Special Account',
    expectedReturn: 0.04, // 4% guaranteed (up to 6% with extra interest)
    volatility: 0,
    liquidity: 'Low'
  },
  SINGAPORE_EQUITIES: {
    name: 'Singapore Stocks (STI)',
    expectedReturn: 0.07, // 7% historical
    volatility: 0.18,
    liquidity: 'High'
  },
  GLOBAL_EQUITIES: {
    name: 'Global Stocks',
    expectedReturn: 0.08, // 8% historical
    volatility: 0.20,
    liquidity: 'High'
  },
  SINGAPORE_REITS: {
    name: 'Singapore REITs',
    expectedReturn: 0.06, // 6% (dividends + growth)
    volatility: 0.15,
    liquidity: 'Medium'
  },
  ROBO_ADVISOR: {
    name: 'Robo-Advisor Portfolio',
    expectedReturn: 0.055, // 5.5% (balanced)
    volatility: 0.10,
    liquidity: 'Medium'
  }
};

/**
 * Calculate compound interest with periodic contributions (with memoization)
 *
 * @param {number} principal - Initial investment amount
 * @param {number} monthlyContribution - Monthly contribution amount
 * @param {number} annualReturnRate - Annual return rate as decimal (e.g., 0.08 for 8%)
 * @param {number} years - Investment period in years
 * @param {number} compoundingFrequency - Times compounded per year (default 12 for monthly)
 * @returns {Object} Investment growth breakdown
 */
export const calculateCompoundGrowth = (
  principal,
  monthlyContribution,
  annualReturnRate,
  years,
  compoundingFrequency = 12
) => {
  // Input validation
  if (principal < 0 || monthlyContribution < 0 || years <= 0) {
    return {
      finalValue: 0,
      totalContributions: 0,
      totalReturns: 0,
      principalGrowth: 0,
      contributionsGrowth: 0,
      returnRate: 0,
      years: 0
    };
  }

  // Check cache for memoized result
  const cacheKey = createCacheKey(principal, monthlyContribution, annualReturnRate, years, compoundingFrequency);
  if (compoundGrowthCache.has(cacheKey)) {
    return compoundGrowthCache.get(cacheKey);
  }

  const periods = years * compoundingFrequency;
  const ratePerPeriod = annualReturnRate / compoundingFrequency;

  let principalGrowth, contributionsGrowth;

  // Handle zero return rate separately to avoid division by zero
  if (ratePerPeriod === 0) {
    principalGrowth = principal;
    contributionsGrowth = monthlyContribution * periods;
  } else {
    // Future value of initial principal
    principalGrowth = principal * Math.pow(1 + ratePerPeriod, periods);

    // Future value of monthly contributions (annuity)
    contributionsGrowth =
      monthlyContribution *
      ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod);
  }

  const totalValue = principalGrowth + contributionsGrowth;
  const totalContributions = principal + monthlyContribution * periods;
  const totalReturns = totalValue - totalContributions;

  const result = {
    finalValue: Math.round(totalValue * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalReturns: Math.round(totalReturns * 100) / 100,
    principalGrowth: Math.round(principalGrowth * 100) / 100,
    contributionsGrowth: Math.round(contributionsGrowth * 100) / 100,
    returnRate: annualReturnRate * 100,
    years
  };

  // Store in cache
  manageCacheSize(compoundGrowthCache);
  compoundGrowthCache.set(cacheKey, result);

  return result;
};

/**
 * Calculate portfolio expected return and volatility using Modern Portfolio Theory
 *
 * @param {Array} allocations - Array of {assetClass, percentage} objects
 * @returns {Object} Portfolio metrics
 */
export const calculatePortfolioMetrics = (allocations) => {
  // Input validation
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return {
      expectedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      riskLevel: 'N/A'
    };
  }

  let expectedReturn = 0;
  let portfolioVariance = 0;

  // Calculate weighted expected return
  allocations.forEach((allocation) => {
    const asset = ASSET_CLASSES[allocation.assetClass];
    if (asset && typeof allocation.percentage === 'number') {
      expectedReturn += asset.expectedReturn * (allocation.percentage / 100);
    }
  });

  // Calculate portfolio variance (simplified - assumes no correlation)
  allocations.forEach((allocation) => {
    const asset = ASSET_CLASSES[allocation.assetClass];
    if (asset) {
      const weight = allocation.percentage / 100;
      portfolioVariance += Math.pow(weight * asset.volatility, 2);
    }
  });

  const portfolioVolatility = Math.sqrt(portfolioVariance);

  // Calculate Sharpe ratio (assuming 2.5% risk-free rate)
  const riskFreeRate = 0.025;
  const sharpeRatio = portfolioVolatility > 0 ? (expectedReturn - riskFreeRate) / portfolioVolatility : 0;

  return {
    expectedReturn: Math.round(expectedReturn * 10000) / 100, // Convert to percentage
    volatility: Math.round(portfolioVolatility * 10000) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    riskLevel: portfolioVolatility < 0.05 ? 'Very Low' :
               portfolioVolatility < 0.10 ? 'Low' :
               portfolioVolatility < 0.15 ? 'Medium' :
               portfolioVolatility < 0.20 ? 'High' : 'Very High'
  };
};

/**
 * Generate dollar-cost averaging projection
 *
 * @param {number} monthlyInvestment - Amount invested each month
 * @param {number} expectedAnnualReturn - Expected annual return rate as percentage
 * @param {number} years - Investment period in years
 * @param {number} volatility - Annual volatility (standard deviation) as decimal
 * @returns {Object} DCA projection with monte carlo scenarios
 */
export const calculateDollarCostAveraging = (
  monthlyInvestment,
  expectedAnnualReturn,
  years,
  volatility = 0.15
) => {
  const months = years * 12;
  const monthlyReturn = Math.pow(1 + expectedAnnualReturn / 100, 1 / 12) - 1;
  const monthlyVolatility = volatility / Math.sqrt(12);

  // Base scenario (expected return)
  const baseScenario = calculateCompoundGrowth(0, monthlyInvestment, expectedAnnualReturn / 100, years);

  // Conservative scenario (expected return - 1 std dev)
  const conservativeReturn = (expectedAnnualReturn / 100) - volatility;
  const conservativeScenario = calculateCompoundGrowth(
    0,
    monthlyInvestment,
    Math.max(0, conservativeReturn),
    years
  );

  // Optimistic scenario (expected return + 1 std dev)
  const optimisticReturn = (expectedAnnualReturn / 100) + volatility;
  const optimisticScenario = calculateCompoundGrowth(0, monthlyInvestment, optimisticReturn, years);

  return {
    monthlyInvestment,
    expectedAnnualReturn,
    years,
    baseScenario: {
      finalValue: baseScenario.finalValue,
      totalReturns: baseScenario.totalReturns,
      returnRate: expectedAnnualReturn
    },
    conservativeScenario: {
      finalValue: conservativeScenario.finalValue,
      totalReturns: conservativeScenario.totalReturns,
      returnRate: Math.round(conservativeReturn * 10000) / 100
    },
    optimisticScenario: {
      finalValue: optimisticScenario.finalValue,
      totalReturns: optimisticScenario.totalReturns,
      returnRate: Math.round(optimisticReturn * 10000) / 100
    },
    totalContributed: monthlyInvestment * months
  };
};

/**
 * Calculate investment rebalancing recommendations
 *
 * @param {Object} currentPortfolio - Current portfolio allocations {assetClass: value}
 * @param {Object} targetAllocations - Target allocations {assetClass: percentage}
 * @returns {Object} Rebalancing recommendations
 */
export const calculateRebalancing = (currentPortfolio, targetAllocations) => {
  const totalValue = Object.values(currentPortfolio).reduce((sum, val) => sum + val, 0);

  const recommendations = [];
  let totalRebalanceAmount = 0;

  Object.keys(targetAllocations).forEach((assetClass) => {
    const currentValue = currentPortfolio[assetClass] || 0;
    const currentPercentage = (currentValue / totalValue) * 100;
    const targetPercentage = targetAllocations[assetClass];
    const targetValue = (targetPercentage / 100) * totalValue;
    const difference = targetValue - currentValue;
    const percentageDiff = currentPercentage - targetPercentage;

    if (Math.abs(difference) > totalValue * 0.01) {
      // Only recommend if difference > 1% of total portfolio
      recommendations.push({
        assetClass,
        currentValue: Math.round(currentValue * 100) / 100,
        currentPercentage: Math.round(currentPercentage * 100) / 100,
        targetPercentage,
        targetValue: Math.round(targetValue * 100) / 100,
        action: difference > 0 ? 'Buy' : 'Sell',
        amount: Math.abs(Math.round(difference * 100) / 100),
        percentageDiff: Math.round(percentageDiff * 100) / 100
      });

      totalRebalanceAmount += Math.abs(difference);
    }
  });

  return {
    needsRebalancing: recommendations.length > 0,
    totalPortfolioValue: Math.round(totalValue * 100) / 100,
    totalRebalanceAmount: Math.round(totalRebalanceAmount * 100) / 100,
    recommendations: recommendations.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  };
};

/**
 * Calculate required savings to reach investment goal
 *
 * @param {number} targetAmount - Target investment goal
 * @param {number} currentAmount - Current investment balance
 * @param {number} yearsToGoal - Years until goal
 * @param {number} expectedReturn - Expected annual return as percentage
 * @returns {Object} Required monthly savings calculation
 */
export const calculateGoalSavings = (targetAmount, currentAmount, yearsToGoal, expectedReturn) => {
  const periods = yearsToGoal * 12;
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  // Future value of current amount
  const currentAmountFV = currentAmount * Math.pow(1 + monthlyRate, periods);

  // Remaining amount needed from contributions
  const remainingNeeded = targetAmount - currentAmountFV;

  // Calculate required monthly contribution using annuity formula
  // PMT = FV * r / ((1 + r)^n - 1)
  let requiredMonthly = 0;
  if (remainingNeeded > 0) {
    requiredMonthly =
      remainingNeeded * monthlyRate / (Math.pow(1 + monthlyRate, periods) - 1);
  }

  const totalContributions = requiredMonthly * periods;
  const totalGrowth = targetAmount - currentAmount - totalContributions;

  return {
    targetAmount: Math.round(targetAmount * 100) / 100,
    currentAmount: Math.round(currentAmount * 100) / 100,
    yearsToGoal,
    requiredMonthly: Math.round(Math.max(0, requiredMonthly) * 100) / 100,
    totalContributions: Math.round(Math.max(0, totalContributions) * 100) / 100,
    expectedGrowth: Math.round(Math.max(0, totalGrowth) * 100) / 100,
    currentAmountFutureValue: Math.round(currentAmountFV * 100) / 100,
    isAchievable: currentAmountFV >= targetAmount || requiredMonthly >= 0
  };
};

/**
 * Calculate retirement corpus needed based on desired monthly income
 *
 * @param {number} desiredMonthlyIncome - Desired monthly retirement income
 * @param {number} yearsInRetirement - Expected years in retirement (default 30)
 * @param {number} inflationRate - Expected inflation rate as percentage (default 2%)
 * @param {number} withdrawalRate - Safe withdrawal rate as percentage (default 4%)
 * @returns {Object} Retirement corpus calculation
 */
export const calculateRetirementCorpus = (
  desiredMonthlyIncome,
  yearsInRetirement = 30,
  inflationRate = 2,
  withdrawalRate = 4
) => {
  const annualIncome = desiredMonthlyIncome * 12;

  // Simple method: Required corpus based on withdrawal rate
  const corpusUsingWithdrawalRate = (annualIncome / (withdrawalRate / 100));

  // More detailed method: Present value of annuity with inflation adjustment
  const realRate = ((1 + withdrawalRate / 100) / (1 + inflationRate / 100)) - 1;
  const periods = yearsInRetirement;

  const corpusUsingPV =
    annualIncome *
    ((1 - Math.pow(1 + realRate, -periods)) / realRate);

  // Use the more conservative (higher) estimate
  const recommendedCorpus = Math.max(corpusUsingWithdrawalRate, corpusUsingPV);

  return {
    desiredMonthlyIncome: Math.round(desiredMonthlyIncome * 100) / 100,
    desiredAnnualIncome: Math.round(annualIncome * 100) / 100,
    recommendedCorpus: Math.round(recommendedCorpus * 100) / 100,
    corpusUsingWithdrawalRate: Math.round(corpusUsingWithdrawalRate * 100) / 100,
    corpusUsingPV: Math.round(corpusUsingPV * 100) / 100,
    withdrawalRate,
    inflationRate,
    yearsInRetirement
  };
};

/**
 * Calculate investment returns with regular withdrawals
 *
 * @param {number} principal - Initial investment amount
 * @param {number} monthlyWithdrawal - Monthly withdrawal amount
 * @param {number} annualReturn - Annual return rate as percentage
 * @param {number} years - Projection period in years
 * @returns {Object} Withdrawal sustainability analysis
 */
export const calculateWithdrawalSustainability = (
  principal,
  monthlyWithdrawal,
  annualReturn,
  years
) => {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const projections = [];
  let balance = principal;
  let totalWithdrawn = 0;
  let totalReturns = 0;
  let monthsUntilDepletion = null;

  for (let month = 1; month <= years * 12; month++) {
    const returns = balance * monthlyRate;
    balance = balance + returns - monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    totalReturns += returns;

    projections.push({
      month,
      balance: Math.round(balance * 100) / 100,
      returns: Math.round(returns * 100) / 100,
      withdrawal: monthlyWithdrawal
    });

    if (balance <= 0 && monthsUntilDepletion === null) {
      monthsUntilDepletion = month;
      balance = 0;
    }

    if (balance <= 0) break;
  }

  const isSustainable = monthsUntilDepletion === null || monthsUntilDepletion > years * 12;

  return {
    principal: Math.round(principal * 100) / 100,
    monthlyWithdrawal,
    annualReturn,
    years,
    finalBalance: Math.round(balance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    totalReturns: Math.round(totalReturns * 100) / 100,
    monthsUntilDepletion,
    yearsUntilDepletion: monthsUntilDepletion ? Math.round((monthsUntilDepletion / 12) * 10) / 10 : null,
    isSustainable,
    projections: projections.slice(0, 120) // Return first 10 years of projections
  };
};

/**
 * Calculate tax-efficient investment strategies
 * Compares CPF SA top-up vs other investments
 *
 * @param {number} investmentAmount - Amount to invest
 * @param {number} years - Investment horizon
 * @param {number} alternativeReturn - Alternative investment return as percentage
 * @param {number} taxRate - Marginal tax rate as percentage
 * @returns {Object} Comparison between CPF SA and alternative
 */
export const compareCpfVsInvestment = (investmentAmount, years, alternativeReturn, taxRate = 0) => {
  // CPF SA scenario (4% guaranteed, up to 6% with extra interest for first $60k)
  const cpfReturn = 0.04;
  const cpfFV = calculateCompoundGrowth(investmentAmount, 0, cpfReturn, years);

  // Tax benefit from CPF SA top-up
  const taxSavings = investmentAmount * (taxRate / 100);

  // Alternative investment scenario
  const altFV = calculateCompoundGrowth(investmentAmount, 0, alternativeReturn / 100, years);

  // After-tax returns for alternative
  const alternativeAfterTaxReturn = altFV.totalReturns * (1 - taxRate / 100);
  const alternativeAfterTaxFV = investmentAmount + alternativeAfterTaxReturn;

  const cpfAdvantage = (cpfFV.finalValue + taxSavings) - alternativeAfterTaxFV;

  return {
    cpfSA: {
      finalValue: cpfFV.finalValue,
      returns: cpfFV.totalReturns,
      taxSavings: Math.round(taxSavings * 100) / 100,
      totalBenefit: Math.round((cpfFV.finalValue + taxSavings) * 100) / 100,
      returnRate: 4
    },
    alternative: {
      finalValue: altFV.finalValue,
      returns: altFV.totalReturns,
      afterTaxReturns: Math.round(alternativeAfterTaxReturn * 100) / 100,
      afterTaxFinalValue: Math.round(alternativeAfterTaxFV * 100) / 100,
      returnRate: alternativeReturn
    },
    comparison: {
      cpfAdvantage: Math.round(cpfAdvantage * 100) / 100,
      recommendation: cpfAdvantage > 0 ? 'CPF SA Top-up is better' : 'Alternative investment is better',
      breakEvenReturn: Math.round((cpfReturn + (taxSavings / investmentAmount) / years) * 10000) / 100
    }
  };
};