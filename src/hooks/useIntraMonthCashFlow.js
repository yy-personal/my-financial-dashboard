import { useState, useEffect, useCallback } from 'react';
import useErrorHandler from './useErrorHandler';
import { safeParseNumber, safeDivide, createFinancialError } from '../utils/errors/ErrorUtils';

/**
 * Enhanced cash flow projection that considers intra-month timing
 * Handles salary received on 23-25th and expenses due throughout the month
 * 
 * @param {Object} financialData - Complete financial data from context
 * @param {Object} settings - Projection settings
 * @returns {Object} - Enhanced cash flow analysis with timing considerations
 */
const useIntraMonthCashFlow = (financialData, settings = {}) => {
  const [cashFlowAnalysis, setCashFlowAnalysis] = useState(null);
  const [liquidityWarnings, setLiquidityWarnings] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Setup error handler
  const { 
    error, 
    hasError, 
    handleError, 
    clearError, 
    tryCatch 
  } = useErrorHandler('useIntraMonthCashFlow');

  // Calculate detailed intra-month cash flow
  const calculateIntraMonthCashFlow = useCallback((monthData, income, expenses, projectionSettings) => {
    const salaryDay = safeParseNumber(income.salaryDay, 25);
    const minimumBuffer = safeParseNumber(projectionSettings.minimumCashBuffer, 1000);
    
    // Create daily cash flow events
    const dailyEvents = [];
    
    // Add salary event (received on salary day of PREVIOUS month for expenses)
    const salaryDate = salaryDay;
    const salaryAmount = monthData.takeHomePay + (monthData.bonusAmount || 0);
    
    dailyEvents.push({
      day: salaryDate,
      type: 'income',
      description: 'Salary Received',
      amount: salaryAmount,
      category: 'salary'
    });
    
    // Add expense events throughout the month
    expenses.forEach(expense => {
      const dueDay = safeParseNumber(expense.dueDay, 15);
      dailyEvents.push({
        day: dueDay,
        type: 'expense',
        description: expense.name,
        amount: -expense.amount,
        category: 'expense'
      });
    });
    
    // Add loan payment (assume due on 1st)
    if (monthData.loanPayment > 0) {
      dailyEvents.push({
        day: 1,
        type: 'expense', 
        description: 'Loan Payment',
        amount: -monthData.loanPayment,
        category: 'loan'
      });
    }
    
    // Sort events by day
    dailyEvents.sort((a, b) => a.day - b.day);
    
    // Calculate running cash balance
    let runningBalance = monthData.cashSavings; // Starting cash from previous month
    let minBalance = runningBalance;
    let minBalanceDay = 0;
    let liquidityIssues = [];
    
    const dailyBalances = [];
    
    dailyEvents.forEach(event => {
      runningBalance += event.amount;
      
      dailyBalances.push({
        day: event.day,
        balance: runningBalance,
        event: event,
        change: event.amount
      });
      
      // Track minimum balance
      if (runningBalance < minBalance) {
        minBalance = runningBalance;
        minBalanceDay = event.day;
      }
      
      // Check for liquidity issues
      if (runningBalance < minimumBuffer) {
        liquidityIssues.push({
          day: event.day,
          balance: runningBalance,
          shortfall: minimumBuffer - runningBalance,
          severity: runningBalance < 0 ? 'critical' : 'warning'
        });
      }
    });
    
    return {
      dailyEvents,
      dailyBalances,
      minBalance,
      minBalanceDay,
      liquidityIssues,
      metrics: {
        salaryToFirstExpenseGap: salaryDay > 1 ? 1 - salaryDay + 30 : 1 - salaryDay, // Days from salary to first expense
        cashFlowStress: minBalance < minimumBuffer,
        recommendedBuffer: Math.max(minimumBuffer, Math.abs(minBalance) + 500)
      }
    };
  }, []);

  // Generate recommendations based on cash flow timing
  const generateRecommendations = useCallback((analysis, income, settings) => {
    if (!analysis) return [];
    
    const recommendations = [];
    const salaryDay = safeParseNumber(income.salaryDay, 25);
    
    // Liquidity recommendations
    if (analysis.liquidityIssues.length > 0) {
      const criticalIssues = analysis.liquidityIssues.filter(issue => issue.severity === 'critical');
      
      if (criticalIssues.length > 0) {
        recommendations.push({
          type: 'critical',
          title: 'Cash Flow Risk Detected',
          description: `You may run out of cash on day ${criticalIssues[0].day} of the month. Consider increasing your cash buffer.`,
          actionItems: [
            `Increase emergency fund by $${Math.ceil(Math.abs(analysis.minBalance) + 500)}`,
            'Consider moving some expenses to after salary day',
            'Set up overdraft protection'
          ]
        });
      } else {
        recommendations.push({
          type: 'warning',
          title: 'Low Cash Buffer Warning',
          description: `Your cash drops below the recommended buffer on day ${analysis.liquidityIssues[0].day}.`,
          actionItems: [
            `Consider increasing minimum cash buffer to $${analysis.metrics.recommendedBuffer}`,
            'Monitor cash flow more closely'
          ]
        });
      }
    }
    
    // Timing optimization recommendations
    if (salaryDay > 20) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Expense Timing',
        description: `Since you receive salary on day ${salaryDay}, you have good cash flow timing.`,
        actionItems: [
          'Consider paying rent after salary day to reduce cash requirements',
          'Schedule variable expenses after salary day',
          `Your current setup works well with salary received on day ${salaryDay}`
        ]
      });
    }
    
    return recommendations;
  }, []);

  // Generate enhanced projection with timing analysis
  const generateEnhancedProjection = useCallback(() => {
    if (!financialData || !financialData.income || !financialData.expenses) {
      return {
        currentMonth: null,
        intraMonthAnalysis: null,
        recommendations: []
      };
    }

    try {
      const { personalInfo, income, expenses, projectionSettings } = financialData;
      
      // Use existing projection logic but enhance with timing
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Basic monthly calculation (simplified from useProjection)
      const currentSalary = safeParseNumber(income.currentSalary, 0);
      const cpfContribution = safeDivide(currentSalary * (income.cpfRate || 20), 100, 0);
      const takeHomePay = currentSalary - cpfContribution;
      const totalExpenses = Array.isArray(expenses) ? 
        expenses.reduce((sum, exp) => sum + safeParseNumber(exp.amount, 0), 0) : 0;
      const loanPayment = safeParseNumber(personalInfo.monthlyRepayment, 0);
      
      // Current month analysis
      const currentMonthData = {
        month: currentMonth,
        year: currentYear,
        takeHomePay,
        totalExpenses,
        loanPayment,
        monthlySavings: takeHomePay - totalExpenses - loanPayment,
        cashSavings: safeParseNumber(personalInfo.currentSavings, 0),
        bonusAmount: 0 // No bonus for current month calculation
      };
      
      // Analyze intra-month cash flow (enabled by default)
      let intraMonthAnalysis = null;
      const analysisEnabled = projectionSettings?.enableIntraMonthAnalysis !== false; // Default to true
      
      if (analysisEnabled) {
        intraMonthAnalysis = calculateIntraMonthCashFlow(
          currentMonthData, 
          income, 
          expenses, 
          projectionSettings || {}
        );
      }
      
      return {
        currentMonth: currentMonthData,
        intraMonthAnalysis,
        recommendations: generateRecommendations(intraMonthAnalysis, income, projectionSettings)
      };
    } catch (error) {
      console.error('Error in generateEnhancedProjection:', error);
      handleError(error);
      return {
        currentMonth: null,
        intraMonthAnalysis: null,
        recommendations: []
      };
    }
  }, [financialData, calculateIntraMonthCashFlow, generateRecommendations, handleError]);

  // Effect to recalculate when data changes
  useEffect(() => {
    setIsAnalyzing(true);
    clearError();
    
    const analysis = generateEnhancedProjection();
    setCashFlowAnalysis(analysis);
    
    if (analysis?.intraMonthAnalysis?.liquidityIssues) {
      setLiquidityWarnings(analysis.intraMonthAnalysis.liquidityIssues);
    } else {
      setLiquidityWarnings([]);
    }
    
    setIsAnalyzing(false);
  }, [financialData, generateEnhancedProjection, clearError]);

  return {
    // Analysis results
    cashFlowAnalysis,
    liquidityWarnings,
    isAnalyzing,
    
    // Error handling
    error,
    hasError,
    clearError,
    
    // Utility functions
    generateEnhancedProjection,
    
    // Quick access to key metrics
    getCurrentMonthRisk: () => {
      if (!cashFlowAnalysis?.intraMonthAnalysis) return null;
      const { minBalance, liquidityIssues } = cashFlowAnalysis.intraMonthAnalysis;
      
      return {
        riskLevel: liquidityIssues.length > 0 ? 'high' : minBalance < 500 ? 'medium' : 'low',
        minBalance,
        daysAtRisk: liquidityIssues.length,
        recommendedBuffer: cashFlowAnalysis.intraMonthAnalysis.metrics.recommendedBuffer
      };
    }
  };
};

export default useIntraMonthCashFlow;