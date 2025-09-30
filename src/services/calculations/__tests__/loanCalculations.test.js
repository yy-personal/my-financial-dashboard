import {
  calculateMonthlyPayment,
  calculatePaymentBreakdown,
  generateAmortizationSchedule,
  calculateRemainingTerm,
  calculateTotalInterest,
  calculateEarlyPayoff,
  calculateAffordability
} from '../loanCalculations';

describe('Loan Calculations', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment for standard loan', () => {
      const principal = 300000;
      const annualRate = 2.6;
      const years = 25;

      const payment = calculateMonthlyPayment(principal, annualRate, years);

      // Expected: approximately $1,352
      expect(payment).toBeGreaterThan(1300);
      expect(payment).toBeLessThan(1400);
    });

    it('should handle zero interest rate', () => {
      const principal = 120000;
      const annualRate = 0;
      const years = 10;

      const payment = calculateMonthlyPayment(principal, annualRate, years);

      expect(payment).toBe(1000); // 120000 / (10 * 12)
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateMonthlyPayment(0, 2.6, 25)).toBe(0);
      expect(calculateMonthlyPayment(-10000, 2.6, 25)).toBe(0);
      expect(calculateMonthlyPayment(100000, -1, 25)).toBe(0);
    });
  });

  describe('calculatePaymentBreakdown', () => {
    it('should correctly split payment into principal and interest', () => {
      const remainingBalance = 300000;
      const monthlyPayment = 1352;
      const annualRate = 2.6;

      const breakdown = calculatePaymentBreakdown(remainingBalance, monthlyPayment, annualRate);

      expect(breakdown.interestPayment).toBeGreaterThan(0);
      expect(breakdown.principalPayment).toBeGreaterThan(0);
      expect(breakdown.interestPayment + breakdown.principalPayment).toBeCloseTo(monthlyPayment, 0);
      expect(breakdown.newBalance).toBeLessThan(remainingBalance);
    });

    it('should handle final payment correctly', () => {
      const remainingBalance = 100;
      const monthlyPayment = 1352;
      const annualRate = 2.6;

      const breakdown = calculatePaymentBreakdown(remainingBalance, monthlyPayment, annualRate);

      expect(breakdown.newBalance).toBe(0);
      expect(breakdown.principalPayment).toBeLessThanOrEqual(remainingBalance);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate complete amortization schedule', () => {
      const principal = 100000;
      const annualRate = 3.0;
      const years = 5;

      const schedule = generateAmortizationSchedule(principal, annualRate, years);

      expect(schedule).toHaveLength(60); // 5 years * 12 months
      expect(schedule[0].remainingBalance).toBeLessThan(principal);
      expect(schedule[schedule.length - 1].remainingBalance).toBe(0);

      // Check cumulative values
      const totalPrincipal = schedule[schedule.length - 1].cumulativePrincipal;
      expect(totalPrincipal).toBeCloseTo(principal, 0);
    });

    it('should have decreasing interest payments over time', () => {
      const principal = 200000;
      const annualRate = 2.5;
      const years = 10;

      const schedule = generateAmortizationSchedule(principal, annualRate, years);

      expect(schedule[0].interest).toBeGreaterThan(schedule[schedule.length - 1].interest);
    });
  });

  describe('calculateRemainingTerm', () => {
    it('should calculate remaining term correctly', () => {
      const remainingBalance = 150000;
      const monthlyPayment = 1200;
      const annualRate = 2.6;

      const term = calculateRemainingTerm(remainingBalance, monthlyPayment, annualRate);

      expect(term.months).toBeGreaterThan(0);
      expect(term.years).toBeGreaterThan(0);
      expect(term.formattedDuration).toBeTruthy();
    });

    it('should handle insufficient payment', () => {
      const remainingBalance = 200000;
      const monthlyPayment = 100; // Too small
      const annualRate = 3.0;

      const term = calculateRemainingTerm(remainingBalance, monthlyPayment, annualRate);

      expect(term.months).toBe(Infinity);
      expect(term.formattedDuration).toContain('Never');
    });
  });

  describe('calculateTotalInterest', () => {
    it('should calculate total interest over loan term', () => {
      const principal = 300000;
      const annualRate = 2.6;
      const years = 25;

      const result = calculateTotalInterest(principal, annualRate, years);

      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalPayment).toBeGreaterThan(principal);
      expect(result.interestRatio).toBeGreaterThan(0);
      expect(result.totalPayment).toBe(result.totalInterest + principal);
    });
  });

  describe('calculateEarlyPayoff', () => {
    it('should show savings from extra payments', () => {
      const remainingBalance = 200000;
      const monthlyPayment = 1200;
      const annualRate = 2.6;
      const extraPayment = 300;

      const result = calculateEarlyPayoff(remainingBalance, monthlyPayment, annualRate, extraPayment);

      expect(result.savings.interestSaved).toBeGreaterThan(0);
      expect(result.savings.timeSavedMonths).toBeGreaterThan(0);
      expect(result.accelerated.months).toBeLessThan(result.current.months);
      expect(result.accelerated.totalInterest).toBeLessThan(result.current.totalInterest);
    });
  });

  describe('calculateAffordability', () => {
    it('should calculate maximum affordable loan', () => {
      const monthlyIncome = 6000;
      const annualRate = 2.6;
      const years = 25;
      const dsr = 40;

      const result = calculateAffordability(monthlyIncome, annualRate, years, dsr);

      expect(result.maxMonthlyPayment).toBe(2400); // 40% of 6000
      expect(result.maxLoanAmount).toBeGreaterThan(0);
      expect(result.maxLoanAmount).toBeGreaterThan(500000); // Reasonable expectation for 25-year loan
    });
  });
});