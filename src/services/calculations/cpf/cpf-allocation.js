/**
 * CPF Account Allocation Utilities
 *
 * This module handles the allocation of CPF contributions to different accounts
 * (Ordinary Account, Special Account, MediSave Account) and calculates tiered interest rates.
 *
 * References:
 * - CPF allocation rates by age: https://www.cpf.gov.sg/member/infohub/educational-resources/cpf-allocation-rates
 * - CPF interest rates: https://www.cpf.gov.sg/member/infohub/cpf-interest-rates
 * - As of 2025, CPF Board guidelines
 */

/**
 * CPF Account Types
 */
export const CPF_ACCOUNT = {
  ORDINARY: 'OA', // Ordinary Account
  SPECIAL: 'SA', // Special Account
  MEDISAVE: 'MA', // MediSave Account
  RETIREMENT: 'RA' // Retirement Account (post-55)
};

/**
 * CPF Allocation rates by age for Singaporeans/PRs (3rd year onwards)
 * Format: { OA: %, SA: %, MA: % }
 * Employee + Employer contributions combined
 *
 * Reference: CPF Board 2025 allocation rates
 */
const ALLOCATION_RATES = {
  '35_and_below': {
    [CPF_ACCOUNT.ORDINARY]: 0.6216, // 23% of 37%
    [CPF_ACCOUNT.SPECIAL]: 0.1622, // 6% of 37%
    [CPF_ACCOUNT.MEDISAVE]: 0.2162 // 8% of 37%
  },
  '35_to_45': {
    [CPF_ACCOUNT.ORDINARY]: 0.5676, // 21% of 37%
    [CPF_ACCOUNT.SPECIAL]: 0.1622, // 6% of 37%
    [CPF_ACCOUNT.MEDISAVE]: 0.2703 // 10% of 37%
  },
  '45_to_50': {
    [CPF_ACCOUNT.ORDINARY]: 0.5135, // 19% of 37%
    [CPF_ACCOUNT.SPECIAL]: 0.1622, // 6% of 37%
    [CPF_ACCOUNT.MEDISAVE]: 0.3243 // 12% of 37%
  },
  '50_to_55': {
    [CPF_ACCOUNT.ORDINARY]: 0.4054, // 15% of 37%
    [CPF_ACCOUNT.SPECIAL]: 0.2162, // 8% of 37%
    [CPF_ACCOUNT.MEDISAVE]: 0.3784 // 14% of 37%
  },
  '55_to_60': {
    [CPF_ACCOUNT.ORDINARY]: 0.4, // 12% of 30%
    [CPF_ACCOUNT.SPECIAL]: 0.1167, // 3.5% of 30%
    [CPF_ACCOUNT.MEDISAVE]: 0.4833 // 14.5% of 30%
  },
  '60_to_65': {
    [CPF_ACCOUNT.ORDINARY]: 0.3, // 6% of 20%
    [CPF_ACCOUNT.SPECIAL]: 0.175, // 3.5% of 20%
    [CPF_ACCOUNT.MEDISAVE]: 0.525 // 10.5% of 20%
  },
  '65_to_70': {
    [CPF_ACCOUNT.ORDINARY]: 0.2667, // 4% of 15%
    [CPF_ACCOUNT.SPECIAL]: 0.2333, // 3.5% of 15%
    [CPF_ACCOUNT.MEDISAVE]: 0.5 // 7.5% of 15%
  },
  'above_70': {
    [CPF_ACCOUNT.ORDINARY]: 0.4, // 4% of 10%
    [CPF_ACCOUNT.SPECIAL]: 0.1, // 1% of 10%
    [CPF_ACCOUNT.MEDISAVE]: 0.5 // 5% of 10%
  }
};

/**
 * MediSave contribution ceiling by age
 * Maximum amount that can be contributed to MediSave per year
 */
const MEDISAVE_CONTRIBUTION_CEILING = {
  '35_and_below': 8280, // Annual ceiling
  '35_to_45': 10890,
  '45_to_50': 13080,
  '50_to_55': 15240,
  '55_to_60': 15240,
  '60_to_65': 11070,
  '65_to_70': 7920,
  'above_70': 5280
};

/**
 * Basic Healthcare Sum (BHS) - MediSave minimum sum requirement
 * Updated annually by CPF Board
 */
const BASIC_HEALTHCARE_SUM = 71500; // 2025 BHS

/**
 * CPF Interest Rate Tiers
 * First $60k earns extra interest on OA+SA combined
 * First $30k of the $60k earns additional 1% extra
 *
 * Base rates:
 * - OA: 2.5% p.a.
 * - SA: 4.0% p.a.
 * - MA: 4.0% p.a.
 * - RA: 4.0% p.a.
 *
 * Extra interest for members above 55:
 * - First $30k: Additional 2% (total 4.5% on OA, 6% on SA/MA/RA)
 * - Next $30k: Additional 1% (total 3.5% on OA, 5% on SA/MA/RA)
 */
