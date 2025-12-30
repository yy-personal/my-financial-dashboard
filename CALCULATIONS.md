# Financial Calculations Documentation

This document provides comprehensive documentation for all financial calculation modules implemented in the My Financial Dashboard application.

## Table of Contents

1. [CPF Calculations](#cpf-calculations)
2. [Tax Calculations](#tax-calculations)
3. [Investment Calculations](#investment-calculations)
4. [Inflation Calculations](#inflation-calculations)
5. [Scenario Modeling](#scenario-modeling)
6. [Integration Examples](#integration-examples)

---

## CPF Calculations

**Location:** `src/services/calculations/cpf/`

### CPF Contribution Rates (`cpf-utilities.js`)

Age-based CPF contribution calculations following Singapore CPF Board 2025 rates.

**Supported Employee Types:**
- Singaporean Citizens
- PR (1st, 2nd, 3rd year onwards)

**Rate Transitions:**
- Age ≤55: 20% employee + 17% employer = 37%
- Age 56-60: 15% + 15% = 30%
- Age 61-65: 10.5% + 9.5% = 20%
- Age 66-70: 7.5% + 7.5% = 15%
- Age >70: 5% + 5% = 10%

**Example:**
```javascript
import { getCpfRates, EMPLOYEE_TYPE } from './cpf/cpf-utilities';

const [empRate, emplRate] = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, 30);
// Returns: [0.20, 0.17]
```

### CPF Account Allocation (`cpf-allocation.js`)

**Features:**
- OA/SA/MA account allocation by age
- MediSave contribution ceilings
- Basic Healthcare Sum (BHS) caps

**Allocation Rates by Age:**
- Age ≤35: OA 62.16%, SA 16.22%, MA 21.62%
- Age 50-55: OA 40.54%, SA 21.62%, MA 37.84%
- Age 55-60: OA 40%, SA 11.67%, MA 48.33%

**Example:**
```javascript
const allocation = allocateCpfContributions(2220, 30, 50000, 0);
// Returns: { OA: 1380.31, SA: 360.16, MA: 479.53 }
```

### CPF Tiered Interest Rates

**Base Rates:**
- OA: 2.5% p.a.
- SA/MA/RA: 4.0% p.a.

**Extra Interest (Age 55+):**
- First $30k: +2% (total 4.5% OA, 6% SA/MA/RA)
- Next $30k: +1% (total 3.5% OA, 5% SA/MA/RA)

**Example:**
```javascript
const balances = { OA: 20000, SA: 40000, MA: 20000, RA: 0 };
const interest = calculateTieredCpfInterest(balances, 55, 12);
// Returns interest breakdown with tiered rates applied
```

### Test Coverage
- ✅ Age bracket transitions (55, 60, 65, 70)
- ✅ Multi-year age progression (20-year projections)
- ✅ PR rate differences
- ✅ Tiered interest calculations
- ✅ Extra interest eligibility at age 55+

---

## Tax Calculations

**Location:** `src/services/calculations/taxCalculations.js`

Singapore personal income tax calculations based on IRAS YA 2025 rates.

### Progressive Tax Brackets

| Chargeable Income | Tax Rate |
|-------------------|----------|
| $0 - $20,000 | 0% |
| $20,001 - $30,000 | 2% |
| $30,001 - $40,000 | 3.5% |
| $40,001 - $80,000 | 7% |
| $80,001 - $120,000 | 11.5% |
| $120,001 - $160,000 | 15% |
| Above $1,000,000 | 24% |

### Tax Reliefs (YA 2025)

- **Earned Income Relief:** $1,000 (automatic)
- **CPF Relief:** Employee contributions (capped $37,740)
- **Spouse Relief:** $2,000
- **Qualifying Child Relief:** $4,000 per child
- **Parent Relief:** $9,000 per parent
- **Course Fees Relief:** Up to $5,500
- **SRS Contributions:** Up to $15,300

### Key Functions

#### `calculatePersonalIncomeTax(grossIncome, options)`
Complete tax calculation with reliefs and rebates.

**Example:**
```javascript
const tax = calculatePersonalIncomeTax(80000, {
  reliefs: {
    cpfContributions: 16000,
    spouse: 2000,
    parent: 9000
  }
});
// Returns full tax breakdown with effective/marginal rates
```

#### `calculateMonthlyTax(monthlyGrossIncome, options)`
Estimates monthly tax payable for budgeting.

#### `calculateBonusTaxImpact(currentAnnualIncome, additionalIncome, options)`
Analyzes tax impact of bonuses.

---

## Investment Calculations

**Location:** `src/services/calculations/investmentCalculations.js`

Portfolio analysis and investment projection tools.

### Asset Classes (Singapore Context)

- **Cash/Savings:** 1.5% return, 0% volatility
- **CPF OA:** 2.5% guaranteed
- **CPF SA:** 4% guaranteed (up to 6% with extra interest)
- **Singapore Bonds (SGS):** 3% return, 3% volatility
- **Singapore Equities (STI):** 7% return, 18% volatility
- **Global Equities:** 8% return, 20% volatility
- **Singapore REITs:** 6% return, 15% volatility

### Key Functions

#### `calculateCompoundGrowth(principal, monthlyContribution, annualReturnRate, years)`
Standard compound interest with periodic contributions.

#### `calculatePortfolioMetrics(allocations)`
Modern Portfolio Theory metrics including:
- Expected return
- Portfolio volatility
- Sharpe ratio
- Risk level assessment

**Example:**
```javascript
const portfolio = calculatePortfolioMetrics([
  { assetClass: 'SINGAPORE_EQUITIES', percentage: 40 },
  { assetClass: 'SINGAPORE_BONDS', percentage: 30 },
  { assetClass: 'CPF_SA', percentage: 30 }
]);
// Returns: { expectedReturn: 5.2%, volatility: 7.4%, sharpeRatio: 0.36 }
```

#### `calculateDollarCostAveraging(monthlyInvestment, expectedAnnualReturn, years, volatility)`
DCA projections with conservative/base/optimistic scenarios.

#### `calculateRetirementCorpus(desiredMonthlyIncome, yearsInRetirement, inflationRate, withdrawalRate)`
Required retirement savings using 4% withdrawal rule.

#### `compareCpfVsInvestment(investmentAmount, years, alternativeReturn, taxRate)`
Tax-efficient comparison: CPF SA top-up vs alternative investments.

---

## Inflation Calculations

**Location:** `src/services/calculations/inflationCalculations.js`

Purchasing power analysis and inflation-adjusted projections.

### Singapore Inflation Rates (2020-2025 Average)

- **Overall CPI:** 2.3%
- **Housing:** 2.8%
- **Healthcare:** 3.2%
- **Education:** 3.5%
- **Food:** 3.0%
- **Transport:** 2.5%

### Key Functions

#### `calculateInflationAdjusted(currentValue, inflationRate, years)`
Future value with inflation adjustment.

**Example:**
```javascript
const future = calculateInflationAdjusted(100000, 2.3, 10);
// Returns: {
//   futureNominalValue: 125,629,
//   purchasingPowerLoss: 20.45%
// }
```

#### `calculateRealReturn(nominalReturn, inflationRate)`
Real return using Fisher equation.

**Example:**
```javascript
const real = calculateRealReturn(7, 2.3);
// Returns: { realReturn: 4.60% } (not just 7 - 2.3 = 4.7%)
```

#### `calculateRealVsNominalGrowth(principal, monthlyContribution, nominalReturn, inflationRate, years)`
Investment projections showing both nominal and purchasing power values.

#### `compareInflationImpactByAsset(amount, years, inflationRate)`
Compares how different assets preserve purchasing power:
- Cash (loses to inflation)
- CPF OA (slight real loss)
- CPF SA (beats inflation)
- Equities (significantly beats inflation)

---

## Scenario Modeling

**Location:** `src/services/calculations/scenarioModeling.js`

What-if analyses and risk scenarios for financial planning.

### Scenarios

#### 1. Emergency Fund Analysis
`analyzeEmergencyFund(financialData, targetMonths)`

Assesses:
- Current months of expenses covered
- Adequacy level (Insufficient/Fair/Adequate/Excellent)
- Time to reach target

#### 2. Job Loss Impact
`simulateJobLoss(financialData, unemploymentMonths, severancePayment)`

Models:
- Monthly burn rate
- Months until cash depletion
- CPF withdrawal options
- Actionable recommendations

#### 3. Housing Affordability
`analyzeHousingAffordability(housingParams, financialData)`

Checks:
- **TDSR (Total Debt Servicing Ratio):** Max 55%
- **MSR (Mortgage Servicing Ratio):** Max 30% for HDB
- Down payment affordability
- Stamp duty and costs
- Monthly cash flow impact

**Example:**
```javascript
const analysis = analyzeHousingAffordability(
  {
    propertyPrice: 600000,
    downPaymentPercentage: 25,
    loanTermYears: 25,
    interestRate: 2.6
  },
  {
    monthlyIncome: 8000,
    monthlyExpenses: 3000,
    liquidCash: 100000,
    cpfBalance: 80000
  }
);
// Returns: verdict, TDSR/MSR compliance, upfront costs
```

#### 4. Retirement Readiness
`analyzeRetirementReadiness(currentData, retirementAge, currentAge, desiredMonthlyIncome)`

Calculates:
- Projected retirement corpus
- Required corpus (using 4% withdrawal rule)
- Shortfall/surplus
- Additional monthly savings needed

#### 5. Salary Increase Impact
`simulateSalaryIncrease(currentData, salaryIncreasePercentage, years)`

Projects:
- New budget allocation
- Long-term wealth accumulation
- Lifestyle inflation vs savings

#### 6. Career Break Impact
`simulateCareerBreak(currentData, breakMonths, monthlyExpensesDuringBreak)`

Analyzes:
- Cash depletion during break
- Lost income and CPF contributions
- Opportunity cost
- Feasibility assessment

#### 7. Scenario Comparison
`compareScenarios(scenarios)`

Ranks multiple financial scenarios by:
- Savings rate
- Projected 10-year wealth
- Best/worst case analysis

---

## Integration Examples

### Example 1: Complete Financial Projection with Age-Based CPF

```javascript
import { getCpfRates, EMPLOYEE_TYPE } from './cpf/cpf-utilities';
import { allocateCpfContributions } from './cpf/cpf-allocation';
import { calculatePersonalIncomeTax } from './taxCalculations';

function calculateMonthlyProjection(monthIndex, currentAge, salary) {
  // Age progression
  const projectedAge = currentAge + Math.floor(monthIndex / 12);

  // Get age-appropriate CPF rates
  const [empRate, emplRate] = getCpfRates(EMPLOYEE_TYPE.SINGAPOREAN, projectedAge);

  // Calculate CPF contributions with salary ceiling
  const cappedSalary = Math.min(salary, 6000);
  const cpfContribution = cappedSalary * empRate;
  const employerCpfContribution = cappedSalary * emplRate;

  // Allocate to accounts
  const allocation = allocateCpfContributions(
    cpfContribution + employerCpfContribution,
    projectedAge
  );

  // Calculate take-home
  const takeHome = salary - cpfContribution;

  return {
    age: projectedAge,
    cpfContribution,
    employerCpfContribution,
    oaContribution: allocation.OA,
    saContribution: allocation.SA,
    maContribution: allocation.MA,
    takeHome
  };
}
```

### Example 2: Comprehensive Retirement Planning

```javascript
import { analyzeRetirementReadiness } from './scenarioModeling';
import { calculateRetirementCorpus } from './investmentCalculations';
import { calculateInflationAdjustedRetirement } from './inflationCalculations';

function planRetirement(currentData, retirementAge) {
  // Step 1: Adjust for inflation
  const inflationAdjusted = calculateInflationAdjustedRetirement(
    currentData.monthlyExpenses,
    retirementAge - currentData.age,
    30,
    2.3
  );

  // Step 2: Calculate required corpus
  const corpus = calculateRetirementCorpus(
    inflationAdjusted.futureMonthlyExpenses,
    30,
    2.3,
    4
  );

  // Step 3: Assess readiness
  const readiness = analyzeRetirementReadiness(
    currentData,
    retirementAge,
    currentData.age,
    inflationAdjusted.futureMonthlyExpenses
  );

  return {
    inflationAdjusted,
    requiredCorpus: corpus.recommendedCorpus,
    readiness
  };
}
```

### Example 3: Housing Purchase Analysis

```javascript
import { analyzeHousingAffordability } from './scenarioModeling';
import { simulateJobLoss } from './scenarioModeling';

function comprehensiveHousingAnalysis(housingParams, financialData) {
  // Affordability check
  const affordability = analyzeHousingAffordability(housingParams, financialData);

  if (!affordability.verdict === 'Affordable') {
    return { canAfford: false, reason: affordability.recommendations };
  }

  // Stress test: Job loss scenario
  const newMonthlyExpenses = financialData.monthlyExpenses + affordability.monthlyPayment;
  const stressTest = simulateJobLoss(
    {
      ...financialData,
      monthlyExpenses: newMonthlyExpenses
    },
    6, // 6 months unemployment
    0
  );

  return {
    canAfford: true,
    affordability,
    emergencyFundSufficiency: !stressTest.analysis.needsEmergencyAction,
    recommendation: stressTest.analysis.needsEmergencyAction ?
      'Build larger emergency fund before purchase' :
      'Proceed with purchase'
  };
}
```

---

## Testing

All calculation modules have comprehensive test coverage:

### Run Tests
```bash
# All calculation tests
npm test -- --testPathPattern="calculations"

# Specific module
npm test -- --testPathPattern="loanCalculations.test"
npm test -- --testPathPattern="cpf-age-transitions.test"
```

### Test Coverage
- ✅ CPF age transitions (11 tests)
- ✅ Edge cases and boundary conditions
- ✅ Multi-year projections
- ✅ Singapore-specific rules

---

## Accuracy & Sources

All calculations are based on official Singapore government sources:

- **CPF Rates:** [CPF Board 2025](https://www.cpf.gov.sg)
- **Tax Rates:** [IRAS YA 2025](https://www.iras.gov.sg)
- **Inflation Data:** Singapore Department of Statistics
- **Loan Formulas:** Standard financial mathematics
- **Investment Returns:** Historical Singapore market data

**Last Updated:** January 2025

---

## Future Enhancements

Planned additions:
- [ ] SRS (Supplementary Retirement Scheme) integration
- [ ] CPF LIFE payout calculations
- [ ] Property stamp duty calculator
- [ ] GST Voucher/CDC Voucher tracking
- [ ] Multi-currency support
- [ ] Historical data backtesting

---

For implementation details, see individual module files in `src/services/calculations/`.