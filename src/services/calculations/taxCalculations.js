/**
 * Singapore Tax Calculation Utilities
 *
 * This module provides utilities for calculating Singapore personal income tax
 * based on IRAS tax rates and reliefs for Year of Assessment (YA) 2025.
 *
 * References:
 * - IRAS Personal Income Tax Rates: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates
 * - Tax reliefs: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions
 * - Updated for YA 2025
 */

/**
 * Singapore Personal Income Tax Brackets for YA 2025
 * Progressive tax system with rates from 0% to 24%
 */
const TAX_BRACKETS = [
  { min: 0, max: 20000, rate: 0 },
  { min: 20000, max: 30000, rate: 0.02 },
  { min: 30000, max: 40000, rate: 0.035 },
  { min: 40000, max: 80000, rate: 0.07 },
  { min: 80000, max: 120000, rate: 0.115 },
  { min: 120000, max: 160000, rate: 0.15 },
  { min: 160000, max: 200000, rate: 0.18 },
  { min: 200000, max: 240000, rate: 0.19 },
  { min: 240000, max: 280000, rate: 0.195 },
  { min: 280000, max: 320000, rate: 0.20 },
  { min: 320000, max: 500000, rate: 0.22 },
  { min: 500000, max: 1000000, rate: 0.23 },
  { min: 1000000, max: Infinity, rate: 0.24 }
];

/**
 * Tax Relief Types and Maximum Caps (YA 2025)
 */
export const TAX_RELIEF_TYPES = {
  EARNED_INCOME: 'earned_income', // Automatic relief
  CPF: 'cpf', // CPF contributions (capped)
  SPOUSE: 'spouse', // $2,000
  HANDICAPPED_SPOUSE: 'handicapped_spouse', // $5,500
  QUALIFYING_CHILD: 'qualifying_child', // $4,000 per child
  HANDICAPPED_CHILD: 'handicapped_child', // $7,500 per child
  PARENT: 'parent', // $9,000 per parent
  HANDICAPPED_PARENT: 'handicapped_parent', // $14,000 per parent
  GRANDPARENT_CAREGIVER: 'grandparent_caregiver', // $3,000
  NSman_SELF: 'nsman_self', // $3,000 (Active), $1,500 (Key Appointment Holder)
  NSman_WIFE: 'nsman_wife', // $750
  LIFE_INSURANCE: 'life_insurance', // Capped at $5,000 - $7,000
  COURSE_FEES: 'course_fees', // Capped at $5,500
  SUPPLEMENTARY_RETIREMENT: 'supplementary_retirement', // SRS - capped at $15,300
  FOREIGN_DOMESTIC_WORKER: 'foreign_domestic_worker' // Twice levy, max $9,600
};

/**
 * Tax relief caps and defaults
 */
const TAX_RELIEF_CAPS = {
  [TAX_RELIEF_TYPES.EARNED_INCOME]: 1000, // Automatic for all
  [TAX_RELIEF_TYPES.CPF]: 37740, // 20% + 17% of $6,000 * 12 = $6,660 (actual max based on salary cap)
  [TAX_RELIEF_TYPES.SPOUSE]: 2000,
  [TAX_RELIEF_TYPES.HANDICAPPED_SPOUSE]: 5500,
  [TAX_RELIEF_TYPES.QUALIFYING_CHILD]: 4000,
  [TAX_RELIEF_TYPES.HANDICAPPED_CHILD]: 7500,
  [TAX_RELIEF_TYPES.PARENT]: 9000,
  [TAX_RELIEF_TYPES.HANDICAPPED_PARENT]: 14000,
  [TAX_RELIEF_TYPES.GRANDPARENT_CAREGIVER]: 3000,
  [TAX_RELIEF_TYPES.NSman_SELF]: 3000,
  [TAX_RELIEF_TYPES.NSman_WIFE]: 750,
  [TAX_RELIEF_TYPES.LIFE_INSURANCE]: 5000,
  [TAX_RELIEF_TYPES.COURSE_FEES]: 5500,
  [TAX_RELIEF_TYPES.SUPPLEMENTARY_RETIREMENT]: 15300,
  [TAX_RELIEF_TYPES.FOREIGN_DOMESTIC_WORKER]: 9600
};

/**
 * Calculate earned income relief based on income
 * All tax residents get automatic $1,000 relief
 *
 * @param {number} assessableIncome - Assessable income
 * @returns {number} Earned income relief amount
 */
export const calculateEarnedIncomeRelief = (assessableIncome) => {
  return TAX_RELIEF_CAPS[TAX_RELIEF_TYPES.EARNED_INCOME];
};

/**
 * Calculate CPF relief based on actual contributions
 * Employee + employer CPF contributions are tax-deductible
 *
 * @param {number} employeeContribution - Employee CPF contribution for the year
 * @param {number} employerContribution - Employer CPF contribution for the year (optional)
 * @returns {number} CPF relief amount
 */