export const CPF_BASE_INTEREST_RATES = {
  [CPF_ACCOUNT.ORDINARY]: 0.025, // 2.5%
  [CPF_ACCOUNT.SPECIAL]: 0.04, // 4%
  [CPF_ACCOUNT.MEDISAVE]: 0.04, // 4%
  [CPF_ACCOUNT.RETIREMENT]: 0.04 // 4%
};

/**
 * Get age bracket for CPF allocation
 *
 * @param {number} age - Member's age
 * @returns {string} Age bracket key
 */
export const getAllocationAgeBracket = (age) => {
  if (age <= 35) return '35_and_below';
  if (age <= 45) return '35_to_45';
  if (age <= 50) return '45_to_50';
  if (age <= 55) return '50_to_55';
  if (age <= 60) return '55_to_60';
  if (age <= 65) return '60_to_65';
  if (age <= 70) return '65_to_70';
  return 'above_70';
};

/**
 * Calculate CPF contribution allocation to different accounts
 *
 * @param {number} totalContribution - Total CPF contribution amount
 * @param {number} age - Member's age
 * @param {number} currentMediSaveBalance - Current MediSave balance (optional)
 * @param {number} yearToDateMediSaveContribution - YTD MediSave contribution (optional)
 * @returns {Object} Allocation breakdown by account
 */
export const allocateCpfContributions = (
  totalContribution,
  age,
  currentMediSaveBalance = 0,
  yearToDateMediSaveContribution = 0
) => {
  const ageBracket = getAllocationAgeBracket(age);
  const rates = ALLOCATION_RATES[ageBracket];
  const mediSaveCeiling = MEDISAVE_CONTRIBUTION_CEILING[ageBracket];

  // Calculate base allocations
  let oaAllocation = totalContribution * rates[CPF_ACCOUNT.ORDINARY];
  let saAllocation = totalContribution * rates[CPF_ACCOUNT.SPECIAL];
  let maAllocation = totalContribution * rates[CPF_ACCOUNT.MEDISAVE];

  // Check MediSave ceiling constraints
  const remainingMediSaveRoom = Math.max(0, mediSaveCeiling - yearToDateMediSaveContribution);
  const actualMaContribution = Math.min(maAllocation, remainingMediSaveRoom);
  const excessMediSave = maAllocation - actualMaContribution;

  // Check BHS cap (excess goes to SA, then OA)
  let excessFromBHS = 0;
  if (currentMediSaveBalance >= BASIC_HEALTHCARE_SUM) {
    excessFromBHS = actualMaContribution;
    maAllocation = 0;
  } else if (currentMediSaveBalance + actualMaContribution > BASIC_HEALTHCARE_SUM) {
    excessFromBHS = currentMediSaveBalance + actualMaContribution - BASIC_HEALTHCARE_SUM;
    maAllocation = actualMaContribution - excessFromBHS;
  } else {
    maAllocation = actualMaContribution;
  }

  // Redistribute excess from MediSave ceiling and BHS
  const totalExcess = excessMediSave + excessFromBHS;

  // For members below 55: excess goes to SA first (up to SA allocation), then OA
  // For members 55+: excess goes to RA
  if (age < 55) {
    const originalSARatio = rates[CPF_ACCOUNT.SPECIAL] / (rates[CPF_ACCOUNT.SPECIAL] + rates[CPF_ACCOUNT.ORDINARY]);
    const excessToSA = totalExcess * originalSARatio;
    const excessToOA = totalExcess * (1 - originalSARatio);

    saAllocation += excessToSA;
    oaAllocation += excessToOA;
  } else {
    // Age 55+: excess goes to Retirement Account
    saAllocation += totalExcess;
  }

  return {
    [CPF_ACCOUNT.ORDINARY]: Math.round(oaAllocation * 100) / 100,
    [CPF_ACCOUNT.SPECIAL]: Math.round(saAllocation * 100) / 100,
    [CPF_ACCOUNT.MEDISAVE]: Math.round(maAllocation * 100) / 100,
    total: totalContribution,
    ageBracket,
    mediSaveStatus: {
      contributed: Math.round(maAllocation * 100) / 100,
      ceiling: mediSaveCeiling,
      remainingRoom: Math.round(remainingMediSaveRoom * 100) / 100,
      exceededCeiling: excessMediSave > 0,
      exceededBHS: excessFromBHS > 0
    }
  };
};

/**
 * Calculate tiered CPF interest for a given account balance
 * Implements the first $60k extra interest scheme
 *
 * @param {Object} balances - Object with OA, SA, MA, RA balances
 * @param {number} age - Member's age
 * @param {number} months - Number of months to calculate interest for (default 1)
 * @returns {Object} Interest earned by account and total
 */
