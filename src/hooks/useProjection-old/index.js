import { useState, useEffect, useCallback } from "react";
import { addMonths, format } from "date-fns";

/**
 * useProjection hook
 * Creates financial projections based on current financial data and projection settings
 * 
 * @param {Object} initialData - Current financial data
 * @param {Object} initialSettings - Projection settings
 * @returns {Object} Projected financial data and helper functions
 */
const useProjection = (initialData, initialSettings) => {
  const [projectionData, setProjectionData] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [loanPaidOffMonth, setLoanPaidOffMonth] = useState(null);
  const [savingsGoalReachedMonth, setSavingsGoalReachedMonth] = useState(null);
  const [timeToPayLoan, setTimeToPayLoan] = useState(null);
  const [timeToSavingsGoal, setTimeToSavingsGoal] = useState(null);

  // Function to update projection settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  // Generate projection data based on settings and current financial data
  const generateProjection = useCallback(() => {
    if (!initialData) return [];

    const {
      liquidCash,
      cpfBalance,
      loanRemaining,
      salary,
      monthlyExpenses,
      loanPayment,
      cpfContributionRate,
      employerCpfContributionRate
    } = initialData;

    const {
      annualSalaryIncrease,
      annualExpenseIncrease,
      annualInvestmentReturn,
      annualCpfInterestRate,
      projectionYears,
      bonusMonths,
      bonusAmount
    } = settings;

    // Monthly growth/increase rates (converted from annual)
    const monthlySalaryIncrease = Math.pow(1 + annualSalaryIncrease / 100, 1 / 12) - 1;
    const monthlyExpenseIncrease = Math.pow(1 + annualExpenseIncrease / 100, 1 / 12) - 1;
    const monthlyInvestmentReturn = Math.pow(1 + annualInvestmentReturn / 100, 1 / 12) - 1;
    const monthlyCpfInterestRate = Math.pow(1 + annualCpfInterestRate / 100, 1 / 12) - 1;

    // Arrays to store loan payoff and savings goal info
    let loanPaidOff = null;
    let savingsGoalReached = null;
    let monthsToPayLoan = null;
    let monthsToSavingsGoal = null;
    
    // Map of which months receive bonuses (e.g., month 12, 13 for year-end and Chinese New Year)
    // This is a simplified approach - in reality bonus months might vary
    const bonusMonthsMap = {};
    if (bonusMonths > 0) {
      // Month 12 (December) is common for year-end bonus
      bonusMonthsMap[12] = true;
      
      // If more than 1 bonus month, add others
      if (bonusMonths > 1) {
        // Month 2 (February) for Chinese New Year / annual variable bonus
        bonusMonthsMap[2] = true;
      }
      
      // If more than 2 bonus months, distribute the rest quarterly 
      // (just a simplified approach - adjust as needed)
      if (bonusMonths > 2) {
        bonusMonthsMap[5] = true; // May
      }
      
      if (bonusMonths > 3) {
        bonusMonthsMap[8] = true; // August
      }
    }

    // Create projection for each month
    const startDate = new Date();
    const projection = [];
    let currentSalary = salary;
    let currentMonthlyExpenses = monthlyExpenses;
    let currentLoanRemaining = loanRemaining;
    let currentCashSavings = liquidCash;
    let currentCpfBalance = cpfBalance;
    let month = 0;

    // Target savings goal (for example, $100,000)
    const savingsGoal = 100000;

    // Project for specified number of months
    const totalMonths = projectionYears * 12;
    
    while (month < totalMonths) {
      const currentDate = addMonths(startDate, month);
      const monthNumber = currentDate.getMonth() + 1; // 1-12 for Jan-Dec
      const formattedDate = format(currentDate, "MMM yyyy");
      
      // Check if this is a bonus month
      const isBonus = bonusMonthsMap[monthNumber] || false;
      const currentBonusAmount = isBonus ? bonusAmount : 0;
      
      // Calculate monthly income with potential bonus
      const monthlyIncome = currentSalary + currentBonusAmount;
      
      // Calculate CPF contributions
      const employeeCpfContribution = currentSalary * (cpfContributionRate / 100);
      const employerCpfContribution = currentSalary * (employerCpfContributionRate / 100);
      const totalCpfContribution = employeeCpfContribution + employerCpfContribution;
      
      // Calculate take-home pay (salary minus employee CPF)
      const takeHomePay = monthlyIncome - employeeCpfContribution;
      
      // Loan payment (if not fully paid)
      const currentMonthLoanPayment = currentLoanRemaining > 0 ? 
        Math.min(loanPayment, currentLoanRemaining) : 0;
      
      // Monthly savings
      const monthlySavings = takeHomePay - currentMonthlyExpenses - currentMonthLoanPayment;
      
      // Update loan remaining
      currentLoanRemaining = Math.max(0, currentLoanRemaining - currentMonthLoanPayment);
      
      // Update cash savings with monthly savings plus investment returns
      currentCashSavings = currentCashSavings * (1 + monthlyInvestmentReturn) + monthlySavings;
      
      // Update CPF balance with contribution and interest
      currentCpfBalance = currentCpfBalance * (1 + monthlyCpfInterestRate) + totalCpfContribution;
      
      // Calculate total net worth
      const totalNetWorth = currentCashSavings + currentCpfBalance - currentLoanRemaining;
      
      // Record when loan is fully paid off
      if (currentLoanRemaining === 0 && !loanPaidOff && loanRemaining > 0) {
        loanPaidOff = { 
          date: formattedDate, 
          month: month 
        };
        monthsToPayLoan = month + 1; // +1 because we're 0-indexed
      }
      
      // Record when savings goal is reached
      if (currentCashSavings >= savingsGoal && !savingsGoalReached) {
        savingsGoalReached = { 
          date: formattedDate, 
          month: month 
        };
        monthsToSavingsGoal = month + 1; // +1 because we're 0-indexed
      }
      
      // Add data point to projection
      projection.push({
        date: formattedDate,
        monthlyIncome,
        takeHomePay,
        monthlyExpenses: currentMonthlyExpenses,
        loanPayment: currentMonthLoanPayment,
        monthlySavings,
        cashSavings: currentCashSavings,
        cpfBalance: currentCpfBalance,
        loanRemaining: currentLoanRemaining,
        totalNetWorth,
        employeeCpfContribution,
        employerCpfContribution,
        totalCpfContribution,
        bonusAmount: currentBonusAmount,
        isBonus: isBonus
      });
      
      // Update for next month
      month++;
      
      // Apply monthly increases (compounding)
      currentSalary *= (1 + monthlySalaryIncrease);
      currentMonthlyExpenses *= (1 + monthlyExpenseIncrease);
    }
    
    // Update state with generated projection and milestones
    setProjectionData(projection);
    setLoanPaidOffMonth(loanPaidOff);
    setSavingsGoalReachedMonth(savingsGoalReached);
    setTimeToPayLoan(monthsToPayLoan);
    setTimeToSavingsGoal(monthsToSavingsGoal);

    return projection;
  }, [initialData, settings]);

  // Generate projection when input data or settings change
  useEffect(() => {
    generateProjection();
  }, [generateProjection]);

  return {
    projectionData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    settings,
    updateSettings,
    generateProjection
  };
};

export default useProjection;