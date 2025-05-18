/**
 * Calculates financial projection for the next 60 months (5 years)
 * 
 * @param {Object} financialData - Financial data from context
 * @param {Object} financialData.personalInfo - Personal information
 * @param {Object} financialData.income - Income information
 * @param {Array} financialData.expenses - Expenses information
 * @param {Array} financialData.yearlyBonuses - Yearly bonuses information
 * @param {number} totalExpenses - Sum of all expenses
 * @param {Function} getMonthName - Function to get month name from month number
 * @returns {Object} Projection data, loan payoff and savings goal information
 */
export const calculateFinancialProjection = (financialData, totalExpenses, getMonthName) => {
  const projection = [];

  // Extract values from context
  const { personalInfo, income, expenses, yearlyBonuses } = financialData;

  // Initial values
  let currentSavings = personalInfo.currentSavings;
  let loanRemaining = personalInfo.remainingLoan;
  let cpfBalance = personalInfo.currentCpfBalance || 0; // Use user-provided CPF balance
  const birthYear = personalInfo.birthday.year;
  const birthMonth = personalInfo.birthday.month;

  // Parameters
  let currentSalary = income.currentSalary;
  const cpfRate = income.cpfRate / 100;
  const employerCpfRate = income.employerCpfRate / 100;
  const monthlyExpenses = totalExpenses;
  const loanPayment = personalInfo.monthlyRepayment;
  const annualInterestRate = personalInfo.interestRate / 100;
  const monthlyInterestRate = annualInterestRate / 12;

  // Calculate months
  let startMonth = personalInfo.projectionStart.month;
  let startYear = personalInfo.projectionStart.year;

  // Get salary adjustments if available, or create from legacy data
  const salaryAdjustments = income.salaryAdjustments || [];

  // If using legacy format, convert to array format for compatibility
  if (!income.salaryAdjustments && income.futureSalary) {
    salaryAdjustments.push({
      month: income.salaryAdjustmentMonth,
      year: income.salaryAdjustmentYear,
      newSalary: income.futureSalary,
    });
  }

  // Sort salary adjustments by date
  const sortedAdjustments = [...salaryAdjustments].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Get yearly bonuses
  const sortedBonuses = yearlyBonuses
    ? [...yearlyBonuses].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
    : [];

  // Track milestones
  let loanPaidOffMonth = null;
  let savingsGoalReachedMonth = null; // This will now track only cash savings (excluding CPF)

  // Generate projection for 60 months (5 years)
  for (let month = 0; month < 60; month++) {
    const currentMonth = ((startMonth + month - 1) % 12) + 1;
    const currentYear =
      startYear + Math.floor((startMonth + month - 1) / 12);
    const monthYearStr = `${getMonthName(currentMonth).substring(
      0,
      3
    )} ${currentYear}`;

    // Calculate age
    let ageYears = currentYear - birthYear;
    let ageMonths = currentMonth - birthMonth;
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }
    const ageStr = `${ageYears}y ${ageMonths}m`;

    // Check for salary adjustments
    for (const adjustment of sortedAdjustments) {
      if (
        currentMonth === adjustment.month &&
        currentYear === adjustment.year
      ) {
        currentSalary = adjustment.newSalary;
        break;
      }
    }

    // Calculate take-home pay
    const cpfContribution = currentSalary * cpfRate;
    const employerCpf = currentSalary * employerCpfRate;
    const takeHomePay = currentSalary - cpfContribution;

    // Check for yearly bonuses in this month
    let bonusAmount = 0;
    let bonusDescription = "";

    for (const bonus of sortedBonuses) {
      if (
        currentMonth === bonus.month &&
        currentYear === bonus.year
      ) {
        bonusAmount += bonus.amount;
        bonusDescription = bonusDescription
          ? `${bonusDescription}, ${bonus.description}`
          : bonus.description;
      }
    }

    // Calculate loan payment and remaining balance
    let actualLoanPayment = loanPayment;
    let interestForMonth = loanRemaining * monthlyInterestRate;
    let principalPayment = Math.min(
      loanRemaining,
      loanPayment - interestForMonth
    );

    if (loanRemaining <= 0) {
      interestForMonth = 0;
      principalPayment = 0;
      actualLoanPayment = 0;
      loanRemaining = 0;
    } else {
      loanRemaining = Math.max(0, loanRemaining - principalPayment);
    }

    // Record loan paid off milestone
    if (loanRemaining === 0 && loanPaidOffMonth === null) {
      loanPaidOffMonth = month;
    }

    // Calculate monthly savings (including any bonuses)
    const monthlySavings =
      takeHomePay - monthlyExpenses - actualLoanPayment + bonusAmount;

    // Update balances
    cpfBalance += cpfContribution + employerCpf;
    currentSavings += monthlySavings;
    const totalNetWorth = currentSavings + cpfBalance - loanRemaining;

    // Record savings goal milestone - now only for cash savings (excluding CPF)
    if (currentSavings >= 100000 && savingsGoalReachedMonth === null) {
      savingsGoalReachedMonth = month;
    }

    // Create data point
    projection.push({
      month: month + 1,
      date: monthYearStr,
      age: ageStr,
      monthlySalary: currentSalary,
      takeHomePay: takeHomePay,
      expenses: monthlyExpenses,
      loanPayment: actualLoanPayment,
      loanRemaining: loanRemaining,
      monthlySavings: monthlySavings,
      bonusAmount: bonusAmount,
      bonusDescription: bonusDescription,
      cpfContribution: cpfContribution,
      employerCpfContribution: employerCpf,
      totalCpfContribution: cpfContribution + employerCpf,
      cpfBalance: cpfBalance,
      cashSavings: currentSavings,
      totalNetWorth: totalNetWorth,
      milestone:
        month === loanPaidOffMonth
          ? "Loan Paid Off"
          : month === savingsGoalReachedMonth
          ? "100K Cash Savings Goal"
          : bonusAmount > 0
          ? bonusDescription
          : null,
    });
  }

  return {
    projection,
    loanPaidOffMonth:
      loanPaidOffMonth !== null ? projection[loanPaidOffMonth] : null,
    savingsGoalReachedMonth:
      savingsGoalReachedMonth !== null
        ? projection[savingsGoalReachedMonth]
        : null,
  };
};

