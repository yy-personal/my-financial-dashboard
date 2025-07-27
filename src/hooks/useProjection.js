import { useState, useEffect, useCallback } from 'react';
import useErrorHandler from './useErrorHandler';
import { safeParseNumber, safeDivide, createFinancialError } from '../utils/errors/ErrorUtils';

/**
 * Enhanced useProjection hook with current month awareness
 * Automatically starts projections from the current month
 * Simplified to assume salary is received at the beginning of each month
 * 
 * @param {Object} initialData - Initial financial data
 * @param {Object} initialSettings - Projection settings
 * @returns {Object} - Enhanced projection data and utility functions
 */
const useProjection = (initialData, initialSettings) => {
  const [data, setData] = useState(initialData || {});
  const [settings, setSettings] = useState({
    projectionStartMonth: new Date().getMonth() + 1,
    projectionStartYear: new Date().getFullYear(),
    ...initialSettings
  });
  const [projectionData, setProjectionData] = useState([]);
  const [loanPaidOffMonth, setLoanPaidOffMonth] = useState(null);
  const [savingsGoalReachedMonth, setSavingsGoalReachedMonth] = useState(null);
  const [timeToPayLoan, setTimeToPayLoan] = useState('Not within projection');
  const [timeToSavingsGoal, setTimeToSavingsGoal] = useState('Not within projection');

  // Setup error handler for this hook
  const { 
    error, 
    hasError, 
    handleError, 
    clearError, 
    tryCatch 
  } = useErrorHandler('useProjection');

  // Validate input data and settings
  const validateInputs = useCallback(() => {
    if (!data) {
      handleError(createFinancialError(
        'No financial data provided for projection', 
        'missing_data'
      ));
      return false;
    }

    // Check for required fields
    const requiredFields = ['salary', 'cpfContributionRate', 'employerCpfContributionRate', 'monthlyExpenses'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    
    if (missingFields.length > 0) {
      handleError(createFinancialError(
        `Missing required fields for projection: ${missingFields.join(', ')}`, 
        'missing_data'
      ));
      return false;
    }

    // Check for negative values in key fields
    if (
      (data.salary !== undefined && data.salary < 0) ||
      (data.monthlyExpenses !== undefined && data.monthlyExpenses < 0) ||
      (data.loanPayment !== undefined && data.loanPayment < 0)
    ) {
      handleError(createFinancialError(
        'Negative values are not allowed for salary, expenses, or loan payments', 
        'negative_value'
      ));
      return false;
    }

    return true;
  }, [data, settings, handleError]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    try {
      setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
      clearError();
    } catch (error) {
      handleError(error, { source: 'updateSettings' });
    }
  }, [handleError, clearError]);

  // Check if current month already has bonus
  const getBonusForMonth = useCallback((year, month, yearlyBonuses = []) => {
    if (!Array.isArray(yearlyBonuses)) return 0;
    
    const bonus = yearlyBonuses.find(b => 
      b.year === year && b.month === month
    );
    
    return bonus ? safeParseNumber(bonus.amount, 0) : 0;
  }, []);

  // Generate enhanced projection with current month start
  const generateProjection = useCallback(() => {
    if (!validateInputs()) {
      return [];
    }

    return tryCatch(() => {
      const { 
        salary = 0, 
        cpfContributionRate = 20, 
        employerCpfContributionRate = 17, 
        monthlyExpenses = 0, 
        loanPayment = 0, 
        loanRemaining = 0, 
        liquidCash = 0, 
        cpfBalance = 0,
        interestRate = 0
      } = data;

      const { 
        annualSalaryIncrease = 3.0, 
        annualExpenseIncrease = 2.0, 
        annualInvestmentReturn = 4.0, 
        annualCpfInterestRate = 2.5, 
        projectionYears = 30,
        bonusMonths = 2,
        bonusAmount = safeParseNumber(settings.bonusAmount || salary, salary),
        projectionStartMonth = new Date().getMonth() + 1,
        projectionStartYear = new Date().getFullYear(),
        yearlyBonuses = []
      } = settings;

      // Convert annual rates to monthly
      const monthlySalaryIncrease = Math.pow(1 + annualSalaryIncrease / 100, 1 / 12) - 1;
      const monthlyExpenseIncrease = Math.pow(1 + annualExpenseIncrease / 100, 1 / 12) - 1;
      const monthlyInvestmentReturn = Math.pow(1 + annualInvestmentReturn / 100, 1 / 12) - 1;
      const monthlyCpfInterestRate = Math.pow(1 + annualCpfInterestRate / 100, 1 / 12) - 1;
      const monthlyLoanInterestRate = interestRate ? 
        Math.pow(1 + interestRate / 100, 1 / 12) - 1 : 0;

      // Prepare projection array
      const projection = [];
      
      // Set initial values
      let currentSalary = safeParseNumber(salary);
      let currentExpenses = safeParseNumber(monthlyExpenses);
      let currentLoanPayment = safeParseNumber(loanPayment);
      let currentLoanRemaining = safeParseNumber(loanRemaining);
      let currentLiquidCash = safeParseNumber(liquidCash);
      let currentCpfBalance = safeParseNumber(cpfBalance);
      
      // Track milestone months
      let loanPaidOffIndex = null;
      let savingsGoalIndex = null;
      
      // Calculate projection for specified number of years (in months)
      const totalMonths = projectionYears * 12;
      
      // Start projection from specified month/year
      const startDate = new Date(projectionStartYear, projectionStartMonth - 1, 1);
      const currentDate = new Date();
      const isCurrentMonth = 
        startDate.getFullYear() === currentDate.getFullYear() && 
        startDate.getMonth() === currentDate.getMonth();
      
      for (let month = 0; month < totalMonths; month++) {
        // Calculate the projection date starting from the specified start month
        const projectionDate = new Date(
          projectionStartYear, 
          projectionStartMonth - 1 + month, 
          1
        );
        const year = projectionDate.getFullYear();
        const monthIndex = projectionDate.getMonth();
        
        // Check for yearly bonuses first
        const yearlyBonus = getBonusForMonth(year, monthIndex + 1, yearlyBonuses);
        
        // Check if this is a traditional bonus month (typically December and February)
        const isDecember = monthIndex === 11;
        const isFebruary = monthIndex === 1;
        const isTraditionalBonus = bonusMonths > 0 && (
          (bonusMonths >= 1 && isDecember) || 
          (bonusMonths >= 2 && isFebruary)
        );
        
        // Use yearly bonus if available, otherwise use traditional bonus
        const monthBonusAmount = yearlyBonus > 0 ? yearlyBonus : 
          (isTraditionalBonus ? bonusAmount : 0);
        const isBonus = monthBonusAmount > 0;
        
        // Increment salary and expenses with monthly increases
        if (month > 0) {
          currentSalary *= (1 + monthlySalaryIncrease);
          currentExpenses *= (1 + monthlyExpenseIncrease);
        }
        
        // Check if salary has already been received this month
        const currentDate = new Date();
        const isCurrentMonthProjection = month === 0 && isCurrentMonth;
        const salaryDay = data.salaryDay || 25; // Default to 25th if not specified
        const salaryAlreadyReceived = isCurrentMonthProjection && currentDate.getDate() > salaryDay;
        
        // Debug logging for first month
        if (month === 0) {
          console.log('First month projection debug:', {
            month,
            isCurrentMonth,
            isCurrentMonthProjection,
            currentDate: currentDate.toDateString(),
            salaryDay,
            currentDay: currentDate.getDate(),
            salaryAlreadyReceived,
            projectionDate: new Date(projectionStartYear, projectionStartMonth - 1 + month, 1).toDateString()
          });
        }
        
        // For current month, don't add salary if already received
        const effectiveSalary = (isCurrentMonthProjection && salaryAlreadyReceived) ? 0 : currentSalary;
        
        // Calculate CPF contributions based on effective salary
        const cpfContribution = safeDivide(effectiveSalary * cpfContributionRate, 100, 0);
        const employerCpfContribution = safeDivide(effectiveSalary * employerCpfContributionRate, 100, 0);
        
        // Calculate take-home pay
        const takeHomePay = effectiveSalary - cpfContribution;
        
        // Calculate loan payment and remaining balance
        let actualLoanPayment = currentLoanRemaining > 0 ? currentLoanPayment : 0;
        
        // Calculate interest for the month
        const interestPayment = currentLoanRemaining > 0 ? currentLoanRemaining * monthlyLoanInterestRate : 0;
        
        // Principal payment is loan payment minus interest
        const principalPayment = Math.min(currentLoanRemaining, Math.max(0, actualLoanPayment - interestPayment));
        
        // Update loan remaining
        currentLoanRemaining = Math.max(0, currentLoanRemaining - principalPayment);
        
        // Record loan payoff milestone
        if (currentLoanRemaining === 0 && loanPaidOffIndex === null && month > 0) {
          loanPaidOffIndex = month;
        }
        
        // Calculate monthly savings (take-home minus expenses and loan payment, plus bonus)
        const monthlySavings = takeHomePay - currentExpenses - actualLoanPayment + monthBonusAmount;
        
        // Update cash savings with new savings plus investment returns
        const investmentReturn = currentLiquidCash * monthlyInvestmentReturn;
        
        // Handle current month logic - don't double-count salary if already received
        if (month === 0 && isCurrentMonth && salaryAlreadyReceived) {
          // For current month when salary already received, only add investment returns
          currentLiquidCash += investmentReturn;
        } else {
          // Normal case: add monthly savings plus investment returns
          currentLiquidCash += monthlySavings + investmentReturn;
        }
        
        // Update CPF balance with new contributions plus interest
        const cpfInterest = currentCpfBalance * monthlyCpfInterestRate;
        currentCpfBalance += cpfContribution + employerCpfContribution + cpfInterest;
        
        // Check if savings goal reached
        if (currentLiquidCash >= 100000 && savingsGoalIndex === null) {
          savingsGoalIndex = month;
        }
        
        // Calculate net worth
        const totalNetWorth = currentLiquidCash + currentCpfBalance - currentLoanRemaining;
        
        // Format date consistently
        const formattedDate = `${projectionDate.toLocaleString('default', { month: 'short' })} ${projectionDate.getFullYear()}`;
        
        // Calculate cash flow components for better analysis
        const totalIncome = effectiveSalary + employerCpfContribution + monthBonusAmount;
        const totalOutflow = currentExpenses + actualLoanPayment + cpfContribution;
        const netCashFlow = totalIncome - totalOutflow;
        
        // Add enhanced month data to projection
        projection.push({
          month: month + 1,
          date: formattedDate,
          
          // Income components
          monthlySalary: effectiveSalary,
          fullMonthlySalary: currentSalary,
          bonusAmount: monthBonusAmount,
          yearlyBonus: yearlyBonus,
          isBonus,
          totalIncome,
          
          // CPF components
          cpfContribution,
          employerCpfContribution,
          totalCpfContribution: cpfContribution + employerCpfContribution,
          
          // Cash flow components
          takeHomePay,
          monthlyExpenses: currentExpenses,
          loanPayment: actualLoanPayment,
          principalPayment,
          interestPayment,
          monthlySavings,
          monthlySavingsAdded: (month === 0 && isCurrentMonth && salaryAlreadyReceived) ? 0 : monthlySavings,
          netCashFlow,
          totalOutflow,
          
          // Balances
          cashSavings: currentLiquidCash,
          cpfBalance: currentCpfBalance,
          loanRemaining: currentLoanRemaining,
          totalNetWorth,
          
          // Returns and growth
          investmentReturn,
          cpfInterest,
          
          // Timing analysis
          isCurrentMonth: month === 0 && isCurrentMonth,
          
          // Additional metadata
          year,
          monthIndex: monthIndex + 1,
          projectionMonth: month + 1
        });
        
        // Optional: Stop early if all milestones reached and we have enough data
        if (loanPaidOffIndex !== null && savingsGoalIndex !== null && month > 60) {
          break;
        }
      }
      
      // Set milestone information
      const loanPaidOff = loanPaidOffIndex !== null ? projection[loanPaidOffIndex] : null;
      const savingsGoalReached = savingsGoalIndex !== null ? projection[savingsGoalIndex] : null;
      
      // Enhanced time formatting function
      const formatTimeToMilestone = (months) => {
        if (months === null) return 'Not within projection';
        const monthsNum = Number(months);
        if (isNaN(monthsNum)) return 'Not within projection';
        
        const years = Math.floor(monthsNum / 12);
        const remainingMonths = monthsNum % 12;
        
        if (years > 0) {
          if (remainingMonths > 0) {
            return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
          }
          return `${years} year${years > 1 ? 's' : ''}`;
        }
        if (remainingMonths > 0) {
          return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        return 'Less than a month';
      };
      
      return {
        projection,
        loanPaidOffMonth: loanPaidOff,
        savingsGoalReachedMonth: savingsGoalReached,
        timeToPayLoan: formatTimeToMilestone(loanPaidOffIndex),
        timeToSavingsGoal: formatTimeToMilestone(savingsGoalIndex),
        // Additional insights
        projectionMetadata: {
          projectionStartMonth,
          projectionStartYear,
          startDate: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalMonthsProjected: projection.length,
          averageMonthlySavings: projection.reduce((sum, p) => sum + p.monthlySavings, 0) / projection.length,
          totalProjectedSavings: projection[projection.length - 1]?.cashSavings || 0,
          finalNetWorth: projection[projection.length - 1]?.totalNetWorth || 0,
          isCurrentMonthStart: isCurrentMonth
        }
      };
    }, [], { source: 'generateProjection', data, settings });
  }, [data, settings, validateInputs, tryCatch, getBonusForMonth]);

  // Effect to regenerate projection when data or settings change
  useEffect(() => {
    try {
      if (!data || Object.keys(data).length === 0) {
        return;
      }
      
      const result = generateProjection();
      
      if (result) {
        setProjectionData(result.projection || []);
        setLoanPaidOffMonth(result.loanPaidOffMonth || null);
        setSavingsGoalReachedMonth(result.savingsGoalReachedMonth || null);
        setTimeToPayLoan(result.timeToPayLoan || 'Not within projection');
        setTimeToSavingsGoal(result.timeToSavingsGoal || 'Not within projection');
      }
    } catch (error) {
      handleError(error, { source: 'useEffect projection generator' });
      
      // Set default/empty values on error
      setProjectionData([]);
      setLoanPaidOffMonth(null);
      setSavingsGoalReachedMonth(null);
      setTimeToPayLoan('Not within projection');
      setTimeToSavingsGoal('Not within projection');
    }
  }, [data, settings, generateProjection, handleError]);

  // Update data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings(prevSettings => ({ ...prevSettings, ...initialSettings }));
    }
  }, [initialSettings]);

  return {
    // Projection data
    projectionData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    
    // Settings management
    settings,
    updateSettings,
    
    // Error handling
    error,
    hasError,
    clearError,
    
    // Manual recalculation
    generateProjection: () => {
      const result = generateProjection();
      if (result && result.projection) {
        setProjectionData(result.projection);
        setLoanPaidOffMonth(result.loanPaidOffMonth);
        setSavingsGoalReachedMonth(result.savingsGoalReachedMonth);
        setTimeToPayLoan(result.timeToPayLoan);
        setTimeToSavingsGoal(result.timeToSavingsGoal);
      }
      return result;
    },
    
    // Utility methods
    setProjectionStart: (month, year) => updateSettings({ 
      projectionStartMonth: month, 
      projectionStartYear: year 
    }),
    
    // Enhanced projection insights
    getProjectionInsights: () => {
      if (!projectionData.length) return null;
      
      const lastProjection = projectionData[projectionData.length - 1];
      const firstProjection = projectionData[0];
      
      return {
        totalGrowth: lastProjection.totalNetWorth - firstProjection.totalNetWorth,
        averageMonthlySavings: projectionData.reduce((sum, p) => sum + p.monthlySavings, 0) / projectionData.length,
        totalInvestmentReturns: projectionData.reduce((sum, p) => sum + (p.investmentReturn || 0), 0),
        totalCpfInterest: projectionData.reduce((sum, p) => sum + (p.cpfInterest || 0), 0),
        salaryGrowth: lastProjection.fullMonthlySalary - firstProjection.fullMonthlySalary,
        projectedNetWorthIn5Years: projectionData[Math.min(59, projectionData.length - 1)]?.totalNetWorth || 0,
        projectedNetWorthIn10Years: projectionData[Math.min(119, projectionData.length - 1)]?.totalNetWorth || 0,
        startDate: settings.projectionStartMonth && settings.projectionStartYear ?
          new Date(settings.projectionStartYear, settings.projectionStartMonth - 1, 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          }) : 'Current month'
      };
    }
  };
};

export default useProjection;