import { useState, useEffect, useMemo } from "react";
import { useFinancial } from "../context/FinancialContext";
import useProjection from "./useProjection";
import useMilestones from "./useMilestones";
import useErrorHandler from "./useErrorHandler";
import { safeGet, safeParseNumber, safeDivide, validateFinancialData } from "../utils/errors/ErrorUtils";

/**
 * useFinancialCalculations hook
 * Custom hook for financial calculations and projections
 * 
 * @returns {Object} Financial calculation results and helper functions
 */
const useFinancialCalculations = () => {
  const { financialData, updateFinancialData } = useFinancial();
  const [expenseData, setExpenseData] = useState([]);
  const [assetAllocationData, setAssetAllocationData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Initialize error handler
  const { 
    error: calculationError, 
    hasError: hasCalculationError,
    handleError,
    clearError,
    tryCatch 
  } = useErrorHandler('useFinancialCalculations');
  
  // Validate financial data
  const { isValid: isDataValid, errors: dataValidationErrors } = 
    useMemo(() => validateFinancialData(financialData), [financialData]);
  
  // Set error if data is invalid
  useEffect(() => {
    if (!isDataValid && dataValidationErrors.length > 0) {
      handleError(new Error(`Invalid financial data: ${dataValidationErrors.join(', ')}`));
    } else {
      clearError();
    }
  }, [isDataValid, dataValidationErrors, handleError, clearError]);

  // Get current values from financial data
  const currentValues = useMemo(() => {
    if (!financialData) return null;

    // Use tryCatch to safely extract values
    return tryCatch(() => {
      const { personalInfo = {}, financialInfo = {} } = financialData;
      
      // Default values if data is missing
      const defaultCpfContributionRate = 20; // 20% employee contribution
      const defaultEmployerCpfRate = 17; // 17% employer contribution

      return {
        salary: safeParseNumber(safeGet(personalInfo, 'monthlySalary', 0)),
        cpfContributionRate: safeParseNumber(safeGet(personalInfo, 'cpfContributionRate', defaultCpfContributionRate)),
        employerCpfContributionRate: safeParseNumber(safeGet(personalInfo, 'employerCpfContributionRate', defaultEmployerCpfRate)),
        monthlyExpenses: safeParseNumber(safeGet(financialInfo, 'monthlyExpenses', 0)),
        loanPayment: safeParseNumber(safeGet(personalInfo, 'monthlyRepayment', 0)),
        loanRemaining: safeParseNumber(safeGet(financialInfo, 'housingLoanRemaining', 0)),
        liquidCash: safeParseNumber(safeGet(financialInfo, 'liquidCash', 0)),
        cpfBalance: safeParseNumber(safeGet(financialInfo, 'cpfOrdinaryAccount', 0)),
      };
    }, [], { source: 'currentValues calculation' });
  }, [financialData, tryCatch]);

  // Default projection settings
  const defaultSettings = {
    annualSalaryIncrease: 3.0, // 3% annual salary increase
    annualExpenseIncrease: 2.0, // 2% expense increase (inflation)
    annualInvestmentReturn: 4.0, // 4% investment return
    annualCpfInterestRate: 2.5, // 2.5% CPF interest rate
    projectionYears: 30, // Project 30 years into the future
    bonusMonths: 2, // 2 months of bonus
    bonusAmount: currentValues?.salary || 0 // Default to 1 month of salary
  };

  // Use our custom projection hook
  const {
    projectionData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    settings: projectionSettings,
    updateSettings
  } = useProjection(currentValues, defaultSettings);

  // Use our custom milestones hook
  const { milestones } = useMilestones([], {
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    currentLiquidCash: currentValues?.liquidCash,
    currentAge: financialData?.personalInfo?.age
  });

  // Calculate current financial metrics
  const financialMetrics = useMemo(() => {
    if (!currentValues) return {};
    
    // Use tryCatch to safely perform calculations
    return tryCatch(() => {
      const { 
        salary, 
        cpfContributionRate, 
        employerCpfContributionRate, 
        monthlyExpenses, 
        loanPayment 
      } = currentValues;
  
      // Calculate CPF contributions
      const cpfContribution = safeDivide(salary * cpfContributionRate, 100, 0);
      const employerCpfContribution = safeDivide(salary * employerCpfContributionRate, 100, 0);
      
      // Calculate take-home pay and savings
      const takeHomePay = salary - cpfContribution;
      const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
      
      // Calculate savings rate as a percentage of take-home pay
      // Use safeDivide to avoid division by zero
      const savingsRate = safeDivide(monthlySavings, takeHomePay, 0) * 100;
      
      // Calculate total monthly income including employer CPF
      const totalMonthlyIncome = salary + employerCpfContribution;
  
      return {
        currentSalary: salary,
        cpfContribution,
        employerCpfContribution,
        takeHomePay,
        monthlyExpenses,
        loanPayment,
        monthlySavings,
        savingsRate,
        totalMonthlyIncome
      };
    }, [], { source: 'financialMetrics calculation' });
  }, [currentValues, tryCatch]);

  // Calculate asset allocation data for charts/displays
  useEffect(() => {
    if (!currentValues) return;
    
    try {
      const { liquidCash, cpfBalance } = currentValues;
      const totalAssets = liquidCash + cpfBalance;
      
      if (totalAssets === 0) {
        setAssetAllocationData([
          { name: "Liquid Cash", value: 0 },
          { name: "CPF Savings", value: 0 }
        ]);
        return;
      }
      
      // Calculate percentages
      const liquidCashPercentage = (liquidCash / totalAssets) * 100;
      const cpfPercentage = (cpfBalance / totalAssets) * 100;
      
      setAssetAllocationData([
        { name: "Liquid Cash", value: liquidCash },
        { name: "CPF Savings", value: cpfBalance }
      ]);
    } catch (error) {
      handleError(error, { source: 'asset allocation calculation' });
      setAssetAllocationData([
        { name: "Liquid Cash", value: 0 },
        { name: "CPF Savings", value: 0 }
      ]);
    }
  }, [currentValues, handleError]);

  // Calculate expense breakdown data for charts/displays
  useEffect(() => {
    try {
      if (!financialData || !financialData.expenseItems) {
        setExpenseData([{ name: "No Data", value: 0 }]);
        return;
      }
      
      // Map expense items to chart format
      const expenses = financialData.expenseItems.map(item => ({
        name: item.category,
        value: safeParseNumber(item.amount, 0)
      }));
      
      // Add loan payment if available
      if (currentValues?.loanPayment) {
        expenses.push({
          name: "Loan Payment",
          value: currentValues.loanPayment
        });
      }
      
      setExpenseData(expenses);
    } catch (error) {
      handleError(error, { source: 'expense breakdown calculation' });
      setExpenseData([{ name: "Error", value: 0 }]);
    }
  }, [financialData, currentValues, handleError]);

  // Generate upcoming financial events
  useEffect(() => {
    try {
      if (!loanPaidOffMonth && !savingsGoalReachedMonth && !projectionData) {
        setUpcomingEvents([]);
        return;
      }
      
      const events = [];
      
      // Add loan payoff event
      if (loanPaidOffMonth) {
        events.push({
          id: "loan-payoff",
          title: "Loan Paid Off",
          date: loanPaidOffMonth.date,
          type: "milestone",
          importance: "high"
        });
      }
      
      // Add savings goal event
      if (savingsGoalReachedMonth) {
        events.push({
          id: "savings-goal",
          title: "$100K Savings Goal Reached",
          date: savingsGoalReachedMonth.date,
          type: "milestone",
          importance: "high"
        });
      }
      
      // Add bonus month events (next 12 months only)
      if (projectionData && projectionData.length > 0) {
        projectionData
          .slice(0, 12) // Look at next 12 months only
          .filter(month => month.isBonus && month.bonusAmount > 0)
          .forEach(month => {
            events.push({
              id: `bonus-${month.date}`,
              title: `Bonus Payment: ${month.bonusAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
              date: month.date,
              type: "income",
              importance: "medium"
            });
          });
      }
      
      // Sort events by date
      events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      setUpcomingEvents(events);
    } catch (error) {
      handleError(error, { source: 'upcoming events calculation' });
      setUpcomingEvents([]);
    }
  }, [loanPaidOffMonth, savingsGoalReachedMonth, projectionData, handleError]);

  return {
    // Error state
    calculationError,
    hasCalculationError,
    clearCalculationError: clearError,
    
    // Financial metrics
    ...financialMetrics,
    
    // Projection data
    projection: projectionData,
    chartData: projectionData ? projectionData.slice(0, 60) : [], // First 5 years for charts
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    
    // Asset details
    liquidCash: currentValues?.liquidCash || 0,
    cpfSavings: currentValues?.cpfBalance || 0,
    totalAssets: (currentValues?.liquidCash || 0) + (currentValues?.cpfBalance || 0),
    liquidCashPercentage: currentValues ? 
      safeDivide(currentValues.liquidCash, (currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    cpfPercentage: currentValues ? 
      safeDivide(currentValues.cpfBalance, (currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    
    // Data for UI components
    assetAllocationData,
    expenseData,
    upcomingEvents,
    milestones,
    
    // Settings
    projectionSettings,
    updateProjectionSettings: updateSettings
  };
};

export default useFinancialCalculations;