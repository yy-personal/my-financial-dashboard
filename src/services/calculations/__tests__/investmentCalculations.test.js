import {
  calculateCompoundGrowth,
  calculatePortfolioMetrics,
  calculateDollarCostAveraging,
  calculateGoalSavings,
  calculateRetirementCorpus,
  ASSET_CLASSES
} from '../investmentCalculations';

describe('Investment Calculations', () => {
  describe('calculateCompoundGrowth', () => {
    it('should calculate correct compound growth with principal and contributions', () => {
      const principal = 10000;
      const monthlyContribution = 500;
      const annualReturn = 0.08; // 8%
      const years = 10;

      const result = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years);

      expect(result.finalValue).toBeGreaterThan(principal);
      expect(result.totalContributions).toBe(principal + monthlyContribution * 120);
      expect(result.totalReturns).toBeGreaterThan(0);
      expect(result.returnRate).toBe(8);
    });

    it('should handle zero principal with only contributions', () => {
      const principal = 0;
      const monthlyContribution = 1000;
      const annualReturn = 0.05;
      const years = 5;

      const result = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years);

      expect(result.principalGrowth).toBe(0);
      expect(result.contributionsGrowth).toBeGreaterThan(0);
      expect(result.finalValue).toBe(result.contributionsGrowth);
    });

    it('should handle zero contributions with only principal', () => {
      const principal = 50000;
      const monthlyContribution = 0;
      const annualReturn = 0.06;
      const years = 15;

      const result = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years);

      expect(result.contributionsGrowth).toBe(0);
      expect(result.principalGrowth).toBeGreaterThan(principal);
      expect(result.finalValue).toBe(result.principalGrowth);
    });

    it('should return zero values for invalid inputs', () => {
      const result1 = calculateCompoundGrowth(-1000, 500, 0.08, 10);
      const result2 = calculateCompoundGrowth(10000, -500, 0.08, 10);
      const result3 = calculateCompoundGrowth(10000, 500, 0.08, -5);

      expect(result1.finalValue).toBe(0);
      expect(result2.finalValue).toBe(0);
      expect(result3.finalValue).toBe(0);
    });

    it('should use memoization for repeated calls with same parameters', () => {
      const params = [10000, 500, 0.08, 10, 12];

      const result1 = calculateCompoundGrowth(...params);
      const result2 = calculateCompoundGrowth(...params);

      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Same object reference due to memoization
    });

    it('should calculate correctly with different compounding frequencies', () => {
      const principal = 10000;
      const monthlyContribution = 0;
      const annualReturn = 0.06;
      const years = 5;

      const monthly = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years, 12);
      const quarterly = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years, 4);
      const annually = calculateCompoundGrowth(principal, monthlyContribution, annualReturn, years, 1);

      // More frequent compounding should yield slightly higher returns
      expect(monthly.finalValue).toBeGreaterThan(quarterly.finalValue);
      expect(quarterly.finalValue).toBeGreaterThan(annually.finalValue);
    });
  });

  describe('calculatePortfolioMetrics', () => {
    it('should calculate portfolio metrics with valid allocations', () => {
      const allocations = [
        { assetClass: 'CASH', percentage: 20 },
        { assetClass: 'SINGAPORE_BONDS', percentage: 30 },
        { assetClass: 'GLOBAL_EQUITIES', percentage: 50 }
      ];

      const result = calculatePortfolioMetrics(allocations);

      expect(result.expectedReturn).toBeGreaterThan(0);
      expect(result.volatility).toBeGreaterThan(0);
      expect(result.sharpeRatio).toBeDefined();
      expect(result.riskLevel).toBeTruthy();
    });

    it('should handle empty allocations array', () => {
      const result = calculatePortfolioMetrics([]);

      expect(result.expectedReturn).toBe(0);
      expect(result.volatility).toBe(0);
      expect(result.sharpeRatio).toBe(0);
      expect(result.riskLevel).toBe('N/A');
    });

    it('should handle invalid input types', () => {
      const result1 = calculatePortfolioMetrics(null);
      const result2 = calculatePortfolioMetrics(undefined);
      const result3 = calculatePortfolioMetrics('invalid');

      expect(result1.expectedReturn).toBe(0);
      expect(result2.expectedReturn).toBe(0);
      expect(result3.expectedReturn).toBe(0);
    });

    it('should calculate higher returns for aggressive allocations', () => {
      const conservative = [
        { assetClass: 'CASH', percentage: 50 },
        { assetClass: 'SINGAPORE_BONDS', percentage: 50 }
      ];

      const aggressive = [
        { assetClass: 'GLOBAL_EQUITIES', percentage: 70 },
        { assetClass: 'SINGAPORE_EQUITIES', percentage: 30 }
      ];

      const conservativeResult = calculatePortfolioMetrics(conservative);
      const aggressiveResult = calculatePortfolioMetrics(aggressive);

      expect(aggressiveResult.expectedReturn).toBeGreaterThan(conservativeResult.expectedReturn);
      expect(aggressiveResult.volatility).toBeGreaterThan(conservativeResult.volatility);
    });

    it('should ignore invalid asset classes', () => {
      const allocations = [
        { assetClass: 'INVALID_ASSET', percentage: 50 },
        { assetClass: 'CASH', percentage: 50 }
      ];

      const result = calculatePortfolioMetrics(allocations);

      // Should only calculate based on valid CASH allocation
      expect(result.expectedReturn).toBeCloseTo(ASSET_CLASSES.CASH.expectedReturn * 100 / 2, 1);
    });
  });

  describe('calculateDollarCostAveraging', () => {
    it('should calculate DCA projection with scenarios', () => {
      const monthlyInvestment = 1000;
      const expectedReturn = 7;
      const years = 10;
      const volatility = 0.15;

      const result = calculateDollarCostAveraging(monthlyInvestment, expectedReturn, years, volatility);

      expect(result.baseScenario.finalValue).toBeGreaterThan(0);
      expect(result.optimisticScenario.finalValue).toBeGreaterThan(result.baseScenario.finalValue);
      expect(result.conservativeScenario.finalValue).toBeLessThan(result.baseScenario.finalValue);
      expect(result.totalContributed).toBe(monthlyInvestment * years * 12);
    });

    it('should handle zero monthly investment', () => {
      const result = calculateDollarCostAveraging(0, 7, 10, 0.15);

      expect(result.totalContributed).toBe(0);
      expect(result.baseScenario.finalValue).toBe(0);
    });
  });

  describe('calculateGoalSavings', () => {
    it('should calculate required monthly savings to reach goal', () => {
      const targetAmount = 100000;
      const currentAmount = 20000;
      const yearsToGoal = 10;
      const expectedReturn = 6;

      const result = calculateGoalSavings(targetAmount, currentAmount, yearsToGoal, expectedReturn);

      expect(result.requiredMonthly).toBeGreaterThan(0);
      expect(result.totalContributions).toBeGreaterThan(0);
      expect(result.isAchievable).toBe(true);
    });

    it('should handle goal already achieved with current amount', () => {
      const targetAmount = 50000;
      const currentAmount = 60000;
      const yearsToGoal = 10;
      const expectedReturn = 6;

      const result = calculateGoalSavings(targetAmount, currentAmount, yearsToGoal, expectedReturn);

      expect(result.requiredMonthly).toBe(0);
      expect(result.isAchievable).toBe(true);
    });

    it('should calculate higher required savings for shorter timeframes', () => {
      const targetAmount = 100000;
      const currentAmount = 10000;
      const expectedReturn = 6;

      const shortTerm = calculateGoalSavings(targetAmount, currentAmount, 5, expectedReturn);
      const longTerm = calculateGoalSavings(targetAmount, currentAmount, 20, expectedReturn);

      expect(shortTerm.requiredMonthly).toBeGreaterThan(longTerm.requiredMonthly);
    });
  });

  describe('calculateRetirementCorpus', () => {
    it('should calculate retirement corpus needed', () => {
      const desiredMonthlyIncome = 5000;
      const yearsInRetirement = 30;
      const inflationRate = 2;
      const withdrawalRate = 4;

      const result = calculateRetirementCorpus(
        desiredMonthlyIncome,
        yearsInRetirement,
        inflationRate,
        withdrawalRate
      );

      expect(result.recommendedCorpus).toBeGreaterThan(0);
      expect(result.desiredAnnualIncome).toBe(desiredMonthlyIncome * 12);
      expect(result.corpusUsingWithdrawalRate).toBeGreaterThan(0);
    });

    it('should calculate higher corpus for higher monthly income', () => {
      const lowIncome = calculateRetirementCorpus(3000, 30, 2, 4);
      const highIncome = calculateRetirementCorpus(8000, 30, 2, 4);

      expect(highIncome.recommendedCorpus).toBeGreaterThan(lowIncome.recommendedCorpus);
    });

    it('should use default parameters when not provided', () => {
      const desiredMonthlyIncome = 5000;

      const result = calculateRetirementCorpus(desiredMonthlyIncome);

      expect(result.yearsInRetirement).toBe(30);
      expect(result.inflationRate).toBe(2);
      expect(result.withdrawalRate).toBe(4);
    });
  });

  describe('Performance and Caching', () => {
    it('should demonstrate memoization performance benefit', () => {
      const params = [10000, 500, 0.08, 10, 12];

      // First call - calculation
      const start1 = performance.now();
      const result1 = calculateCompoundGrowth(...params);
      const time1 = performance.now() - start1;

      // Second call - should use cache
      const start2 = performance.now();
      const result2 = calculateCompoundGrowth(...params);
      const time2 = performance.now() - start2;

      // Cached call should be faster (though timing can be unreliable in tests)
      expect(result1).toEqual(result2);
      // Note: We can't reliably assert time2 < time1 in unit tests
    });

    it('should handle cache with different parameter combinations', () => {
      const variations = [
        [10000, 500, 0.08, 10, 12],
        [10000, 500, 0.08, 10, 4],
        [20000, 500, 0.08, 10, 12],
        [10000, 1000, 0.08, 10, 12],
        [10000, 500, 0.06, 10, 12]
      ];

      const results = variations.map(params => calculateCompoundGrowth(...params));

      // Each variation should have different results
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].finalValue).not.toBe(results[i + 1].finalValue);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const result = calculateCompoundGrowth(1000000, 10000, 0.10, 30);

      expect(result.finalValue).toBeGreaterThan(1000000);
      expect(isFinite(result.finalValue)).toBe(true);
    });

    it('should handle very small returns', () => {
      const result = calculateCompoundGrowth(10000, 100, 0.001, 5);

      expect(result.finalValue).toBeGreaterThan(10000);
      expect(result.totalReturns).toBeGreaterThan(0);
    });

    it('should handle zero return rate', () => {
      const principal = 10000;
      const monthlyContribution = 500;
      const result = calculateCompoundGrowth(principal, monthlyContribution, 0, 5);

      // With zero return, final value should equal contributions
      expect(result.finalValue).toBe(principal + monthlyContribution * 60);
      expect(result.totalReturns).toBe(0);
    });
  });
});