/**
 * Calculates the time in years and months until a milestone is reached
 * 
 * @param {Object} milestoneMonth - The month object when milestone is reached
 * @returns {string} Formatted time string or "Not within projection"
 */
export const calculateTimeToMilestone = (milestoneMonth) => {
  if (!milestoneMonth) return "Not within projection";
  
  return `${Math.floor(milestoneMonth.month / 12)} years ${
    milestoneMonth.month % 12
  } months`;
};

/**
 * Calculates upcoming financial events for the next specified number of months
 * 
 * @param {Array} salaryAdjustments - Salary adjustment events
 * @param {Array} yearlyBonuses - Yearly bonus events 
 * @param {number} currentMonth - Current month (1-12)
 * @param {number} currentYear - Current year
 * @param {number} monthsAhead - Number of months to look ahead (default: 3)
 * @param {Function} getMonthName - Function to get month name from number
 * @param {Function} formatCurrency - Function to format currency values
 * @returns {Array} Upcoming financial events
 */
export const calculateUpcomingEvents = (
  salaryAdjustments,
  yearlyBonuses,
  currentMonth,
  currentYear,
  monthsAhead = 3,
  getMonthName,
  formatCurrency
) => {
  const upcomingEvents = [];
  
  // Calculate the next X months period
  const nextMonths = [];
  for (let i = 0; i < monthsAhead; i++) {
    const month = ((currentMonth + i - 1) % 12) + 1;
    const year = currentYear + Math.floor((currentMonth + i - 1) / 12);
    nextMonths.push({ month, year });
  }

  // Find salary adjustments in next period
  if (salaryAdjustments) {
    salaryAdjustments.forEach((adjustment) => {
      const isUpcoming = nextMonths.some(
        (period) =>
          period.month === adjustment.month &&
          period.year === adjustment.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Salary Adjustment",
          date: `${getMonthName(adjustment.month)} ${
            adjustment.year
          }`,
          amount: adjustment.newSalary,
          description: `Salary changes to ${formatCurrency(
            adjustment.newSalary
          )}`,
        });
      }
    });
  }

  // Find bonuses in next period
  if (yearlyBonuses) {
    yearlyBonuses.forEach((bonus) => {
      const isUpcoming = nextMonths.some(
        (period) =>
          period.month === bonus.month && period.year === bonus.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Bonus",
          date: `${getMonthName(bonus.month)} ${bonus.year}`,
          amount: bonus.amount,
          description: bonus.description,
        });
      }
    });
  }
  
  return upcomingEvents;
};

/**
 * Prepares data for the expense breakdown chart and calculations
 * 
 * @param {Array} expenses - Expense items array
 * @param {number} monthlyRepayment - Monthly loan repayment amount
 * @returns {Array} Formatted expense data for charts and displays
 */
export const prepareExpenseData = (expenses, monthlyRepayment) => {
  return [
    ...expenses.map((expense) => ({
      name: expense.name,
      value: expense.amount,
    })),
    {
      name: "Loan Payment",
      value: monthlyRepayment,
    },
  ];
};

/**
 * Prepares data for the asset allocation chart
 * 
 * @param {number} liquidCash - Current liquid cash amount
 * @param {number} cpfSavings - Current CPF savings amount
 * @returns {Object} Asset allocation data and percentages
 */
export const prepareAssetAllocationData = (liquidCash, cpfSavings) => {
  const totalAssets = liquidCash + cpfSavings;
  
  const liquidCashPercentage = totalAssets > 0 ? (liquidCash / totalAssets) * 100 : 0;
  const cpfPercentage = totalAssets > 0 ? (cpfSavings / totalAssets) * 100 : 0;

  const assetAllocationData = [
    { name: "Liquid Cash", value: liquidCash },
    { name: "CPF (Locked)", value: cpfSavings },
  ];
  
  return {
    assetAllocationData,
    liquidCashPercentage,
    cpfPercentage,
    totalAssets
  };
};