import { useState, useEffect, useCallback, useMemo } from 'react';
import useErrorHandler from './useErrorHandler';
import { safeParseNumber, safeDivide, createFinancialError } from '../utils/errors/ErrorUtils';
import { getCpfRates, EMPLOYEE_TYPE } from '../services/calculations/cpf/cpf-utilities';

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
  const [savingsGoalReachedMonth, setSavingsGoalReachedMonth] = useState(null);
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
      (data.monthlyExpenses !== undefined && data.monthlyExpenses < 0)
    ) {
      handleError(createFinancialError(
        'Negative values are not allowed for salary or expenses',
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

  // Get upcoming spending for a specific month
  const getUpcomingSpendingForMonth = useCallback((year, month, day, upcomingSpending = []) => {
    if (!Array.isArray(upcomingSpending)) return { totalAmount: 0, items: [] };

    const monthSpending = upcomingSpending.filter(spending =>
      spending.year === year && spending.month === month
    );

    const totalAmount = monthSpending.reduce((sum, spending) => sum + safeParseNumber(spending.amount, 0), 0);

    return {
      totalAmount,
      items: monthSpending,
      description: monthSpending.map(s => s.name).join(', ')
    };
  }, []);

  // Get yearly expenses for a specific month and year
  const getYearlyExpensesForMonthAndYear = useCallback((year, month, yearlyExpenses = []) => {
    if (!Array.isArray(yearlyExpenses)) return { totalAmount: 0, items: [] };

    const monthExpenses = yearlyExpenses.filter(expense => {
      // Check if expense applies to this month and year
      const appliesInThisYear = expense.startYear <= year && (!expense.endYear || expense.endYear >= year);
      const isThisMonth = expense.month === month;

      return appliesInThisYear && isThisMonth;
    });

    const totalAmount = monthExpenses.reduce((sum, expense) => sum + safeParseNumber(expense.amount, 0), 0);

    return {
      totalAmount,
      items: monthExpenses,
      description: monthExpenses.map(e => e.name).join(', ')
    };
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
        liquidCash = 0,
        cpfBalance = 0
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
        yearlyBonuses = [],
        yearlyExpenses = [],
        upcomingSpending = []
      } = settings;

      // Convert annual rates to monthly - Pre-calculated for performance
      const monthlySalaryIncrease = Math.pow(1 + annualSalaryIncrease / 100, 1 / 12) - 1;
      const monthlyExpenseIncrease = Math.pow(1 + annualExpenseIncrease / 100, 1 / 12) - 1;
      const monthlyInvestmentReturn = Math.pow(1 + annualInvestmentReturn / 100, 1 / 12) - 1;
      const monthlyCpfInterestRate = Math.pow(1 + annualCpfInterestRate / 100, 1 / 12) - 1;

      // Pre-calculate multipliers for salary and expense growth (avoid repeated calculations)
      const salaryGrowthMultiplier = 1 + monthlySalaryIncrease;
      const expenseGrowthMultiplier = 1 + monthlyExpenseIncrease;

      // Prepare projection array
      const projection = [];
      
      // Set initial values
      let currentSalary = safeParseNumber(salary);
      let currentExpenses = safeParseNumber(monthlyExpenses);
      let currentLiquidCash = safeParseNumber(liquidCash);
      let currentCpfBalance = safeParseNumber(cpfBalance);

      // Track milestone months
      let savingsGoalIndex = null;
      
      // Calculate projection for specified number of years (in months)
      const totalMonths = projectionYears * 12;
      
      // Start projection from specified month/year
      const startDate = new Date(projectionStartYear, projectionStartMonth - 1, 1);
      const currentDate = new Date();
      const isCurrentMonth =
        startDate.getFullYear() === currentDate.getFullYear() &&
        startDate.getMonth() === currentDate.getMonth();

      // Pre-calculate month names for formatting (performance optimization)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let month = 0; month < totalMonths; month++) {
        // Calculate year and month using arithmetic (faster than Date constructor)
        const totalMonthsFromStart = projectionStartMonth - 1 + month;
        const year = projectionStartYear + Math.floor(totalMonthsFromStart / 12);
        const monthIndex = totalMonthsFromStart % 12;
        
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

        // Check for upcoming spending this month
        const upcomingSpendingData = getUpcomingSpendingForMonth(year, monthIndex + 1, 15, upcomingSpending);
        const monthSpendingAmount = upcomingSpendingData.totalAmount;
        const hasUpcomingSpending = monthSpendingAmount > 0;

        // Check for yearly expenses this month
        const yearlyExpenseData = getYearlyExpensesForMonthAndYear(year, monthIndex + 1, yearlyExpenses);
        const monthYearlyExpenseAmount = yearlyExpenseData.totalAmount;
        const hasYearlyExpense = monthYearlyExpenseAmount > 0;

        // Increment salary and expenses with monthly increases using pre-calculated multipliers
        if (month > 0) {
          currentSalary *= salaryGrowthMultiplier;
          currentExpenses *= expenseGrowthMultiplier;
        }
        
        // Check if salary has already been received this month
        const currentDate = new Date();
        const isCurrentMonthProjection = month === 0 && isCurrentMonth;
        const salaryDay = data.salaryDay || 25; // Default to 25th if not specified
        const salaryAlreadyReceived = isCurrentMonthProjection && currentDate.getDate() > salaryDay;
        
        
        // For current month, don't add salary if already received
        const effectiveSalary = (isCurrentMonthProjection && salaryAlreadyReceived) ? 0 : currentSalary;
        
        // Calculate age-based CPF contributions for this projection month
        let monthCpfRate = cpfContributionRate / 100; // Default fallback
        let monthEmployerCpfRate = employerCpfContributionRate / 100; // Default fallback
        
        // Calculate age at this projection month (if birth year is available)
        if (data.currentAge !== undefined && data.currentAge !== null) {
          const monthsElapsed = month;
          const currentAge = data.currentAge;
          const projectedAge = currentAge + Math.floor(monthsElapsed / 12);
          
          try {
            const employeeType = data.employeeType || EMPLOYEE_TYPE.SINGAPOREAN;
            const [empRate, emplRate] = getCpfRates(employeeType, projectedAge);
            monthCpfRate = empRate;
            monthEmployerCpfRate = emplRate;
          } catch (error) {
            // Use original rates as fallback
            monthCpfRate = cpfContributionRate / 100;
            monthEmployerCpfRate = employerCpfContributionRate / 100;
          }
        }
        
        // Calculate CPF contributions based on age-appropriate rates
        const cpfContribution = effectiveSalary * monthCpfRate;
        const employerCpfContribution = effectiveSalary * monthEmployerCpfRate;
        
        // Calculate take-home pay
        const takeHomePay = effectiveSalary - cpfContribution;

        // Calculate monthly savings (take-home minus expenses, plus bonus, minus upcoming spending, minus yearly expenses)
        const monthlySavings = takeHomePay - currentExpenses + monthBonusAmount - monthSpendingAmount - monthYearlyExpenseAmount;
        
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
        const totalNetWorth = currentLiquidCash + currentCpfBalance;

        // Format date consistently using pre-calculated month names (performance optimized)
        const formattedDate = `${monthNames[monthIndex]} ${year}`;
        
        // Calculate cash flow components for better analysis
        const totalIncome = effectiveSalary + employerCpfContribution + monthBonusAmount;
        const totalOutflow = currentExpenses + cpfContribution + monthSpendingAmount + monthYearlyExpenseAmount;
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
          monthlySavings,
          monthlySavingsAdded: (month === 0 && isCurrentMonth && salaryAlreadyReceived) ? 0 : monthlySavings,
          netCashFlow,
          totalOutflow,

          // Balances
          cashSavings: currentLiquidCash,
          cpfBalance: currentCpfBalance,
          totalNetWorth,
          
          // Returns and growth
          investmentReturn,
          cpfInterest,
          
          // Timing analysis
          isCurrentMonth: month === 0 && isCurrentMonth,
          
          // Upcoming spending data
          upcomingSpendingAmount: monthSpendingAmount,
          upcomingSpendingItems: upcomingSpendingData.items,
          upcomingSpendingDescription: upcomingSpendingData.description,
          hasUpcomingSpending,

          // Yearly expenses data
          yearlyExpenseAmount: monthYearlyExpenseAmount,
          yearlyExpenseItems: yearlyExpenseData.items,
          yearlyExpenseDescription: yearlyExpenseData.description,
          hasYearlyExpense,

          // Additional metadata
          year,
          monthIndex: monthIndex + 1,
          projectionMonth: month + 1
        });
        
        // Optional: Stop early if all milestones reached and we have enough data
        if (savingsGoalIndex !== null && month > 60) {
          break;
        }
      }
      
      // Set milestone information
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
        savingsGoalReachedMonth: savingsGoalReached,
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
  }, [
    // Only recalculate when key financial data changes
    data?.salary,
    data?.cpfContributionRate,
    data?.employerCpfContributionRate,
    data?.monthlyExpenses,
    data?.liquidCash,
    data?.cpfBalance,
    data?.currentAge,
    data?.employeeType,
    
    // Key settings that affect calculation
    settings?.annualSalaryIncrease,
    settings?.annualExpenseIncrease,
    settings?.annualInvestmentReturn,
    settings?.annualCpfInterestRate,
    settings?.projectionYears,
    settings?.bonusMonths,
    settings?.bonusAmount,
    settings?.projectionStartMonth,
    settings?.projectionStartYear,
    settings?.yearlyBonuses,
    settings?.yearlyExpenses,
    settings?.upcomingSpending,

    // Function dependencies (these are memoized)
    validateInputs,
    tryCatch,
    getBonusForMonth,
    getUpcomingSpendingForMonth,
    getYearlyExpensesForMonthAndYear
  ]);

  // Effect to regenerate projection when data or settings change
  useEffect(() => {
    try {
      if (!data || Object.keys(data).length === 0) {
        return;
      }
      
      const result = generateProjection();

      if (result) {
        setProjectionData(result.projection || []);
        setSavingsGoalReachedMonth(result.savingsGoalReachedMonth || null);
        setTimeToSavingsGoal(result.timeToSavingsGoal || 'Not within projection');
      }
    } catch (error) {
      handleError(error, { source: 'useEffect projection generator' });

      // Set default/empty values on error
      setProjectionData([]);
      setSavingsGoalReachedMonth(null);
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
    savingsGoalReachedMonth,
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
        setSavingsGoalReachedMonth(result.savingsGoalReachedMonth);
        setTimeToSavingsGoal(result.timeToSavingsGoal);
      }
      return result;
    },
    
    // Utility methods
    setProjectionStart: (month, year) => updateSettings({ 
      projectionStartMonth: month, 
      projectionStartYear: year 
    }),
    
    // Enhanced projection insights - memoized for performance
    getProjectionInsights: useMemo(() => {
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
    }, [projectionData, settings.projectionStartMonth, settings.projectionStartYear])
  };
};

export default useProjection;