export const calculateTieredCpfInterest = (balances, age, months = 1) => {
  const { OA = 0, SA = 0, MA = 0, RA = 0 } = balances;

  // Calculate combined balance eligible for extra interest
  const combinedBalance = SA + MA + RA + OA;

  // Determine extra interest eligibility (members above 55 get extra 1-2%)
  const isEligibleForExtraInterest = age >= 55;

  // Tier 1: First $30k of combined balance (extra 2% for 55+, else 1%)
  // Tier 2: Next $30k of combined balance (extra 1%)
  // Remaining: Base interest only

  const tier1Limit = 30000;
  const tier2Limit = 60000;

  const tier1ExtraRate = isEligibleForExtraInterest ? 0.02 : 0.01;
  const tier2ExtraRate = 0.01;

  // Calculate how much of each account benefits from extra interest
  // Priority: SA/MA/RA first, then OA
  let tier1Remaining = tier1Limit;
  let tier2Remaining = tier2Limit - tier1Limit;

  const calculateAccountInterest = (balance, baseRate) => {
    let tier1Amount = 0;
    let tier2Amount = 0;
    let regularAmount = balance;

    // Allocate to tier 1 (highest extra interest)
    if (tier1Remaining > 0) {
      tier1Amount = Math.min(balance, tier1Remaining);
      tier1Remaining -= tier1Amount;
      regularAmount -= tier1Amount;
    }

    // Allocate to tier 2 (medium extra interest)
    if (tier2Remaining > 0 && regularAmount > 0) {
      tier2Amount = Math.min(regularAmount, tier2Remaining);
      tier2Remaining -= tier2Amount;
      regularAmount -= tier2Amount;
    }

    // Calculate interest for each tier
    const tier1Interest = tier1Amount * (baseRate + tier1ExtraRate) * (months / 12);
    const tier2Interest = tier2Amount * (baseRate + tier2ExtraRate) * (months / 12);
    const regularInterest = regularAmount * baseRate * (months / 12);

    return {
      total: tier1Interest + tier2Interest + regularInterest,
      breakdown: {
        tier1: tier1Interest,
        tier2: tier2Interest,
        regular: regularInterest
      },
      effectiveRate: balance > 0 ? ((tier1Interest + tier2Interest + regularInterest) / balance) * (12 / months) : 0
    };
  };

  // Calculate interest for each account (SA/MA/RA get priority for extra interest)
  const saInterest = calculateAccountInterest(SA, CPF_BASE_INTEREST_RATES[CPF_ACCOUNT.SPECIAL]);
  const maInterest = calculateAccountInterest(MA, CPF_BASE_INTEREST_RATES[CPF_ACCOUNT.MEDISAVE]);
  const raInterest = calculateAccountInterest(RA, CPF_BASE_INTEREST_RATES[CPF_ACCOUNT.RETIREMENT]);
  const oaInterest = calculateAccountInterest(OA, CPF_BASE_INTEREST_RATES[CPF_ACCOUNT.ORDINARY]);

  const totalInterest = saInterest.total + maInterest.total + raInterest.total + oaInterest.total;

  return {
    [CPF_ACCOUNT.ORDINARY]: {
      interest: Math.round(oaInterest.total * 100) / 100,
      effectiveRate: Math.round(oaInterest.effectiveRate * 10000) / 100, // Convert to percentage
      breakdown: oaInterest.breakdown
    },
    [CPF_ACCOUNT.SPECIAL]: {
      interest: Math.round(saInterest.total * 100) / 100,
      effectiveRate: Math.round(saInterest.effectiveRate * 10000) / 100,
      breakdown: saInterest.breakdown
    },
    [CPF_ACCOUNT.MEDISAVE]: {
      interest: Math.round(maInterest.total * 100) / 100,
      effectiveRate: Math.round(maInterest.effectiveRate * 10000) / 100,
      breakdown: maInterest.breakdown
    },
    [CPF_ACCOUNT.RETIREMENT]: {
      interest: Math.round(raInterest.total * 100) / 100,
      effectiveRate: Math.round(raInterest.effectiveRate * 10000) / 100,
      breakdown: raInterest.breakdown
    },
    totalInterest: Math.round(totalInterest * 100) / 100,
    monthsCalculated: months,
    extraInterestEligible: isEligibleForExtraInterest,
    tier1Applied: tier1Limit - tier1Remaining,
    tier2Applied: (tier2Limit - tier1Limit) - tier2Remaining
  };
};

