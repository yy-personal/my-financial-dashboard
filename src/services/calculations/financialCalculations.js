import { getMonthName } from '../formatters/dateFormatters';

/**
 * Calculate financial projection based on provided financial data
 * 
 * @param {Object} financialData - The financial data object from context
 * @param {number} totalExpenses - The total monthly expenses
 * @returns {Object} - Projection data and milestone information
 */
export const calculateProjection = (financialData, totalExpenses) => {
  const projection = [];

  // Extract values from context
  const { personalInfo, income, yearlyBonuses } = financialData;

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
    const totalNetWorth = currentSavings + cpfBalance;

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
 * Calculate the time required to reach a financial milestone
 * 
 * @param {Object|null} milestoneMonth - The month when milestone is reached
 * @returns {string} - Formatted time string
 */
export const calculateTimeToMilestone = (milestoneMonth) => {
  if (!milestoneMonth) return "Not within projection";
  
  return `${Math.floor(milestoneMonth.month / 12)} years ${
    milestoneMonth.month % 12
  } months`;
};

/**
 * Calculate current age based on birthday
 * 
 * @param {Object} birthday - The birthday object with month and year
 * @returns {number} - Current age in years
 */
export const calculateAge = (birthday) => {
  const today = new Date();
  const birthMonth = birthday.month;
  const birthYear = birthday.year;

  let age = today.getFullYear() - birthYear;

  // Adjust age if birthday hasn't occurred yet this year
  if (
    today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < 15)
  ) {
    age--;
  }

  return age;
};

/**
 * Get upcoming financial events for the next n months
 * 
 * @param {Object[]} salaryAdjustments - Array of salary adjustment objects
 * @param {Object[]} yearlyBonuses - Array of yearly bonus objects
 * @param {number} monthsToLookAhead - Number of months to check
 * @param {Function} getMonthName - Function to get month name from number
 * @returns {Object[]} - Array of upcoming financial events
 */
export const getUpcomingFinancialEvents = (salaryAdjustments, yearlyBonuses, monthsToLookAhead = 3, getMonthName) => {
  const upcomingEvents = [];
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  // Create array of months to check
  const monthsToCheck = [];
  for (let i = 0; i < monthsToLookAhead; i++) {
    const checkMonth = (currentMonth + i) % 12 || 12; // Convert 0 to 12
    const checkYear = currentYear + Math.floor((currentMonth + i) / 12);
    monthsToCheck.push({ month: checkMonth, year: checkYear });
  }

  // Find salary adjustments in upcoming months
  if (salaryAdjustments) {
    salaryAdjustments.forEach((adjustment) => {
      const isUpcoming = monthsToCheck.some(
        (period) =>
          period.month === adjustment.month &&
          period.year === adjustment.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Salary Adjustment",
          date: `${getMonthName(adjustment.month)} ${adjustment.year}`,
          amount: adjustment.newSalary,
          description: `Salary changes to ${adjustment.newSalary}`
        });
      }
    });
  }

  // Find bonuses in upcoming months
  if (yearlyBonuses) {
    yearlyBonuses.forEach((bonus) => {
      const isUpcoming = monthsToCheck.some(
        (period) =>
          period.month === bonus.month && period.year === bonus.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Bonus",
          date: `${getMonthName(bonus.month)} ${bonus.year}`,
          amount: bonus.amount,
          description: bonus.description
        });
      }
    });
  }

  return upcomingEvents;
};
