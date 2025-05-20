import React, { useContext, useState } from "react";
import { FinancialContext } from "../context/FinancialContext";
import ExpenseBreakdown from "../components/dashboard/ExpenseBreakdown";
import { 
  NetWorthChart, 
  SavingsGrowthChart, 
  CashFlowChart 
} from "../components/dashboard/charts";
import Card from "../components/common/Card";
import { formatCurrency, formatPercent } from "../services/formatters/currencyFormatters";
import CpfDashboard from "../components/CpfDashboard";

/**
 * Dashboard Page Component
 * Main financial dashboard showing financial summary, charts, and projections
 * 
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const {
    financialData,
    updateFinancialData,
    updateProjectionSettings,
    totalExpenses,
    calculateAge,
    getMonthName,
    formatDate,
  } = useContext(FinancialContext);

  const [activeTab, setActiveTab] = useState("summary");

  // State for projection rows to display
  const [rowsToDisplay, setRowsToDisplay] = useState(
    financialData.projectionSettings?.rowsToDisplay || 36
  );

  // Handle changing the number of rows to display
  const handleRowsToDisplayChange = (e) => {
    const value = parseInt(e.target.value);
    setRowsToDisplay(value);
    updateProjectionSettings({
      rowsToDisplay: value,
    });
  };

  // Calculate financial projection
  const calculateProjection = () => {
    const projection = [];

    // Extract values from context
    const { personalInfo, income, expenses, yearlyBonuses } = financialData;

    // Initial values
    let currentSavings = personalInfo.currentSavings;
    let loanRemaining = personalInfo.remainingLoan;
    let cpfBalance = personalInfo.currentCpfBalance || 0; // Use user-provided CPF balance
    const birthYear = personalInfo.birthday.year;
    const birthMonth = personalInfo.birthday.month;

    // Parameters
    let currentSalary = income.currentSalary;
    const cpfRate = income.cpfRate / 100;
    const employerCpfRate = income.employerCpfRate / 100;
    const monthlyExpenses = totalExpenses;
    const loanPayment = personalInfo.monthlyRepayment;
    const annualInterestRate = personalInfo.interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;

    // Calculate months
    let startMonth = personalInfo.projectionStart.month;
    let startYear = personalInfo.projectionStart.year;

    // Get salary adjustments if available, or create from legacy data
    const salaryAdjustments = income.salaryAdjustments || [];

    // If using legacy format, convert to array format for compatibility
    if (!income.salaryAdjustments && income.futureSalary) {
      salaryAdjustments.push({
        month: income.salaryAdjustmentMonth,
        year: income.salaryAdjustmentYear,
        newSalary: income.futureSalary,
      });
    }

    // Sort salary adjustments by date
    const sortedAdjustments = [...salaryAdjustments].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Get yearly bonuses
    const sortedBonuses = yearlyBonuses
      ? [...yearlyBonuses].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
      : [];

    // Track milestones
    let loanPaidOffMonth = null;
    let savingsGoalReachedMonth = null; // This will now track only cash savings (excluding CPF)

    // Generate projection for 60 months (5 years)
    for (let month = 0; month < 60; month++) {
      const currentMonth = ((startMonth + month - 1) % 12) + 1;
      const currentYear =
        startYear + Math.floor((startMonth + month - 1) / 12);
      const monthYearStr = `${getMonthName(currentMonth).substring(
        0,
        3
      )} ${currentYear}`;

      // Calculate age
      let ageYears = currentYear - birthYear;
      let ageMonths = currentMonth - birthMonth;
      if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
      }
      const ageStr = `${ageYears}y ${ageMonths}m`;

      // Check for salary adjustments
      for (const adjustment of sortedAdjustments) {
        if (
          currentMonth === adjustment.month &&
          currentYear === adjustment.year
        ) {
          currentSalary = adjustment.newSalary;
          break;
        }
      }

      // Calculate take-home pay
      const cpfContribution = currentSalary * cpfRate;
      const employerCpf = currentSalary * employerCpfRate;
      const takeHomePay = currentSalary - cpfContribution;

      // Check for yearly bonuses in this month
      let bonusAmount = 0;
      let bonusDescription = "";

      for (const bonus of sortedBonuses) {
        if (
          currentMonth === bonus.month &&
          currentYear === bonus.year
        ) {
          bonusAmount += bonus.amount;
          bonusDescription = bonusDescription
            ? `${bonusDescription}, ${bonus.description}`
            : bonus.description;
        }
      }

      // Calculate loan payment and remaining balance
      let actualLoanPayment = loanPayment;
      let interestForMonth = loanRemaining * monthlyInterestRate;
      let principalPayment = Math.min(
        loanRemaining,
        loanPayment - interestForMonth
      );

      if (loanRemaining <= 0) {
        interestForMonth = 0;
        principalPayment = 0;
        actualLoanPayment = 0;
        loanRemaining = 0;
      } else {
        loanRemaining = Math.max(0, loanRemaining - principalPayment);
      }

      // Record loan paid off milestone
      if (loanRemaining === 0 && loanPaidOffMonth === null) {
        loanPaidOffMonth = month;
      }

      // Calculate monthly savings (including any bonuses)
      const monthlySavings =
        takeHomePay - monthlyExpenses - actualLoanPayment + bonusAmount;

      // Update balances
      cpfBalance += cpfContribution + employerCpf;
      currentSavings += monthlySavings;
      const totalNetWorth = currentSavings + cpfBalance - loanRemaining;

      // Record savings goal milestone - now only for cash savings (excluding CPF)
      if (currentSavings >= 100000 && savingsGoalReachedMonth === null) {
        savingsGoalReachedMonth = month;
      }

      // Create data point
      projection.push({
        month: month + 1,
        date: monthYearStr,
        age: ageStr,
        monthlySalary: currentSalary,
        takeHomePay: takeHomePay,
        expenses: monthlyExpenses,
        loanPayment: actualLoanPayment,
        loanRemaining: loanRemaining,
        monthlySavings: monthlySavings,
        bonusAmount: bonusAmount,
        bonusDescription: bonusDescription,
        cpfContribution: cpfContribution,
        employerCpfContribution: employerCpf,
        totalCpfContribution: cpfContribution + employerCpf,
        cpfBalance: cpfBalance,
        cashSavings: currentSavings,
        totalNetWorth: totalNetWorth,
        milestone:
          month === loanPaidOffMonth
            ? "Loan Paid Off"
            : month === savingsGoalReachedMonth
            ? "100K Cash Savings Goal"
            : bonusAmount > 0
            ? bonusDescription
            : null,
      });
    }

    return {
      projection,
      loanPaidOffMonth:
        loanPaidOffMonth !== null ? projection[loanPaidOffMonth] : null,
      savingsGoalReachedMonth:
        savingsGoalReachedMonth !== null
          ? projection[savingsGoalReachedMonth]
          : null,
    };
  };

  const { projection, loanPaidOffMonth, savingsGoalReachedMonth } =
    calculateProjection();

  // Expense breakdown for pie chart
  const expenseData = [
    ...financialData.expenses.map((expense) => ({
      name: expense.name,
      value: expense.amount,
    })),
    {
      name: "Loan Payment",
      value: financialData.personalInfo.monthlyRepayment,
    },
  ];

  // Extract summary data
  const timeToPayLoan = loanPaidOffMonth
    ? `${Math.floor(loanPaidOffMonth.month / 12)} years ${
        loanPaidOffMonth.month % 12
      } months`
    : "Not within projection";

  const timeToSavingsGoal = savingsGoalReachedMonth
    ? `${Math.floor(savingsGoalReachedMonth.month / 12)} years ${
        savingsGoalReachedMonth.month % 12
      } months`
    : "Not within projection";

  // Current monthly income & expenses breakdown
  const currentSalary = financialData.income.currentSalary;
  const cpfContribution =
    currentSalary * (financialData.income.cpfRate / 100);
  const employerCpfContribution =
    currentSalary * (financialData.income.employerCpfRate / 100);
  const takeHomePay = currentSalary - cpfContribution;
  const monthlyExpenses = totalExpenses;
  const loanPayment = financialData.personalInfo.monthlyRepayment;
  const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
  const savingsRate = monthlySavings / takeHomePay;
  const totalMonthlyIncome = currentSalary + employerCpfContribution;

  // Calculate total yearly bonuses for current year
  const currentYear = new Date().getFullYear();
  const yearlyBonusesThisYear = financialData.yearlyBonuses
    ? financialData.yearlyBonuses
        .filter((bonus) => bonus.year === currentYear)
        .reduce((total, bonus) => total + bonus.amount, 0)
    : 0;

  // Filtered data for charts (every 3 months)
  const chartData = projection.filter((item, index) => index % 3 === 0);

  // Calculate asset allocation percentages
  const liquidCash = financialData.personalInfo.currentSavings;
  const cpfSavings = financialData.personalInfo.currentCpfBalance || 0;
  const totalAssets = liquidCash + cpfSavings;

  const liquidCashPercentage =
    totalAssets > 0 ? (liquidCash / totalAssets) * 100 : 0;
  const cpfPercentage =
    totalAssets > 0 ? (cpfSavings / totalAssets) * 100 : 0;

  // Asset allocation data for pie chart
  const assetAllocationData = [
    { name: "Liquid Cash", value: liquidCash },
    { name: "CPF (Locked)", value: cpfSavings },
  ];

  // Calculate upcoming financial events (next 3 months)
  const upcomingEvents = [];
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const nextThreeMonths = [
    { month: currentMonth, year: currentYear },
    {
      month:
        currentMonth + 1 > 12
          ? currentMonth + 1 - 12
          : currentMonth + 1,
      year: currentMonth + 1 > 12 ? currentYear + 1 : currentYear,
    },
    {
      month:
        currentMonth + 2 > 12
          ? currentMonth + 2 - 12
          : currentMonth + 2,
      year: currentMonth + 2 > 12 ? currentYear + 1 : currentYear,
    },
  ];

  // Find salary adjustments in next 3 months
  if (financialData.income.salaryAdjustments) {
    financialData.income.salaryAdjustments.forEach((adjustment) => {
      const isUpcoming = nextThreeMonths.some(
        (period) =>
          period.month === adjustment.month &&
          period.year === adjustment.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Salary Adjustment",
          date: `${getMonthName(adjustment.month)} ${
            adjustment.year
          }`,
          amount: adjustment.newSalary,
          description: `Salary changes to ${formatCurrency(
            adjustment.newSalary
          )}`,
        });
      }
    });
  }

  // Find bonuses in next 3 months
  if (financialData.yearlyBonuses) {
    financialData.yearlyBonuses.forEach((bonus) => {
      const isUpcoming = nextThreeMonths.some(
        (period) =>
          period.month === bonus.month && period.year === bonus.year
      );

      if (isUpcoming) {
        upcomingEvents.push({
          type: "Bonus",
          date: `${getMonthName(bonus.month)} ${bonus.year}`,
          amount: bonus.amount,
          description: bonus.description,
        });
      }
    });
  }

  // InfoItem component for consistent display of key-value pairs
  const InfoItem = ({ label, value, highlighted = false }) => (
    <div
      className={`py-2 flex justify-between items-center border-b ${
        highlighted ? "bg-blue-50" : ""
      }`}
    >
      <span className="text-gray-700">{label}</span>
      <span
        className={`font-medium ${highlighted ? "text-blue-700" : ""}`}
      >
        {value}
      </span>
    </div>
  );

  // Status indicator component
  const StatusIndicator = ({
    value,
    threshold1,
    threshold2,
    reverse = false,
  }) => {
    let color = "bg-green-500";

    if (reverse) {
      if (value > threshold1) color = "bg-yellow-500";
      if (value > threshold2) color = "bg-red-500";
    } else {
      if (value < threshold1) color = "bg-yellow-500";
      if (value < threshold2) color = "bg-red-500";
    }

    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-lg mb-6 shadow-md">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          PERSONAL FINANCIAL DASHBOARD
        </h1>
      </div>

      {/* Mobile-friendly Navigation Tabs */}
      <div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "summary"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "milestones"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("milestones")}
        >
          Milestones
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "charts"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "projection"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("projection")}
        >
          Projection
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "cpf"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("cpf")}
        >
          CPF
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Financial Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Liquid Cash Card */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    Liquid Cash
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(
                      financialData.personalInfo
                        .currentSavings
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Immediately available
                  </p>
                </div>
                <StatusIndicator
                  value={
                    financialData.personalInfo
                      .currentSavings
                  }
                  threshold1={5000}
                  threshold2={2000}
                />
              </div>
            </div>

            {/* CPF Balance Card */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    CPF Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(
                      financialData.personalInfo
                        .currentCpfBalance || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Locked until retirement
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining Loan Card */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    Remaining Loan
                  </p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(
                      financialData.personalInfo
                        .remainingLoan
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {timeToPayLoan !==
                    "Not within projection"
                      ? `Paid off in ${timeToPayLoan}`
                      : "Long-term loan"}
                  </p>
                </div>
                <StatusIndicator
                  value={
                    financialData.personalInfo.remainingLoan
                  }
                  threshold1={20000}
                  threshold2={40000}
                  reverse={true}
                />
              </div>
            </div>

            {/* Net Worth Card */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">
                Total Net Worth
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(
                  financialData.personalInfo.currentSavings +
                    (financialData.personalInfo
                      .currentCpfBalance || 0) -
                    financialData.personalInfo.remainingLoan
                )}
              </p>
              <p className="text-xs text-gray-500">
                Assets minus liabilities
              </p>
            </div>
          </div>

          {/* Monthly Overview Card */}
          <Card title="Monthly Cash Flow" titleColor="bg-green-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Monthly Income
                </h3>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(takeHomePay)}
                </p>
                <p className="text-sm text-gray-600">
                  Take-home pay after CPF
                </p>
              </div>

              <div className="bg-red-50 p-3 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">
                  Monthly Expenses
                </h3>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(
                    monthlyExpenses + loanPayment
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Including loan payment
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  Monthly Savings
                </h3>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(monthlySavings)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPercent(savingsRate)} of take-home
                  pay
                </p>
              </div>
            </div>

            {/* Cash Flow Progress Bar */}
            <div className="mt-2 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 font-medium">
                  Income
                </span>
                <span className="text-gray-600">
                  {formatCurrency(takeHomePay)}
                </span>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-red-500 h-full"
                    style={{
                      width: `${
                        (monthlyExpenses /
                          takeHomePay) *
                        100
                      }%`,
                    }}
                    title="Living Expenses"
                  ></div>
                  <div
                    className="bg-orange-500 h-full"
                    style={{
                      width: `${
                        (loanPayment / takeHomePay) *
                        100
                      }%`,
                    }}
                    title="Loan Payment"
                  ></div>
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${
                        (monthlySavings / takeHomePay) *
                        100
                      }%`,
                    }}
                    title="Savings"
                  ></div>
                </div>
              </div>
              <div className="flex text-xs mt-1 justify-between">
                <span className="text-red-600">
                  Expenses: {formatCurrency(monthlyExpenses)}
                </span>
                <span className="text-orange-600">
                  Loan: {formatCurrency(loanPayment)}
                </span>
                <span className="text-green-600">
                  Savings: {formatCurrency(monthlySavings)}
                </span>
              </div>
            </div>
          </Card>

          {/* Expense Breakdown (Using our new component) */}
          <ExpenseBreakdown 
            expenseData={expenseData} 
            totalExpenses={totalExpenses} 
            loanPayment={loanPayment} 
          />

          {/* More cards and content... */}
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Net Worth Chart */}
            <NetWorthChart 
              chartData={chartData} 
              loanPaidOffMonth={loanPaidOffMonth} 
              savingsGoalReachedMonth={savingsGoalReachedMonth} 
            />

            {/* Savings Growth Chart */}
            <SavingsGrowthChart 
              chartData={chartData} 
              savingsGoalReachedMonth={savingsGoalReachedMonth} 
            />

            {/* Cash Flow Chart */}
            <CashFlowChart chartData={chartData} />
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === "milestones" && (
        <div className="space-y-6">
          <Card title="Key Financial Milestones">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Milestone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time to Achieve
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Savings at Milestone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      Student Loan Paid Off
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {loanPaidOffMonth
                        ? loanPaidOffMonth.date
                        : "Not within projection"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {timeToPayLoan}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {loanPaidOffMonth
                        ? loanPaidOffMonth.age
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {loanPaidOffMonth
                        ? formatCurrency(
                            loanPaidOffMonth.cashSavings
                          )
                        : "-"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      $100,000 Savings Achieved
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {savingsGoalReachedMonth
                        ? savingsGoalReachedMonth.date
                        : "Not within projection"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {timeToSavingsGoal}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {savingsGoalReachedMonth
                        ? savingsGoalReachedMonth.age
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {savingsGoalReachedMonth
                        ? formatCurrency(
                            savingsGoalReachedMonth.cashSavings
                          )
                        : "-"}
                    </td>
                  </tr>

                  {/* Yearly Bonuses as Milestones */}
                  {financialData.yearlyBonuses &&
                    financialData.yearlyBonuses.map(
                      (bonus, index) => {
                        // Find projection entry for this bonus
                        const bonusMonth =
                          projection.find((p) =>
                            p.date.includes(
                              `${getMonthName(
                                bonus.month
                              ).substring(
                                0,
                                3
                              )} ${bonus.year}`
                            )
                          );

                        if (!bonusMonth) return null;

                        return (
                          <tr
                            key={`bonus-${index}`}
                            className="hover:bg-gray-50 bg-green-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                              {bonus.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {bonusMonth.date}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {Math.floor(
                                bonusMonth.month /
                                  12
                              )}{" "}
                              years{" "}
                              {bonusMonth.month %
                                12}{" "}
                              months
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {bonusMonth.age}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatCurrency(
                                bonus.amount
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Towards Loan Payment */}
            <Card title="Progress Towards Loan Payment">
              {loanPaidOffMonth && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Original Loan:{" "}
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.personalInfo
                            .remainingLoan
                        )}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Remaining:{" "}
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          financialData.personalInfo
                            .remainingLoan > 0
                            ? projection[0]
                                .loanRemaining
                            : 0
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((financialData
                              .personalInfo
                              .remainingLoan -
                              projection[0]
                                .loanRemaining) /
                              financialData
                                .personalInfo
                                .remainingLoan) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <p className="text-green-800 font-medium">
                          Congratulations! You'll be
                          debt-free by{" "}
                          <span className="font-bold">
                            {loanPaidOffMonth.date}
                          </span>{" "}
                          at age{" "}
                          {loanPaidOffMonth.age}.
                        </p>
                        <p className="mt-1 text-green-700">
                          Total repayment period:{" "}
                          {timeToPayLoan} from{" "}
                          {getMonthName(
                            financialData
                              .personalInfo
                              .projectionStart
                              .month
                          )}{" "}
                          {
                            financialData
                              .personalInfo
                              .projectionStart
                              .year
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!loanPaidOffMonth && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Original Loan:{" "}
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.personalInfo
                            .remainingLoan
                        )}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Remaining:{" "}
                      <span className="font-medium text-red-600">
                        {formatCurrency(
                          projection[
                            projection.length - 1
                          ].loanRemaining
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (1 -
                              projection[
                                projection.length -
                                  1
                              ].loanRemaining /
                                financialData
                                  .personalInfo
                                  .remainingLoan) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <p className="text-blue-800 font-medium">
                          You're making progress, but
                          your loan won't be fully
                          paid within the 5-year
                          projection period.
                        </p>
                        <p className="mt-1 text-blue-700">
                          Consider increasing your
                          monthly payments to
                          accelerate debt payoff.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Progress Towards Savings Goal */}
            <Card title="Progress Towards $100K Cash Savings">
              {savingsGoalReachedMonth && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Starting Cash:{" "}
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.personalInfo
                            .currentSavings
                        )}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Goal:{" "}
                      <span className="font-medium text-green-600">
                        {formatCurrency(100000)}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(
                          100,
                          (financialData.personalInfo
                            .currentSavings /
                            100000) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <p className="text-green-800 font-medium">
                          Congratulations! You'll
                          reach $100,000 in cash
                          savings by{" "}
                          <span className="font-bold">
                            {
                              savingsGoalReachedMonth.date
                            }
                          </span>{" "}
                          at age{" "}
                          {
                            savingsGoalReachedMonth.age
                          }
                          .
                        </p>
                        <p className="mt-1 text-green-700">
                          Total savings period:{" "}
                          {timeToSavingsGoal} from{" "}
                          {getMonthName(
                            financialData
                              .personalInfo
                              .projectionStart
                              .month
                          )}{" "}
                          {
                            financialData
                              .personalInfo
                              .projectionStart
                              .year
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!savingsGoalReachedMonth && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Starting Cash:{" "}
                      <span className="font-medium">
                        {formatCurrency(
                          financialData.personalInfo
                            .currentSavings
                        )}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Current:{" "}
                      <span className="font-medium text-blue-600">
                        {formatCurrency(
                          projection[
                            projection.length - 1
                          ].cashSavings
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (financialData
                              .personalInfo
                              .currentSavings /
                              100000) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div>
                        <p className="text-blue-800 font-medium">
                          You're making progress, but
                          you won't reach the $100,000
                          cash savings goal within the
                          5-year projection period.
                        </p>
                        <p className="mt-1 text-blue-700">
                          Consider increasing your
                          savings rate after paying
                          off your loan to accelerate
                          progress.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Projection Table Tab */}
      {activeTab === "projection" && (
        <Card title="Monthly Financial Projection">
          {/* Rows to Display Control */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="mr-4 mb-2 sm:mb-0">
                <label
                  htmlFor="rowsToDisplay"
                  className="block text-sm font-medium text-blue-700 mb-1"
                >
                  Months to Display:
                </label>
                <select
                  id="rowsToDisplay"
                  value={rowsToDisplay}
                  onChange={handleRowsToDisplayChange}
                  className="w-32 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={12}>
                    12 months (1 year)
                  </option>
                  <option value={24}>
                    24 months (2 years)
                  </option>
                  <option value={36}>
                    36 months (3 years)
                  </option>
                  <option value={48}>
                    48 months (4 years)
                  </option>
                  <option value={60}>
                    60 months (5 years)
                  </option>
                </select>
              </div>
              <div className="flex items-center">
                <div className="hidden sm:block text-blue-700 mr-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <p className="text-sm text-blue-700">
                  Showing {rowsToDisplay} months of financial
                  projection data
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4">
            <div className="inline-block min-w-full align-middle p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Month
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Take-Home
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Expenses
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Loan Payment
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Loan Remaining
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Bonus
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Monthly Savings
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Cash Savings
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      CPF Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projection
                    .slice(0, rowsToDisplay)
                    .map((month, index) => (
                      <tr
                        key={index}
                        className={`${
                          month.milestone
                            ? "bg-green-50"
                            : index % 2 === 0
                            ? "bg-gray-50"
                            : ""
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                          {month.month}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                          {month.date}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
                          {formatCurrency(
                            month.takeHomePay
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-orange-600">
                          {formatCurrency(
                            month.expenses
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-red-600">
                          {formatCurrency(
                            month.loanPayment
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-red-600">
                          {formatCurrency(
                            month.loanRemaining
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-purple-600">
                          {month.bonusAmount > 0
                            ? formatCurrency(
                                month.bonusAmount
                              )
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
                          {formatCurrency(
                            month.monthlySavings
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
                          {formatCurrency(
                            month.cashSavings
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-purple-600">
                          {formatCurrency(
                            month.cpfBalance
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Show milestone information if available */}
          {(loanPaidOffMonth ||
            savingsGoalReachedMonth ||
            financialData.yearlyBonuses?.length > 0) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-700 mb-2">
                Key Milestones:
              </h3>
              <ul className="space-y-2">
                {loanPaidOffMonth && (
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      <span className="font-medium">
                        Loan Paid Off:
                      </span>{" "}
                      {loanPaidOffMonth.date} (Month{" "}
                      {loanPaidOffMonth.month})
                    </span>
                  </li>
                )}
                {savingsGoalReachedMonth && (
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      <span className="font-medium">
                        $100K Savings Reached:
                      </span>{" "}
                      {savingsGoalReachedMonth.date}{" "}
                      (Month{" "}
                      {savingsGoalReachedMonth.month})
                    </span>
                  </li>
                )}

                {/* List bonuses as milestones */}
                {financialData.yearlyBonuses &&
                  financialData.yearlyBonuses.map(
                    (bonus, index) => {
                      // Find date for this bonus
                      const bonusProjectionDate =
                        projection.find((p) =>
                          p.date.includes(
                            `${getMonthName(
                              bonus.month
                            ).substring(0, 3)} ${
                              bonus.year
                            }`
                          )
                        )?.date;

                      if (!bonusProjectionDate)
                        return null;

                      return (
                        <li
                          key={`bonus-milestone-${index}`}
                          className="flex items-start"
                        >
                          <svg
                            className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>
                            <span className="font-medium">
                              {bonus.description}:
                            </span>{" "}
                            {bonusProjectionDate} -{" "}
                            {formatCurrency(
                              bonus.amount
                            )}
                          </span>
                        </li>
                      );
                    }
                  )}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* CPF Tab */}
      {activeTab === "cpf" && <CpfDashboard />}
    </div>
  );
};

export default Dashboard;