export const calculateCpfRelief = (employeeContribution, employerContribution = 0) => {
  // Only employee's mandatory CPF contributions are automatically included as relief
  // Employer contributions don't count toward personal income tax relief
  const totalRelief = employeeContribution;
  return Math.min(totalRelief, TAX_RELIEF_CAPS[TAX_RELIEF_TYPES.CPF]);
};

/**
 * Calculate total tax reliefs based on provided relief claims
 *
 * @param {Object} reliefs - Object containing relief types and amounts
 * @returns {Object} Total relief amount and breakdown
 */
export const calculateTotalReliefs = (reliefs = {}) => {
  let totalRelief = 0;
  const breakdown = {};

  // Earned income relief (automatic)
  const earnedIncomeRelief = calculateEarnedIncomeRelief(reliefs.assessableIncome || 0);
  breakdown[TAX_RELIEF_TYPES.EARNED_INCOME] = earnedIncomeRelief;
  totalRelief += earnedIncomeRelief;

  // CPF relief (automatic based on contributions)
  if (reliefs.cpfContributions) {
    const cpfRelief = calculateCpfRelief(reliefs.cpfContributions);
    breakdown[TAX_RELIEF_TYPES.CPF] = cpfRelief;
    totalRelief += cpfRelief;
  }

  // Other reliefs (must be claimed)
  Object.keys(TAX_RELIEF_TYPES).forEach((key) => {
    const reliefType = TAX_RELIEF_TYPES[key];

    // Skip already processed reliefs
    if (reliefType === TAX_RELIEF_TYPES.EARNED_INCOME || reliefType === TAX_RELIEF_TYPES.CPF) {
      return;
    }

    if (reliefs[reliefType] !== undefined && reliefs[reliefType] > 0) {
      const cappedAmount = Math.min(reliefs[reliefType], TAX_RELIEF_CAPS[reliefType] || Infinity);
      breakdown[reliefType] = cappedAmount;
      totalRelief += cappedAmount;
    }
  });

  return {
    totalRelief: Math.round(totalRelief * 100) / 100,
    breakdown
  };
};

/**
 * Calculate tax based on progressive tax brackets
 *
 * @param {number} chargeableIncome - Chargeable income (after reliefs)
 * @returns {Object} Tax amount and breakdown by bracket
 */
export const calculateProgressiveTax = (chargeableIncome) => {
  if (chargeableIncome <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      breakdown: []
    };
  }

  let totalTax = 0;
  const breakdown = [];
  let remainingIncome = chargeableIncome;

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      Math.max(0, remainingIncome),
      bracket.max - bracket.min
    );

    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;

    if (taxableInBracket > 0) {
      breakdown.push({
        min: bracket.min,
        max: bracket.max === Infinity ? 'Above' : bracket.max,
        rate: bracket.rate * 100,
        taxableAmount: taxableInBracket,
        taxAmount: Math.round(taxInBracket * 100) / 100
      });
    }

    remainingIncome -= taxableInBracket;
  }

  // Calculate effective and marginal tax rates
  const effectiveRate = (totalTax / chargeableIncome) * 100;
  const marginalBracket = TAX_BRACKETS.find(
    (b) => chargeableIncome > b.min && chargeableIncome <= b.max
  );
  const marginalRate = marginalBracket ? marginalBracket.rate * 100 : TAX_BRACKETS[TAX_BRACKETS.length - 1].rate * 100;

  return {
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate: Math.round(marginalRate * 100) / 100,
    breakdown
  };
};

/**
 * Calculate complete personal income tax
 *
 * @param {number} grossIncome - Total gross annual income
 * @param {Object} options - Tax calculation options
 * @param {Object} options.reliefs - Tax reliefs to claim
 * @param {number} options.donations - Qualifying donations (2.5x tax deduction)
 * @param {number} options.rebate - Tax rebate percentage (government may provide rebates)
 * @returns {Object} Complete tax calculation breakdown
 */
export const calculatePersonalIncomeTax = (grossIncome, options = {}) => {
  const { reliefs = {}, donations = 0, rebate = 0 } = options;

  // Step 1: Calculate assessable income (gross income for employment)
  const assessableIncome = grossIncome;

  // Step 2: Calculate total reliefs
  reliefs.assessableIncome = assessableIncome;
  const totalReliefs = calculateTotalReliefs(reliefs);

  // Step 3: Calculate qualifying donations deduction (2.5x tax deduction)
  const donationsDeduction = donations * 2.5;

  // Step 4: Calculate chargeable income
  const chargeableIncome = Math.max(0, assessableIncome - totalReliefs.totalRelief - donationsDeduction);

  // Step 5: Calculate tax on chargeable income
  const taxCalculation = calculateProgressiveTax(chargeableIncome);

  // Step 6: Apply tax rebate if any
  const rebateAmount = rebate > 0 ? Math.min(taxCalculation.totalTax * (rebate / 100), taxCalculation.totalTax) : 0;
  const finalTax = Math.max(0, taxCalculation.totalTax - rebateAmount);

  // Calculate take-home after tax
  const takeHomeIncome = grossIncome - finalTax;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    assessableIncome: Math.round(assessableIncome * 100) / 100,
    totalReliefs: totalReliefs.totalRelief,
    reliefBreakdown: totalReliefs.breakdown,
    donationsDeduction: Math.round(donationsDeduction * 100) / 100,
    chargeableIncome: Math.round(chargeableIncome * 100) / 100,
    taxBeforeRebate: taxCalculation.totalTax,
    rebateAmount: Math.round(rebateAmount * 100) / 100,
    finalTax: Math.round(finalTax * 100) / 100,
    effectiveRate: Math.round((finalTax / grossIncome) * 10000) / 100,
    marginalRate: taxCalculation.marginalRate,
    takeHomeIncome: Math.round(takeHomeIncome * 100) / 100,
    taxBracketBreakdown: taxCalculation.breakdown
  };
};

