import { useState, useEffect, useCallback } from 'react';
import useErrorHandler from './useErrorHandler';
import { 
  safeParseNumber, 
  safeDivide, 
  createFinancialError, 
  allocateCPFContribution, 
  getCPFContributionCaps
} from '../utils/errors/ErrorUtils';

/**
 * Custom hook for generating financial projections
 * 
 * @param {Object} initialData - Initial financial data
 * @param {Object} initialSettings - Projection settings
 * @returns {Object} - Projection data and utility functions
 */
const useProjection = (initialData, initialSettings) => {
  const [data, setData] = useState(initialData || {});
  const [settings, setSettings] = useState(initialSettings || {});
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
    const requiredFields = ['salary', 'cpfContributionRate', 'employerCpfContributionRate', 'monthlyExpenses', 'age'];
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
      (data.loanPayment !== undefined && data.loanPayment < 0) ||
      (data.cpfOrdinaryAccount !== undefined && data.cpfOrdinaryAccount < 0) ||
      (data.cpfSpecialAccount !== undefined && data.cpfSpecialAccount < 0) ||
      (data.cpfMedisaveAccount !== undefined && data.cpfMedisaveAccount < 0)
    ) {
      handleError(createFinancialError(
        'Negative values are not allowed for financial data', 
        'negative_value'
      ));
      return false;
    }

    return true;
  }, [data, handleError]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    try {
      setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
      clearError();
    } catch (error) {
      handleError(error, { source: 'updateSettings' });
    }
  }, [handleError, clearError]);

  // Generate projection based on current data and settings
  const generateProjection = useCallback(() => {
    // First validate inputs
    if (!validateInputs()) {
      return [];
    }

    // Use tryCatch to safely perform projection calculations
    return tryCatch(() => {
      // Extract values from data and settings
      const { 
        salary = 0, 
        age = 35,
        cpfContributionRate = 20, 
        employerCpfContributionRate = 17, 
        monthlyExpenses = 0, 
        loanPayment = 0, 
        loanRemaining = 0, 
        liquidCash = 0, 
        cpfOrdinaryAccount = 0,
        cpfSpecialAccount = 0,
        cpfMedisaveAccount = 0,
        cpfBalance = 0
      } = data;

      const { 
        annualSalaryIncrease = 3.0, 
        annualExpenseIncrease = 2.0, 
        annualInvestmentReturn = 4.0, 
        annualCpfInterestRate = 2.5, 
        projectionYears = 30,
        bonusMonths = 2,
        bonusAmount = safeParseNumber(settings.bonusAmount || salary, salary)
      } = settings;

      // Get CPF contribution caps
      const cpfCaps = getCPFContributionCaps();
      const { ordinaryWageCeiling } = cpfCaps;

      // Convert annual rates to monthly
      const monthlySalaryIncrease = Math.pow(1 + annualSalaryIncrease / 100, 1 / 12) - 1;
      const monthlyExpenseIncrease = Math.pow(1 + annualExpenseIncrease / 100, 1 / 12) - 1;
      const monthlyInvestmentReturn = Math.pow(1 + annualInvestmentReturn / 100, 1 / 12) - 1;
      const monthlyCpfInterestRate = Math.pow(1 + annualCpfInterestRate / 100, 1 / 12) - 1;
      const monthlyLoanInterestRate = data.interestRate ? 
        Math.pow(1 + data.interestRate / 100, 1 / 12) - 1 : 0;

      // Prepare projection array
      const projection = [];
      
      // Set initial values
      let currentSalary = safeParseNumber(salary);
      let currentExpenses = safeParseNumber(monthlyExpenses);
      let currentLoanPayment = safeParseNumber(loanPayment);
      let currentLoanRemaining = safeParseNumber(loanRemaining);
      let currentLiquidCash = safeParseNumber(liquidCash);
      let currentCpfOrdinaryAccount = safeParseNumber(cpfOrdinaryAccount);
      let currentCpfSpecialAccount = safeParseNumber(cpfSpecialAccount);
      let currentCpfMedisaveAccount = safeParseNumber(cpfMedisaveAccount);
      let currentAge = safeParseNumber(age); // Age will increment by 1/12 each month
      
      // Track milestone months
      let loanPaidOffIndex = null;
      let savingsGoalIndex = null;
      
      // Calculate projection for specified number of years (in months)
      const totalMonths = projectionYears * 12;
      
      for (let month = 0; month < totalMonths; month++) {
        // Check if this is a bonus month (typically months 6 and 12)
        const isBonus = bonusMonths > 0 && (month + 1) % 12 === 0; // End of year bonus
        const monthBonusAmount = isBonus ? bonusAmount : 0;
        
        // Increment salary with monthly increases (if any)
        if (month > 0) {
          currentSalary *= (1 + monthlySalaryIncrease);
          currentExpenses *= (1 + monthlyExpenseIncrease);
        }
        
        // Apply Ordinary Wage Ceiling to salary for CPF calculation
        const cpfApplicableSalary = Math.min(currentSalary, ordinaryWageCeiling);
        
        // Calculate CPF contributions
        const cpfContribution = safeDivide(cpfApplicableSalary * cpfContributionRate, 100, 0);
        const employerCpfContribution = safeDivide(cpfApplicableSalary * employerCpfContributionRate, 100, 0);
        const totalCpfContribution = cpfContribution + employerCpfContribution;
        
        // Allocate CPF contributions to different accounts based on age
        const cpfAllocation = allocateCPFContribution(totalCpfContribution, currentAge);
        
        // Calculate take-home pay
        const takeHomePay = currentSalary - cpfContribution;
        
        // Calculate loan payment and remaining balance
        // If loan is paid off, payment becomes 0
        let actualLoanPayment = currentLoanRemaining > 0 ? currentLoanPayment : 0;
        
        // Calculate interest for the month
        const interestPayment = currentLoanRemaining > 0 ? currentLoanRemaining * monthlyLoanInterestRate : 0;
        
        // Principal payment is loan payment minus interest
        // Ensure principal payment is not negative if interest exceeds payment
        const principalPayment = Math.min(currentLoanRemaining, Math.max(0, actualLoanPayment - interestPayment));
        
        // Update loan remaining
        currentLoanRemaining = Math.max(0, currentLoanRemaining - principalPayment);
        
        // If loan was just paid off, record the milestone
        if (currentLoanRemaining === 0 && loanPaidOffIndex === null && month > 0) {
          loanPaidOffIndex = month;
        }
        
        // Calculate monthly savings (take-home minus expenses and loan payment)
        const monthlySavings = takeHomePay - currentExpenses - actualLoanPayment + monthBonusAmount;
        
        // Update cash savings with new savings plus investment returns
        // Calculate investment return on current balance before adding new savings
        const investmentReturn = currentLiquidCash * monthlyInvestmentReturn;
        // Add new savings and investment returns
        currentLiquidCash += monthlySavings + investmentReturn;
        
        // Update CPF balances with new contributions plus interest
        // OA, SA, and MA have different interest rates in reality, but we'll use the same for simplicity
        const ordinaryAccountInterest = currentCpfOrdinaryAccount * monthlyCpfInterestRate;
        const specialAccountInterest = currentCpfSpecialAccount * monthlyCpfInterestRate;
        const medisaveAccountInterest = currentCpfMedisaveAccount * monthlyCpfInterestRate;
        
        // Update each CPF account
        currentCpfOrdinaryAccount += cpfAllocation.ordinary + ordinaryAccountInterest;
        currentCpfSpecialAccount += cpfAllocation.special + specialAccountInterest;
        currentCpfMedisaveAccount += cpfAllocation.medisave + medisaveAccountInterest;
        
        // Calculate total CPF balance
        const totalCpfBalance = currentCpfOrdinaryAccount + currentCpfSpecialAccount + currentCpfMedisaveAccount;
        
        // Update age (increment by 1/12 month)
        currentAge += 1/12;
        
        // Check if savings goal reached
        if (currentLiquidCash >= 100000 && savingsGoalIndex === null) {
          savingsGoalIndex = month;
        }
        
        // Calculate net worth
        const totalNetWorth = currentLiquidCash + totalCpfBalance - currentLoanRemaining;
        
        // Format date (assuming we start from current month)
        const date = new Date();
        // Clone the date to avoid modifying the original date
        const projectionDate = new Date(date);
        // Add months to the base date
        projectionDate.setMonth(date.getMonth() + month);
        // Format the date in a consistent way
        const formattedDate = `${projectionDate.toLocaleString('default', { month: 'short' })} ${projectionDate.getFullYear()}`;
        
        // Add month to projection
        projection.push({
          month: month + 1,
          date: formattedDate,
          monthlySalary: currentSalary,
          cpfContribution,
          employerCpfContribution,
          takeHomePay,
          expenses: currentExpenses,
          loanPayment: actualLoanPayment,
          loanRemaining: currentLoanRemaining,
          monthlySavings,
          cashSavings: currentLiquidCash,
          cpfOrdinaryAccount: currentCpfOrdinaryAccount,
          cpfSpecialAccount: currentCpfSpecialAccount,
          cpfMedisaveAccount: currentCpfMedisaveAccount,
          cpfTotalBalance: totalCpfBalance,
          cpfOrdinaryAllocation: cpfAllocation.ordinary,
          cpfSpecialAllocation: cpfAllocation.special,
          cpfMedisaveAllocation: cpfAllocation.medisave,
          totalNetWorth,
          age: currentAge,
          isBonus,
          bonusAmount: monthBonusAmount
        });
        
        // Stop if all milestones reached (optional optimization)
        if (loanPaidOffIndex !== null && savingsGoalIndex !== null && month > 60) {
          break;
        }
      }
      
      // Set milestone information
      const loanPaidOff = loanPaidOffIndex !== null ? projection[loanPaidOffIndex] : null;
      const savingsGoalReached = savingsGoalIndex !== null ? projection[savingsGoalIndex] : null;
      
      // Format time to milestones
      const formatTimeToMilestone = (months) => {
      if (months === null) return 'Not within projection';
      // Convert to number to ensure proper calculation
      const monthsNum = Number(months);
      if (isNaN(monthsNum)) return 'Not within projection';
      
      const years = Math.floor(monthsNum / 12);
        const remainingMonths = monthsNum % 12;
        
        // Handle singular/plural forms correctly
        if (years > 0) {
          // Both years and months
          if (remainingMonths > 0) {
            return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
          }
          // Only years, no months
          return `${years} year${years > 1 ? 's' : ''}`;
        }
        // Only months, no years
        if (remainingMonths > 0) {
          return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        // Should not happen but handle the case
        return 'Less than a month';
      };
      
      return {
        projection,
        loanPaidOffMonth: loanPaidOff,
        savingsGoalReachedMonth: savingsGoalReached,
        timeToPayLoan: formatTimeToMilestone(loanPaidOffIndex),
        timeToSavingsGoal: formatTimeToMilestone(savingsGoalIndex)
      };
    }, [], { source: 'generateProjection', data, settings });
  }, [data, settings, validateInputs, tryCatch]);

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
    }
  };
};

export default useProjection;