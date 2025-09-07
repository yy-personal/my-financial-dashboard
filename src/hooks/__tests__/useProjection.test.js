import { renderHook, act } from '@testing-library/react';
import useProjection from '../useProjection';

// Mock date-fns
jest.mock('date-fns', () => ({
  addMonths: (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },
  format: (date, formatStr) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month]} ${year}`;
  }
}));

// Sample initial data for testing
const sampleInitialData = {
  liquidCash: 50000,
  cpfBalance: 100000,
  loanRemaining: 200000,
  salary: 6000,
  monthlyExpenses: 2000,
  loanPayment: 1000,
  cpfContributionRate: 20,
  employerCpfContributionRate: 17
};

// Sample settings for testing
const sampleSettings = {
  annualSalaryIncrease: 3.0,
  annualExpenseIncrease: 2.0,
  annualInvestmentReturn: 4.0,
  annualCpfInterestRate: 2.5,
  projectionYears: 5, // Use a small number for testing
  bonusMonths: 1,
  bonusAmount: 6000 // 1 month salary
};

describe('useProjection Hook', () => {
  beforeEach(() => {
    // Set fixed date for consistent testing
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate projection data based on initial data and settings', () => {
    const { result } = renderHook(() => useProjection(sampleInitialData, sampleSettings));
    
    // Get the returned values
    const {
      projectionData,
      settings,
      updateSettings,
      generateProjection
    } = result.current;
    
    // Test that projection data is generated
    expect(projectionData).toBeInstanceOf(Array);
    expect(projectionData.length).toBeGreaterThan(0);
    
    // Test that first month data is calculated correctly
    const firstMonth = projectionData[0];
    
    // Check expected first month values
    expect(firstMonth.date).toBe('Jan 2023');
    expect(firstMonth.monthlyIncome).toBe(sampleInitialData.salary); // No bonus in first month
    expect(firstMonth.takeHomePay).toBeCloseTo(4800); // 6000 - 20% CPF
    expect(firstMonth.loanRemaining).toBeLessThan(sampleInitialData.loanRemaining); // Should decrease
    
    // Test that projection has appropriate length
    expect(projectionData.length).toBe(sampleSettings.projectionYears * 12);
  });

  it('should update settings correctly', () => {
    const { result } = renderHook(() => useProjection(sampleInitialData, sampleSettings));
    
    // Update settings
    const newSettings = {
      ...sampleSettings,
      annualSalaryIncrease: 5.0, // Changed from 3.0
      bonusMonths: 2 // Changed from 1
    };
    
    act(() => {
      result.current.updateSettings(newSettings);
    });
    
    // Check settings updated
    expect(result.current.settings.annualSalaryIncrease).toBe(5.0);
    expect(result.current.settings.bonusMonths).toBe(2);
  });

  it('should calculate loan paid off month correctly', () => {
    // Data with small loan that should be paid off quickly
    const quickLoanData = {
      ...sampleInitialData,
      loanRemaining: 10000 // Small loan amount
    };
    
    const { result } = renderHook(() => useProjection(quickLoanData, sampleSettings));
    
    // Loan should be paid off after 10 months (10000 / 1000)
    expect(result.current.timeToPayLoan).toBeLessThanOrEqual(10);
    expect(result.current.loanPaidOffMonth).not.toBeNull();
    expect(result.current.loanPaidOffMonth.date).toBeDefined();
  });

  it('should calculate savings goal reached month correctly', () => {
    // Data with high savings rate to quickly reach savings goal
    const highSavingsData = {
      ...sampleInitialData,
      liquidCash: 90000, // Start close to 100k goal
      loanRemaining: 0, // No loan to pay off
      monthlyExpenses: 1000 // Lower expenses
    };
    
    const { result } = renderHook(() => useProjection(highSavingsData, sampleSettings));
    
    // Savings goal should be reached quickly
    expect(result.current.timeToSavingsGoal).toBeLessThanOrEqual(5); // Should be reached in first few months
    expect(result.current.savingsGoalReachedMonth).not.toBeNull();
    expect(result.current.savingsGoalReachedMonth.date).toBeDefined();
  });

  it('should handle empty initial data gracefully', () => {
    const { result } = renderHook(() => useProjection(null, sampleSettings));
    
    // Should not crash and return empty projection
    expect(result.current.projectionData).toEqual([]);
  });

  it('should regenerate projection when initial data changes', () => {
    const { result, rerender } = renderHook(
      ({ data, settings }) => useProjection(data, settings),
      { initialProps: { data: sampleInitialData, settings: sampleSettings } }
    );
    
    // Get initial projection length
    const initialLength = result.current.projectionData.length;
    
    // Update with new data
    const newData = {
      ...sampleInitialData,
      salary: 8000 // Higher salary
    };
    
    rerender({ data: newData, settings: sampleSettings });
    
    // Projection should be regenerated
    expect(result.current.projectionData[0].monthlyIncome).toBe(8000); // Should use new salary
  });
});