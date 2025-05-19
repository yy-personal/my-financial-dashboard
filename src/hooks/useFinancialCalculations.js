import { useState, useEffect, useMemo } from "react";
import { useFinancial } from "../context/FinancialContext";
import useProjection from "./useProjection";
import useMilestones from "./useMilestones";
import useErrorHandler from "./useErrorHandler";
import { mapFinancialDataForCalculations } from "../adapters/FinancialDataAdapter";
import { 
  safeGet, 
  safeParseNumber, 
  safeDivide, 
  validateFinancialData,
  getCPFRatesByAge,
  allocateCPFContribution,
  getCPFContributionCaps
} from "../utils/errors/ErrorUtils";

/**
 * useFinancialCalculations hook
 * Custom hook for financial calculations and projections
 * 
 * @returns {Object} Financial calculation results and helper functions
 */
const useFinancialCalculations = () => {
  const { financialData: contextData, updateFinancialData } = useFinancial();
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

  // Adapt the financial data to the format expected by this hook
  const financialData = useMemo(() => {
    return mapFinancialDataForCalculations(contextData);
  }, [contextData]);
  
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
      const age = safeParseNumber(safeGet(personalInfo, 'age', 35));
      
      // Get age-based CPF rates
      const { employeeRate, employerRate } = getCPFRatesByAge(age);
      
      // Use specified rates if available, otherwise use age-based defaults
      const defaultCpfContributionRate = safeParseNumber(safeGet(personalInfo, 'cpfContributionRate', employeeRate));
      const defaultEmployerCpfRate = safeParseNumber(safeGet(personalInfo, 'employerCpfContributionRate', employerRate));

      // Get CPF account balances
      const cpfOrdinaryAccount = safeParseNumber(safeGet(financialInfo, 'cpfOrdinaryAccount', 0));
      const cpfSpecialAccount = safeParseNumber(safeGet(financialInfo, 'cpfSpecialAccount', 0));
      const cpfMedisaveAccount = safeParseNumber(safeGet(financialInfo, 'cpfMedisaveAccount', 0));
      const totalCpfBalance = cpfOrdinaryAccount + cpfSpecialAccount + cpfMedisaveAccount;
      
      return {
        salary: safeParseNumber(safeGet(personalInfo, 'monthlySalary', 0)),
        age,
        cpfContributionRate: defaultCpfContributionRate,
        employerCpfContributionRate: defaultEmployerCpfRate,
        monthlyExpenses: safeParseNumber(safeGet(financialInfo, 'monthlyExpenses', 0)),
        loanPayment: safeParseNumber(safeGet(personalInfo, 'monthlyRepayment', 0)),
        loanRemaining: safeParseNumber(safeGet(financialInfo, 'housingLoanRemaining', 0)),
        liquidCash: safeParseNumber(safeGet(financialInfo, 'liquidCash', 0)),
        cpfOrdinaryAccount,
        cpfSpecialAccount,
        cpfMedisaveAccount,
        cpfBalance: totalCpfBalance,
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
        age,
        cpfContributionRate, 
        employerCpfContributionRate, 
        monthlyExpenses, 
        loanPayment,
        cpfOrdinaryAccount,
        cpfSpecialAccount,
        cpfMedisaveAccount,
        cpfBalance
      } = currentValues;

      // Get CPF contribution caps
      const cpfCaps = getCPFContributionCaps();
      const { ordinaryWageCeiling } = cpfCaps;
      
      // Apply Ordinary Wage Ceiling to salary for CPF calculation
      const cpfApplicableSalary = Math.min(salary, ordinaryWageCeiling);
  
      // Calculate CPF contributions
      const cpfContribution = safeDivide(cpfApplicableSalary * cpfContributionRate, 100, 0);
      const employerCpfContribution = safeDivide(cpfApplicableSalary * employerCpfContributionRate, 100, 0);
      const totalCpfContribution = cpfContribution + employerCpfContribution;
      
      // Allocate CPF contributions to different accounts
      const cpfAllocation = allocateCPFContribution(totalCpfContribution, age);
      
      // Calculate take-home pay and savings
      const takeHomePay = salary - cpfContribution;
      const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
      
      // Calculate savings rate as a percentage of take-home pay
      // Use safeDivide to avoid division by zero
      const savingsRate = safeDivide(monthlySavings, takeHomePay, 0) * 100;
      
      // Calculate total monthly income including employer CPF
      const totalMonthlyIncome = salary + employerCpfContribution;

      // Calculate CPF percentages
      const cpfOrdinaryPercentage = safeDivide(cpfOrdinaryAccount, cpfBalance, 0) * 100;
      const cpfSpecialPercentage = safeDivide(cpfSpecialAccount, cpfBalance, 0) * 100;
      const cpfMedisavePercentage = safeDivide(cpfMedisaveAccount, cpfBalance, 0) * 100;
      
      // Calculate projected CPF after 1 month
      const projectedOrdinaryAccount = cpfOrdinaryAccount + cpfAllocation.ordinary;
      const projectedSpecialAccount = cpfSpecialAccount + cpfAllocation.special;
      const projectedMedisaveAccount = cpfMedisaveAccount + cpfAllocation.medisave;
  
      return {
        // Basic financial metrics
        currentSalary: salary,
        cpfContribution,
        employerCpfContribution,
        totalCpfContribution,
        takeHomePay,
        monthlyExpenses,
        loanPayment,
        monthlySavings,
        savingsRate,
        totalMonthlyIncome,
        
        // CPF details
        cpfOrdinaryAccount,
        cpfSpecialAccount,
        cpfMedisaveAccount,
        cpfOrdinaryPercentage,
        cpfSpecialPercentage,
        cpfMedisavePercentage,
        
        // CPF allocations
        cpfOrdinaryAllocation: cpfAllocation.ordinary,
        cpfSpecialAllocation: cpfAllocation.special,
        cpfMedisaveAllocation: cpfAllocation.medisave,
        
        // Projected CPF after 1 month
        projectedOrdinaryAccount,
        projectedSpecialAccount,
        projectedMedisaveAccount,
        
        // CPF caps and limits
        cpfCaps
      };
    }, [], { source: 'financialMetrics calculation' });
  }, [currentValues, tryCatch]);

  // Calculate asset allocation data for charts/displays
  useEffect(() => {
    if (!currentValues) return;
    
    try {
      const { 
        liquidCash, 
        cpfOrdinaryAccount, 
        cpfSpecialAccount, 
        cpfMedisaveAccount 
      } = currentValues;
      
      // Use safeParseNumber to ensure we have valid numbers
      const safeLC = safeParseNumber(liquidCash, 0);
      const safeOA = safeParseNumber(cpfOrdinaryAccount, 0);
      const safeSA = safeParseNumber(cpfSpecialAccount, 0);
      const safeMA = safeParseNumber(cpfMedisaveAccount, 0);
      
      // Calculate total assets
      const totalCPF = safeOA + safeSA + safeMA;
      const totalAssets = safeLC + totalCPF;
      
      if (totalAssets === 0) {
        setAssetAllocationData([
          { name: "Liquid Cash", value: 0, percentage: 0 },
          { name: "CPF Ordinary Account", value: 0, percentage: 0, group: "CPF" },
          { name: "CPF Special Account", value: 0, percentage: 0, group: "CPF" },
          { name: "CPF Medisave Account", value: 0, percentage: 0, group: "CPF" }
        ]);
        return;
      }
      
      // Calculate percentages safely using safeDivide
      const liquidCashPercentage = safeDivide(safeLC, totalAssets, 0) * 100;
      const cpfOAPercentage = safeDivide(safeOA, totalAssets, 0) * 100;
      const cpfSAPercentage = safeDivide(safeSA, totalAssets, 0) * 100;
      const cpfMAPercentage = safeDivide(safeMA, totalAssets, 0) * 100;
      
      // Include both the values and percentages in the data
      setAssetAllocationData([
        { name: "Liquid Cash", value: safeLC, percentage: liquidCashPercentage },
        { name: "CPF Ordinary Account", value: safeOA, percentage: cpfOAPercentage, group: "CPF" },
        { name: "CPF Special Account", value: safeSA, percentage: cpfSAPercentage, group: "CPF" },
        { name: "CPF Medisave Account", value: safeMA, percentage: cpfMAPercentage, group: "CPF" }
      ]);
    } catch (error) {
      handleError(error, { source: 'asset allocation calculation' });
      setAssetAllocationData([
        { name: "Liquid Cash", value: 0, percentage: 0 },
        { name: "CPF Ordinary Account", value: 0, percentage: 0, group: "CPF" },
        { name: "CPF Special Account", value: 0, percentage: 0, group: "CPF" },
        { name: "CPF Medisave Account", value: 0, percentage: 0, group: "CPF" }
      ]);
    }
  }, [currentValues, handleError, safeParseNumber, safeDivide]);

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
    
    // CPF details
    cpfOrdinaryAccount: currentValues?.cpfOrdinaryAccount || 0,
    cpfSpecialAccount: currentValues?.cpfSpecialAccount || 0,
    cpfMedisaveAccount: currentValues?.cpfMedisaveAccount || 0,
    cpfTotalSavings: currentValues?.cpfBalance || 0,
    
    // Total assets
    totalAssets: (currentValues?.liquidCash || 0) + (currentValues?.cpfBalance || 0),
    
    // CPF account percentages (of total CPF)
    cpfOrdinaryPercentage: currentValues ? 
      safeDivide(currentValues.cpfOrdinaryAccount, Math.max(0.01, currentValues.cpfBalance), 0) * 100 : 0,
    cpfSpecialPercentage: currentValues ? 
      safeDivide(currentValues.cpfSpecialAccount, Math.max(0.01, currentValues.cpfBalance), 0) * 100 : 0,
    cpfMedisavePercentage: currentValues ? 
      safeDivide(currentValues.cpfMedisaveAccount, Math.max(0.01, currentValues.cpfBalance), 0) * 100 : 0,
    
    // Asset percentages (of total assets)
    liquidCashPercentage: currentValues ? 
      safeDivide(currentValues.liquidCash, Math.max(0.01, currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    cpfPercentage: currentValues ? 
      safeDivide(currentValues.cpfBalance, Math.max(0.01, currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    
    // CPF monthly contributions
    cpfContribution: financialMetrics.cpfContribution || 0,
    employerCpfContribution: financialMetrics.employerCpfContribution || 0,
    totalCpfContribution: financialMetrics.totalCpfContribution || 0,
    
    // Monthly CPF allocations
    cpfOrdinaryAllocation: financialMetrics.cpfOrdinaryAllocation || 0,
    cpfSpecialAllocation: financialMetrics.cpfSpecialAllocation || 0,
    cpfMedisaveAllocation: financialMetrics.cpfMedisaveAllocation || 0,
    
    // Projected CPF balances (after 1 month)
    projectedOrdinaryAccount: financialMetrics.projectedOrdinaryAccount || 0,
    projectedSpecialAccount: financialMetrics.projectedSpecialAccount || 0,
    projectedMedisaveAccount: financialMetrics.projectedMedisaveAccount || 0,
    
    // Data for UI components
    assetAllocationData,
    expenseData,
    upcomingEvents,
    milestones,
    
    // CPF contribution caps
    cpfContributionCaps: financialMetrics.cpfCaps || getCPFContributionCaps(),
    
    // Settings
    projectionSettings,
    updateProjectionSettings: updateSettings
  };
};

export default useFinancialCalculations;