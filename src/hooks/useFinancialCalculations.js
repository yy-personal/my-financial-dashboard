import { useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { calculateProjection, calculateTimeToMilestone, getUpcomingFinancialEvents } from '../services/calculations/financialCalculations';
import { getMonthName } from '../services/formatters/dateFormatters';

/**
 * Custom hook for financial calculations
 * 
 * @returns {Object} Financial calculation results and derived data
 */
const useFinancialCalculations = () => {
  const {
    financialData,
    totalExpenses,
    calculateAge,
  } = useFinancial();

  // Memoize the projection calculation since it's expensive
  const { projection, loanPaidOffMonth, savingsGoalReachedMonth } = useMemo(() => {
    return calculateProjection(financialData, totalExpenses);
  }, [financialData, totalExpenses]);

  // Calculate time to reach milestones
  const timeToPayLoan = calculateTimeToMilestone(loanPaidOffMonth);
  const timeToSavingsGoal = calculateTimeToMilestone(savingsGoalReachedMonth);

  // Current monthly income & expenses breakdown
  const currentSalary = financialData.income.currentSalary;
  const cpfContribution = currentSalary * (financialData.income.cpfRate / 100);
  const employerCpfContribution = currentSalary * (financialData.income.employerCpfRate / 100);
  const takeHomePay = currentSalary - cpfContribution;
  const monthlyExpenses = totalExpenses;
  const loanPayment = financialData.personalInfo.monthlyRepayment;
  const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
  const savingsRate = monthlySavings / takeHomePay;
  const totalMonthlyIncome = currentSalary + employerCpfContribution;

  // Calculate total yearly bonuses for current year
  const currentYear = new Date().getFullYear();
  const yearlyBonusesThisYear = financialData.yearlyBonuses
    ? financialData.yearlyBonuses
        .filter((bonus) => bonus.year === currentYear)
        .reduce((total, bonus) => total + bonus.amount, 0)
    : 0;

  // Filtered data for charts (every 3 months)
  const chartData = projection.filter((item, index) => index % 3 === 0);

  // Calculate asset allocation
  const liquidCash = financialData.personalInfo.currentSavings;
  const cpfSavings = financialData.personalInfo.currentCpfBalance || 0;
  const totalAssets = liquidCash + cpfSavings;

  const liquidCashPercentage = totalAssets > 0 ? (liquidCash / totalAssets) * 100 : 0;
  const cpfPercentage = totalAssets > 0 ? (cpfSavings / totalAssets) * 100 : 0;

  // Asset allocation data for pie chart
  const assetAllocationData = [
    { name: "Liquid Cash", value: liquidCash },
    { name: "CPF (Locked)", value: cpfSavings },
  ];

  // Expense breakdown for pie chart
  const expenseData = [
    ...financialData.expenses.map((expense) => ({
      name: expense.name,
      value: expense.amount,
    })),
    {
      name: "Loan Payment",
      value: financialData.personalInfo.monthlyRepayment,
    },
  ];

  // Get upcoming financial events
  const upcomingEvents = getUpcomingFinancialEvents(
    financialData.income.salaryAdjustments,
    financialData.yearlyBonuses,
    3,
    getMonthName
  );

  return {
    projection,
    chartData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    currentSalary,
    cpfContribution,
    employerCpfContribution,
    takeHomePay,
    monthlyExpenses,
    loanPayment,
    monthlySavings,
    savingsRate,
    totalMonthlyIncome,
    yearlyBonusesThisYear,
    liquidCash,
    cpfSavings,
    totalAssets,
    liquidCashPercentage,
    cpfPercentage,
    assetAllocationData,
    expenseData,
    upcomingEvents
  };
};

export default useFinancialCalculations;