/**
 * Project CPF balances over time with contributions and interest
 *
 * @param {Object} initialBalances - Starting balances { OA, SA, MA, RA }
 * @param {number} age - Current age
 * @param {number} monthlyContribution - Monthly total CPF contribution
 * @param {number} projectionMonths - Number of months to project
 * @returns {Array} Array of monthly balance projections
 */
export const projectCpfGrowth = (initialBalances, age, monthlyContribution, projectionMonths) => {
  const projections = [];
  let currentBalances = { ...initialBalances };
  let yearToDateMA = 0;
  let currentAge = age;

  for (let month = 1; month <= projectionMonths; month++) {
    // Update age annually
    if (month > 1 && month % 12 === 1) {
      currentAge += 1;
      yearToDateMA = 0; // Reset YTD MediSave counter
    }

    // Allocate monthly contribution
    const allocation = allocateCpfContributions(
      monthlyContribution,
      currentAge,
      currentBalances.MA || 0,
      yearToDateMA
    );

    yearToDateMA += allocation[CPF_ACCOUNT.MEDISAVE];

    // Update balances with contributions
    currentBalances.OA = (currentBalances.OA || 0) + allocation[CPF_ACCOUNT.ORDINARY];
    currentBalances.SA = (currentBalances.SA || 0) + allocation[CPF_ACCOUNT.SPECIAL];
    currentBalances.MA = (currentBalances.MA || 0) + allocation[CPF_ACCOUNT.MEDISAVE];

    // Calculate and add interest
    const interest = calculateTieredCpfInterest(currentBalances, currentAge, 1);
    currentBalances.OA += interest[CPF_ACCOUNT.ORDINARY].interest;
    currentBalances.SA += interest[CPF_ACCOUNT.SPECIAL].interest;
    currentBalances.MA += interest[CPF_ACCOUNT.MEDISAVE].interest;
    currentBalances.RA = (currentBalances.RA || 0) + interest[CPF_ACCOUNT.RETIREMENT].interest;

    const totalBalance = (currentBalances.OA || 0) + (currentBalances.SA || 0) +
                        (currentBalances.MA || 0) + (currentBalances.RA || 0);

    projections.push({
      month,
      age: currentAge,
      balances: {
        [CPF_ACCOUNT.ORDINARY]: Math.round((currentBalances.OA || 0) * 100) / 100,
        [CPF_ACCOUNT.SPECIAL]: Math.round((currentBalances.SA || 0) * 100) / 100,
        [CPF_ACCOUNT.MEDISAVE]: Math.round((currentBalances.MA || 0) * 100) / 100,
        [CPF_ACCOUNT.RETIREMENT]: Math.round((currentBalances.RA || 0) * 100) / 100,
        total: Math.round(totalBalance * 100) / 100
      },
      contributions: allocation,
      interest: interest
    });
  }

  return projections;
};

/**
 * Calculate CPF retirement adequacy (Full Retirement Sum targets)
 *
 * @param {Object} currentBalances - Current CPF balances
 * @param {number} age - Current age
 * @param {number} targetAge - Target retirement age (default 65)
 * @returns {Object} Retirement adequacy analysis
 */
export const calculateRetirementAdequacy = (currentBalances, age, targetAge = 65) => {
  // Full Retirement Sum (FRS) for 2025 - updated annually
  const FULL_RETIREMENT_SUM = 213000;
  const BASIC_RETIREMENT_SUM = 106500; // 50% of FRS
  const ENHANCED_RETIREMENT_SUM = 319500; // 150% of FRS

  const totalCpf = (currentBalances.OA || 0) + (currentBalances.SA || 0) +
                   (currentBalances.MA || 0) + (currentBalances.RA || 0);

  const yearsToRetirement = Math.max(0, targetAge - age);
  const adequacyRatio = (totalCpf / FULL_RETIREMENT_SUM) * 100;

  let retirementLevel = 'Below Basic';
  if (totalCpf >= ENHANCED_RETIREMENT_SUM) {
    retirementLevel = 'Enhanced Retirement Sum';
  } else if (totalCpf >= FULL_RETIREMENT_SUM) {
    retirementLevel = 'Full Retirement Sum';
  } else if (totalCpf >= BASIC_RETIREMENT_SUM) {
    retirementLevel = 'Basic Retirement Sum';
  }

  return {
    currentTotal: Math.round(totalCpf * 100) / 100,
    fullRetirementSum: FULL_RETIREMENT_SUM,
    basicRetirementSum: BASIC_RETIREMENT_SUM,
    enhancedRetirementSum: ENHANCED_RETIREMENT_SUM,
    adequacyRatio: Math.round(adequacyRatio * 100) / 100,
    shortfall: Math.max(0, FULL_RETIREMENT_SUM - totalCpf),
    retirementLevel,
    yearsToRetirement,
    onTrack: totalCpf >= BASIC_RETIREMENT_SUM || yearsToRetirement > 10
  };
};