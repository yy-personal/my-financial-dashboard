import { useState, useEffect, useMemo } from "react";
import { useFinancial } from "../context/FinancialContext";
import useProjection from "./useProjection";
import useMilestones from "./useMilestones";
import useErrorHandler from "./useErrorHandler";
import { safeGet, safeParseNumber, safeDivide, validateFinancialData } from "../utils/errors/ErrorUtils";

/**
 * Enhanced useFinancialCalculations hook with dynamic current month detection
 * and manual current savings updates for better projections
 * 
 * @returns {Object} Financial calculation results and helper functions
 */
const useFinancialCalculations = () => {
  const { financialData, updateFinancialData } = useFinancial();
  const [expenseData, setExpenseData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [projectionStartDate, setProjectionStartDate] = useState(null);
  
  // Initialize error handler
  const { 
    error: calculationError, 
    hasError: hasCalculationError,
    handleError,
    clearError,
    tryCatch 
  } = useErrorHandler('useFinancialCalculations');
  
  // Dynamically determine current month and projection start
  useEffect(() => {
    const now = new Date();
    const currentMonthData = {
      month: now.getMonth() + 1, // JavaScript months are 0-indexed
      year: now.getFullYear(),
      day: now.getDate(),
      formatted: now.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    };
    setCurrentMonth(currentMonthData);
    
    // Set projection start to current month
    setProjectionStartDate(currentMonthData);
  }, []);
  
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

  // ENHANCED: Function to determine current salary based on new salary adjustments array
  const getCurrentSalary = (income, currentMonth) => {
    if (!income || !currentMonth) return 0;

    let currentSalary = safeParseNumber(income.currentSalary, 0);
    
    // NEW LOGIC: Use the salaryAdjustments array if it exists and has entries
    if (income.salaryAdjustments && Array.isArray(income.salaryAdjustments) && income.salaryAdjustments.length > 0) {
      const currentDate = new Date(currentMonth.year, currentMonth.month - 1, 1);
      
      // Sort salary adjustments by date to find the most recent applicable one
      const applicableAdjustments = income.salaryAdjustments
        .map(adj => ({
          ...adj,
          date: new Date(adj.year, adj.month - 1, 1),
          newSalary: safeParseNumber(adj.newSalary, 0)
        }))
        .filter(adj => adj.date <= currentDate) // Only past or current adjustments
        .sort((a, b) => b.date - a.date); // Sort by most recent first
      
      if (applicableAdjustments.length > 0) {
        currentSalary = applicableAdjustments[0].newSalary;
      }
    } 
    // FALLBACK: Only use old format if new format is empty or doesn't exist
    else if (income.salaryAdjustmentMonth && income.salaryAdjustmentYear && income.futureSalary) {
      const adjustmentDate = new Date(income.salaryAdjustmentYear, income.salaryAdjustmentMonth - 1, 1);
      const currentDate = new Date(currentMonth.year, currentMonth.month - 1, 1);
      
      if (currentDate >= adjustmentDate) {
        currentSalary = safeParseNumber(income.futureSalary, currentSalary);
      }
    }

    return currentSalary;
  };

  // Get current values from financial data with enhanced logic
  const currentValues = useMemo(() => {
    if (!financialData || !currentMonth) return null;

    // Use tryCatch to safely extract values
    return tryCatch(() => {
      const { personalInfo = {}, income = {}, expenses = [] } = financialData;
      
      // Default values if data is missing
      const defaultCpfContributionRate = 20; // 20% employee contribution
      const defaultEmployerCpfRate = 17; // 17% employer contribution

      // Calculate total monthly expenses from expenses array
      const totalMonthlyExpenses = Array.isArray(expenses) 
        ? expenses.reduce((total, expense) => total + safeParseNumber(expense.amount, 0), 0)
        : 0;

      // ENHANCED: Use the new getCurrentSalary function
      const currentSalary = getCurrentSalary(income, currentMonth);

      return {
        salary: currentSalary,
        cpfContributionRate: safeParseNumber(income.cpfRate, defaultCpfContributionRate),
        employerCpfContributionRate: safeParseNumber(income.employerCpfRate, defaultEmployerCpfRate),
        monthlyExpenses: totalMonthlyExpenses,
        loanPayment: safeParseNumber(personalInfo.monthlyRepayment, 0),
        loanRemaining: safeParseNumber(personalInfo.remainingLoan, 0),
        liquidCash: safeParseNumber(personalInfo.currentSavings, 0),
        cpfBalance: safeParseNumber(personalInfo.currentCpfBalance, 0),
        interestRate: safeParseNumber(personalInfo.interestRate, 0),
        salaryDay: safeParseNumber(income.salaryDay, 25), // Add salary day for timing calculations
        // Add projection timing info
        projectionStartMonth: currentMonth.month,
        projectionStartYear: currentMonth.year,
        currentDay: currentMonth.day
      };
    }, [], { source: 'currentValues calculation' });
  }, [financialData, currentMonth, tryCatch]);

  // Enhanced projection settings with current month awareness
  const defaultSettings = useMemo(() => {
    if (!currentMonth) return {};
    
    return {
      annualSalaryIncrease: 3.0, // 3% annual salary increase
      annualExpenseIncrease: 2.0, // 2% expense increase (inflation)
      annualInvestmentReturn: 4.0, // 4% investment return
      annualCpfInterestRate: 2.5, // 2.5% CPF interest rate
      projectionYears: 30, // Project 30 years into the future
      bonusMonths: 2, // 2 months of bonus
      bonusAmount: currentValues?.salary || 0, // Default to 1 month of salary
      // Add current month context
      projectionStartMonth: currentMonth.month,
      projectionStartYear: currentMonth.year,
      // ENHANCED: Use the new salary adjustments array
      yearlyBonuses: financialData?.yearlyBonuses || [],
      salaryAdjustments: financialData?.income?.salaryAdjustments || []
    };
  }, [currentMonth, currentValues, financialData]);

  // Use our custom projection hook with enhanced settings
  const {
    projectionData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    settings: projectionSettings,
    updateSettings,
    error: projectionError
  } = useProjection(currentValues, defaultSettings);

  // Use our custom milestones hook
  const { milestones } = useMilestones([], {
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    currentLiquidCash: currentValues?.liquidCash,
    currentAge: financialData?.personalInfo ? calculateCurrentAge() : null
  });

  // Calculate current age based on birthday and current month
  const calculateCurrentAge = () => {
    if (!financialData?.personalInfo?.birthday || !currentMonth) return null;
    
    const { month: birthMonth, year: birthYear } = financialData.personalInfo.birthday;
    const currentYear = currentMonth.year;
    const currentMonthNum = currentMonth.month;
    
    let age = currentYear - birthYear;
    
    // Adjust if birthday hasn't occurred yet this year
    if (currentMonthNum < birthMonth || 
        (currentMonthNum === birthMonth && currentMonth.day < 15)) {
      age--;
    }
    
    return age;
  };

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
      const cpfContribution = salary * (cpfContributionRate / 100);
      const employerCpfContribution = salary * (employerCpfContributionRate / 100);
      
      // Calculate take-home pay and savings
      const takeHomePay = salary - cpfContribution;
      const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
      
      // Calculate savings rate as a percentage of take-home pay
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

  // ENHANCED: Function to clear old salary adjustment fields when updating to new system
  const clearOldSalaryAdjustmentFields = () => {
    const updatedIncome = {
      ...financialData.income,
      futureSalary: undefined,
      salaryAdjustmentMonth: undefined,
      salaryAdjustmentYear: undefined
    };
    
    updateFinancialData({
      income: updatedIncome
    });
  };

  // Function to update current savings (liquid cash) for better projections
  const updateCurrentSavings = (newSavingsAmount) => {
    const updatedPersonalInfo = {
      ...financialData.personalInfo,
      currentSavings: safeParseNumber(newSavingsAmount, 0)
    };
    
    updateFinancialData({
      personalInfo: updatedPersonalInfo
    });
  };

  // Function to update current CPF balance
  const updateCurrentCpfBalance = (newCpfBalance) => {
    const updatedPersonalInfo = {
      ...financialData.personalInfo,
      currentCpfBalance: safeParseNumber(newCpfBalance, 0)
    };
    
    updateFinancialData({
      personalInfo: updatedPersonalInfo
    });
  };


  // Function to set a custom projection start date
  const setCustomProjectionStart = (month, year) => {
    const customStartDate = {
      month: safeParseNumber(month, currentMonth?.month || 1),
      year: safeParseNumber(year, currentMonth?.year || new Date().getFullYear()),
      day: 1,
      formatted: new Date(year, month - 1, 1).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    };
    setProjectionStartDate(customStartDate);
    
    // Update projection settings
    updateSettings({
      projectionStartMonth: customStartDate.month,
      projectionStartYear: customStartDate.year
    });
  };

  // Calculate asset allocation data for charts/displays
  useEffect(() => {
    if (!currentValues) return;
    
    try {
      const { liquidCash, cpfBalance } = currentValues;
      const safeLC = safeParseNumber(liquidCash, 0);
      const safeCPF = safeParseNumber(cpfBalance, 0);
      const totalAssets = safeLC + safeCPF;
      
      if (totalAssets === 0) {
        setAssetAllocationData([
          { name: "Liquid Cash", value: 0, percentage: 0 },
          { name: "CPF Savings", value: 0, percentage: 0 }
        ]);
        return;
      }
      
      // Calculate percentages safely using safeDivide
      const liquidCashPercentage = safeDivide(safeLC, totalAssets, 0) * 100;
      const cpfPercentage = safeDivide(safeCPF, totalAssets, 0) * 100;
      
      setAssetAllocationData([
        { name: "Liquid Cash", value: safeLC, percentage: liquidCashPercentage },
        { name: "CPF Savings", value: safeCPF, percentage: cpfPercentage }
      ]);
    } catch (error) {
      handleError(error, { source: 'asset allocation calculation' });
      setAssetAllocationData([
        { name: "Liquid Cash", value: 0, percentage: 0 },
        { name: "CPF Savings", value: 0, percentage: 0 }
      ]);
    }
  }, [currentValues, handleError]);

  // Calculate expense breakdown data for charts/displays
  useEffect(() => {
    try {
      if (!financialData || !Array.isArray(financialData.expenses)) {
        setExpenseData([{ name: "No Data", value: 0 }]);
        return;
      }
      
      // Map expense items to chart format
      const expenses = financialData.expenses.map(item => ({
        name: item.name,
        value: safeParseNumber(item.amount, 0)
      }));
      
      // Add loan payment if available
      if (currentValues?.loanPayment && currentValues.loanPayment > 0) {
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

  // Generate upcoming financial events with current month awareness
  useEffect(() => {
    try {
      if (!loanPaidOffMonth && !savingsGoalReachedMonth && !projectionData && !currentMonth) {
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
          importance: "high",
          monthsFromNow: loanPaidOffMonth.month || 0
        });
      }
      
      // Add savings goal event
      if (savingsGoalReachedMonth) {
        events.push({
          id: "savings-goal",
          title: "$100K Savings Goal Reached",
          date: savingsGoalReachedMonth.date,
          type: "milestone",
          importance: "high",
          monthsFromNow: savingsGoalReachedMonth.month || 0
        });
      }

      // Add yearly bonus events from context
      if (financialData?.yearlyBonuses && Array.isArray(financialData.yearlyBonuses)) {
        const currentYear = currentMonth?.year || new Date().getFullYear();
        const upcomingBonuses = financialData.yearlyBonuses.filter(bonus => {
          const bonusDate = new Date(bonus.year, bonus.month - 1, 1);
          const now = new Date(currentYear, (currentMonth?.month || 1) - 1, 1);
          return bonusDate >= now && bonusDate <= new Date(currentYear + 2, 11, 31);
        });

        upcomingBonuses.forEach(bonus => {
          const bonusDate = new Date(bonus.year, bonus.month - 1, 1);
          events.push({
            id: `bonus-${bonus.id}`,
            title: `${bonus.description}: $${bonus.amount.toLocaleString()}`,
            date: bonusDate.toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            }),
            type: "income",
            importance: "medium",
            amount: bonus.amount
          });
        });
      }
      
      // Add bonus month events from projections (next 12 months only)
      if (projectionData && projectionData.length > 0) {
        projectionData
          .slice(0, 12) // Look at next 12 months only
          .filter(month => month.isBonus && month.bonusAmount > 0)
          .forEach(month => {
            events.push({
              id: `bonus-projected-${month.date}`,
              title: `Projected Bonus: $${month.bonusAmount.toLocaleString()}`,
              date: month.date,
              type: "income",
              importance: "medium",
              projected: true
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
  }, [loanPaidOffMonth, savingsGoalReachedMonth, projectionData, currentMonth, financialData, handleError]);

  return {
    // Error state
    calculationError,
    hasCalculationError,
    clearCalculationError: clearError,
    projectionError,
    
    // Current month and timing info
    currentMonth,
    projectionStartDate,
    currentAge: calculateCurrentAge(),
    
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
      safeDivide(currentValues.liquidCash, Math.max(0.01, currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    cpfPercentage: currentValues ? 
      safeDivide(currentValues.cpfBalance, Math.max(0.01, currentValues.liquidCash + currentValues.cpfBalance), 0) * 100 : 0,
    
    // Data for UI components
    expenseData,
    upcomingEvents,
    milestones,
    
    // Settings and update functions
    projectionSettings,
    updateProjectionSettings: updateSettings,
    
    // ENHANCED: New update functions for manual savings/CPF adjustments
    updateCurrentSavings,
    updateCurrentCpfBalance,
    setCustomProjectionStart,
    clearOldSalaryAdjustmentFields, // NEW function to clear old fields
    
    // Enhanced utility functions
    formatCurrency: (amount) => `$${safeParseNumber(amount, 0).toLocaleString()}`,
    formatPercentage: (percentage) => `${safeParseNumber(percentage, 0).toFixed(1)}%`,
    
    // Projection insights
    getProjectionInsights: () => {
      if (!projectionData || !projectionData.length) return null;
      
      const lastProjection = projectionData[projectionData.length - 1];
      const firstProjection = projectionData[0];
      
      return {
        totalGrowth: lastProjection.totalNetWorth - firstProjection.totalNetWorth,
        averageMonthlySavings: projectionData.reduce((sum, p) => sum + p.monthlySavings, 0) / projectionData.length,
        totalInvestmentReturns: projectionData.reduce((sum, p) => sum + (p.investmentReturn || 0), 0),
        totalCpfInterest: projectionData.reduce((sum, p) => sum + (p.cpfInterest || 0), 0),
        salaryGrowth: lastProjection.fullMonthlySalary - firstProjection.fullMonthlySalary,
        projectedNetWorthIn5Years: projectionData[Math.min(59, projectionData.length - 1)]?.totalNetWorth || 0,
        projectedNetWorthIn10Years: projectionData[Math.min(119, projectionData.length - 1)]?.totalNetWorth || 0
      };
    }
  };
};

export default useFinancialCalculations;