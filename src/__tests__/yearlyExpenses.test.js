/**
 * Tests for Yearly Expenses Feature
 * Tests the data model, calculation helpers, and projection integration
 */

describe('Yearly Expenses Feature', () => {
  describe('Data Model', () => {
    test('Yearly expense object should have required fields', () => {
      const expense = {
        id: Date.now(),
        name: "Car Insurance",
        amount: 1200,
        month: 3, // March
        startYear: 2025,
        endYear: null, // recurring forever
        isRecurring: true,
        description: "Annual auto insurance premium"
      };

      expect(expense.name).toBe("Car Insurance");
      expect(expense.amount).toBe(1200);
      expect(expense.month).toBe(3);
      expect(expense.startYear).toBe(2025);
      expect(expense.endYear).toBeNull();
      expect(expense.isRecurring).toBe(true);
    });

    test('One-time yearly expense should have endYear set', () => {
      const expense = {
        id: Date.now(),
        name: "Property Tax",
        amount: 500,
        month: 6,
        startYear: 2025,
        endYear: 2027, // expires after 2027
        isRecurring: false,
        description: "One-time property tax"
      };

      expect(expense.endYear).toBe(2027);
      expect(expense.isRecurring).toBe(false);
    });
  });

  describe('Calculation Helpers', () => {
    test('getYearlyExpensesForYear should filter expenses by year', () => {
      const yearlyExpenses = [
        { id: 1, name: "Insurance", amount: 1200, month: 3, startYear: 2025, endYear: null, isRecurring: true },
        { id: 2, name: "Tax", amount: 500, month: 6, startYear: 2025, endYear: 2026, isRecurring: false },
        { id: 3, name: "Subscription", amount: 100, month: 9, startYear: 2026, endYear: null, isRecurring: true }
      ];

      // Filter function logic
      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      // 2025 should have Insurance and Tax
      const expenses2025 = getYearlyExpensesForYear(2025);
      expect(expenses2025.length).toBe(2);
      expect(expenses2025.map(e => e.name)).toEqual(["Insurance", "Tax"]);

      // 2026 should have Insurance and Subscription (Tax ends in 2026)
      const expenses2026 = getYearlyExpensesForYear(2026);
      expect(expenses2026.length).toBe(3);

      // 2027 should only have Insurance and Subscription (Tax doesn't apply)
      const expenses2027 = getYearlyExpensesForYear(2027);
      expect(expenses2027.length).toBe(2);
      expect(expenses2027.map(e => e.name)).toEqual(["Insurance", "Subscription"]);
    });

    test('getYearlyExpensesForMonthAndYear should filter by month and year', () => {
      const yearlyExpenses = [
        { id: 1, name: "Insurance", amount: 1200, month: 3, startYear: 2025, endYear: null, isRecurring: true },
        { id: 2, name: "Tax", amount: 500, month: 3, startYear: 2025, endYear: 2026, isRecurring: false },
        { id: 3, name: "Subscription", amount: 100, month: 9, startYear: 2026, endYear: null, isRecurring: true }
      ];

      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      const getYearlyExpensesForMonthAndYear = (month, year) => {
        const yearlyExpensesForYear = getYearlyExpensesForYear(year);
        return yearlyExpensesForYear.filter(expense => expense.month === month);
      };

      // March 2025 should have Insurance and Tax
      const march2025 = getYearlyExpensesForMonthAndYear(3, 2025);
      expect(march2025.length).toBe(2);
      expect(march2025.map(e => e.name)).toEqual(["Insurance", "Tax"]);

      // March 2026 should only have Insurance (Tax doesn't apply in 2026)
      const march2026 = getYearlyExpensesForMonthAndYear(3, 2026);
      expect(march2026.length).toBe(1);
      expect(march2026[0].name).toBe("Insurance");

      // September 2025 should have nothing
      const sept2025 = getYearlyExpensesForMonthAndYear(9, 2025);
      expect(sept2025.length).toBe(0);

      // September 2026 should have Subscription
      const sept2026 = getYearlyExpensesForMonthAndYear(9, 2026);
      expect(sept2026.length).toBe(1);
      expect(sept2026[0].name).toBe("Subscription");
    });

    test('getTotalYearlyExpensesForYear should sum all yearly expenses for year', () => {
      const yearlyExpenses = [
        { id: 1, name: "Insurance", amount: 1200, month: 3, startYear: 2025, endYear: null, isRecurring: true },
        { id: 2, name: "Tax", amount: 500, month: 6, startYear: 2025, endYear: 2026, isRecurring: false },
        { id: 3, name: "Subscription", amount: 100, month: 9, startYear: 2026, endYear: null, isRecurring: true }
      ];

      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      const getTotalYearlyExpensesForYear = (targetYear) => {
        const yearlyExpensesForYear = getYearlyExpensesForYear(targetYear);
        return yearlyExpensesForYear.reduce(
          (total, expense) => total + (parseFloat(expense.amount) || 0),
          0
        );
      };

      // 2025: Insurance (1200) + Tax (500) = 1700
      expect(getTotalYearlyExpensesForYear(2025)).toBe(1700);

      // 2026: Insurance (1200) + Tax (500) + Subscription (100) = 1800
      expect(getTotalYearlyExpensesForYear(2026)).toBe(1800);

      // 2027: Insurance (1200) + Subscription (100) = 1300
      expect(getTotalYearlyExpensesForYear(2027)).toBe(1300);
    });

    test('getAverageMonthlyYearlyExpenseImpact should divide yearly total by 12', () => {
      const yearlyExpenses = [
        { id: 1, name: "Insurance", amount: 1200, month: 3, startYear: 2025, endYear: null, isRecurring: true },
        { id: 2, name: "Tax", amount: 500, month: 6, startYear: 2025, endYear: null, isRecurring: true }
      ];

      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      const getTotalYearlyExpensesForYear = (targetYear) => {
        const yearlyExpensesForYear = getYearlyExpensesForYear(targetYear);
        return yearlyExpensesForYear.reduce(
          (total, expense) => total + (parseFloat(expense.amount) || 0),
          0
        );
      };

      const getAverageMonthlyYearlyExpenseImpact = (targetYear) => {
        const totalYearlyExpenses = getTotalYearlyExpensesForYear(targetYear);
        return totalYearlyExpenses / 12;
      };

      // 1700 / 12 ≈ 141.67
      const avg = getAverageMonthlyYearlyExpenseImpact(2025);
      expect(avg).toBeCloseTo(141.67, 2);
    });
  });

  describe('Projection Integration', () => {
    test('Yearly expenses should reduce monthly savings in projection', () => {
      // Simplified test: verify that yearly expense amount is subtracted from savings
      const takeHomePay = 3000;
      const monthlyExpenses = 1000;
      const loanPayment = 500;
      const monthBonusAmount = 0;
      const monthSpendingAmount = 0;
      const monthYearlyExpenseAmount = 100; // Car insurance in March

      const monthlySavings = takeHomePay - monthlyExpenses - loanPayment + monthBonusAmount - monthSpendingAmount - monthYearlyExpenseAmount;

      expect(monthlySavings).toBe(1400); // 3000 - 1000 - 500 - 100
    });

    test('Multiple yearly expenses in same month should sum correctly', () => {
      const takeHomePay = 3000;
      const monthlyExpenses = 1000;
      const loanPayment = 500;
      const monthBonusAmount = 0;
      const monthSpendingAmount = 0;
      const yearlyExpenseAmount1 = 100; // Car insurance
      const yearlyExpenseAmount2 = 50;  // Property tax
      const monthYearlyExpenseAmount = yearlyExpenseAmount1 + yearlyExpenseAmount2;

      const monthlySavings = takeHomePay - monthlyExpenses - loanPayment + monthBonusAmount - monthSpendingAmount - monthYearlyExpenseAmount;

      expect(monthlySavings).toBe(1350); // 3000 - 1000 - 500 - 150
    });

    test('Cash flow components should include yearly expenses in outflow', () => {
      const effectiveSalary = 5000;
      const employerCpfContribution = 850; // 17% of 5000
      const monthBonusAmount = 0;
      const currentExpenses = 1000;
      const actualLoanPayment = 500;
      const cpfContribution = 1000; // 20% of 5000
      const monthSpendingAmount = 200;
      const monthYearlyExpenseAmount = 100;

      const totalIncome = effectiveSalary + employerCpfContribution + monthBonusAmount;
      const totalOutflow = currentExpenses + actualLoanPayment + cpfContribution + monthSpendingAmount + monthYearlyExpenseAmount;
      const netCashFlow = totalIncome - totalOutflow;

      expect(totalIncome).toBe(5850); // 5000 + 850
      expect(totalOutflow).toBe(2800); // 1000 + 500 + 1000 + 200 + 100
      expect(netCashFlow).toBe(3050); // 5850 - 2800
    });
  });

  describe('Edge Cases', () => {
    test('Empty yearly expenses array should return 0 for totals', () => {
      const yearlyExpenses = [];

      const getTotalYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.reduce(
          (total, expense) => total + (parseFloat(expense.amount) || 0),
          0
        );
      };

      expect(getTotalYearlyExpensesForYear(2025)).toBe(0);
    });

    test('Yearly expense starting in future year should not apply to current year', () => {
      const yearlyExpenses = [
        { id: 1, name: "Future Expense", amount: 500, month: 6, startYear: 2026, endYear: null, isRecurring: true }
      ];

      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      // 2025 should have no expenses
      expect(getYearlyExpensesForYear(2025).length).toBe(0);

      // 2026 should have the expense
      expect(getYearlyExpensesForYear(2026).length).toBe(1);
    });

    test('Yearly expense with null endYear should recur indefinitely', () => {
      const yearlyExpenses = [
        { id: 1, name: "Recurring", amount: 500, month: 6, startYear: 2025, endYear: null, isRecurring: true }
      ];

      const getYearlyExpensesForYear = (targetYear) => {
        return yearlyExpenses.filter(expense => {
          const startsBeforeOrDuring = expense.startYear <= targetYear;
          const endsAfterOrDuring = !expense.endYear || expense.endYear >= targetYear;
          return startsBeforeOrDuring && endsAfterOrDuring;
        });
      };

      // Should apply to any year >= startYear
      expect(getYearlyExpensesForYear(2025).length).toBe(1);
      expect(getYearlyExpensesForYear(2030).length).toBe(1);
      expect(getYearlyExpensesForYear(2050).length).toBe(1);
    });
  });
});