/**
 * Calculate monthly tax payable (for budgeting purposes)
 *
 * @param {number} monthlyGrossIncome - Monthly gross income
 * @param {Object} options - Tax calculation options (annualized)
 * @returns {Object} Monthly tax estimate
 */
export const calculateMonthlyTax = (monthlyGrossIncome, options = {}) => {
  const annualIncome = monthlyGrossIncome * 12;

  // Annualize CPF contributions if provided
  if (options.reliefs && options.reliefs.cpfContributions) {
    options.reliefs.cpfContributions = options.reliefs.cpfContributions * 12;
  }

  const annualTax = calculatePersonalIncomeTax(annualIncome, options);
  const monthlyTax = annualTax.finalTax / 12;

  return {
    monthlyGrossIncome: Math.round(monthlyGrossIncome * 100) / 100,
    estimatedMonthlyTax: Math.round(monthlyTax * 100) / 100,
    annualTaxBreakdown: annualTax,
    monthlyTakeHome: Math.round((monthlyGrossIncome - monthlyTax) * 100) / 100
  };
};

/**
 * Calculate tax impact of bonus or additional income
 *
 * @param {number} currentAnnualIncome - Current annual income
 * @param {number} additionalIncome - Additional income (bonus, etc.)
 * @param {Object} options - Tax calculation options
 * @returns {Object} Tax impact analysis
 */
export const calculateBonusTaxImpact = (currentAnnualIncome, additionalIncome, options = {}) => {
  const taxWithoutBonus = calculatePersonalIncomeTax(currentAnnualIncome, options);
  const taxWithBonus = calculatePersonalIncomeTax(currentAnnualIncome + additionalIncome, options);

  const additionalTax = taxWithBonus.finalTax - taxWithoutBonus.finalTax;
  const effectiveTaxOnBonus = (additionalTax / additionalIncome) * 100;
  const netBonus = additionalIncome - additionalTax;

  return {
    additionalIncome: Math.round(additionalIncome * 100) / 100,
    additionalTax: Math.round(additionalTax * 100) / 100,
    effectiveTaxOnBonus: Math.round(effectiveTaxOnBonus * 100) / 100,
    netBonus: Math.round(netBonus * 100) / 100,
    taxWithoutBonus: taxWithoutBonus.finalTax,
    taxWithBonus: taxWithBonus.finalTax
  };
};

/**
 * Compare tax scenarios (e.g., different relief strategies)
 *
 * @param {number} grossIncome - Gross annual income
 * @param {Array} scenarios - Array of scenario options
 * @returns {Array} Comparison of different tax scenarios
 */
export const compareTaxScenarios = (grossIncome, scenarios) => {
  return scenarios.map((scenario, index) => {
    const taxResult = calculatePersonalIncomeTax(grossIncome, scenario.options);
    return {
      scenarioName: scenario.name || `Scenario ${index + 1}`,
      ...taxResult,
      taxSavings: scenarios[0] ? scenarios[0].taxResult?.finalTax - taxResult.finalTax : 0
    };
  });
};

/**
 * Estimate tax for non-residents (different tax structure)
 * Non-residents are taxed at 15% or progressive rates, whichever is higher
 *
 * @param {number} grossIncome - Gross annual income
 * @param {number} employmentPeriodDays - Number of days worked in Singapore
 * @returns {Object} Non-resident tax calculation
 */
export const calculateNonResidentTax = (grossIncome, employmentPeriodDays = 365) => {
  // Non-resident tax rate is 15% or progressive rates (whichever is higher)
  const flatRateTax = grossIncome * 0.15;

  // Calculate progressive tax (no reliefs for non-residents except earned income relief)
  const progressiveTax = calculateProgressiveTax(grossIncome - 1000);

  const finalTax = Math.max(flatRateTax, progressiveTax.totalTax);
  const effectiveRate = (finalTax / grossIncome) * 100;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    flatRateTax: Math.round(flatRateTax * 100) / 100,
    progressiveTax: progressiveTax.totalTax,
    finalTax: Math.round(finalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    taxMethod: finalTax === flatRateTax ? '15% Flat Rate' : 'Progressive Rates',
    employmentPeriodDays
  };
};