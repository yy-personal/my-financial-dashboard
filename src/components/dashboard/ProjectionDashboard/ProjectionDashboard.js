import React, { useState } from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";
import ProjectionTable from "../ProjectionTable";
import ProjectionSettings from "../ProjectionSettings";
import { SavingsGrowthChart, NetWorthChart } from "../charts";

/**
 * ProjectionDashboard Component
 * Displays financial projections and allows adjusting projection parameters
 *
 * @param {Object} props - Component props
 * @param {Array} props.projectionData - Array of projection data points
 * @param {Object} props.loanPaidOffMonth - Month when loan is paid off (or null)
 * @param {Object} props.savingsGoalReachedMonth - Month when savings goal is reached (or null)
 * @param {Object} props.currentValues - Current financial values
 * @param {Object} props.projectionSettings - Current projection settings
 * @param {string} props.savingsTimeframe - Current savings timeframe ('before' or 'after')
 * @param {Function} props.onUpdateSettings - Function to update projection settings
 * @param {Function} props.onSavingsTimeframeUpdate - Function to update savings timeframe
 * @returns {JSX.Element}
 */
const ProjectionDashboard = ({
  projectionData = [],
  loanPaidOffMonth,
  savingsGoalReachedMonth,
  currentValues,
  projectionSettings,
  savingsTimeframe,
  onUpdateSettings,
  onSavingsTimeframeUpdate
}) => {
  const [timeframe, setTimeframe] = useState("5years"); // 1year, 5years, 10years, retirement
  const [displaySettings, setDisplaySettings] = useState(false);

  // Filter projection data based on selected timeframe
  const getFilteredData = () => {
    let monthsToShow = 60; // Default to 5 years

    switch (timeframe) {
      case "1year":
        monthsToShow = 12;
        break;
      case "5years":
        monthsToShow = 60;
        break;
      case "10years":
        monthsToShow = 120;
        break;
      case "retirement":
        // Show all data for retirement timeframe
        return projectionData;
      default:
        monthsToShow = 60;
    }

    return projectionData.slice(0, monthsToShow + 1);
  };

  // Get key metrics from projection data
  const getProjectionMetrics = () => {
    const filteredData = getFilteredData();
    const lastDataPoint = filteredData[filteredData.length - 1] || {};
    const firstDataPoint = filteredData[0] || {};

    return {
      startingNetWorth: firstDataPoint.totalNetWorth || 0,
      endingNetWorth: lastDataPoint.totalNetWorth || 0,
      startingCashSavings: firstDataPoint.cashSavings || 0,
      endingCashSavings: lastDataPoint.cashSavings || 0,
      startingCpfBalance: firstDataPoint.cpfBalance || 0,
      endingCpfBalance: lastDataPoint.cpfBalance || 0,
      startingLoanRemaining: firstDataPoint.loanRemaining || 0,
      endingLoanRemaining: lastDataPoint.loanRemaining || 0,
      netWorthGrowth: lastDataPoint.totalNetWorth - firstDataPoint.totalNetWorth || 0,
      netWorthGrowthPercentage: 
        firstDataPoint.totalNetWorth
          ? ((lastDataPoint.totalNetWorth - firstDataPoint.totalNetWorth) / firstDataPoint.totalNetWorth) * 100
          : 0
    };
  };

  const metrics = getProjectionMetrics();
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Projection Controls */}
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Financial Projection</h2>
            <p className="text-sm text-gray-600">
              View your projected financial growth and experiment with different scenarios
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Timeframe selector */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setTimeframe("1year")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  timeframe === "1year"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
              >
                1 Year
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("5years")}
                className={`px-4 py-2 text-sm font-medium ${
                  timeframe === "5years"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border-t border-b border-gray-300`}
              >
                5 Years
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("10years")}
                className={`px-4 py-2 text-sm font-medium ${
                  timeframe === "10years"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border-t border-b border-gray-300`}
              >
                10 Years
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("retirement")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  timeframe === "retirement"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
              >
                To Retirement
              </button>
            </div>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setDisplaySettings(!displaySettings)}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {displaySettings && (
          <div className="mt-4 border-t pt-4">
            <ProjectionSettings
              currentSettings={projectionSettings}
              currentValues={currentValues}
              savingsTimeframe={savingsTimeframe}
              onUpdate={onUpdateSettings}
              onSavingsTimeframeUpdate={onSavingsTimeframeUpdate}
            />
          </div>
        )}
      </Card>

      {/* Projection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex flex-col">
            <div className="text-sm text-blue-700">Net Worth</div>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(metrics.endingNetWorth)}
            </div>
            <div className={`mt-1 text-sm ${metrics.netWorthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.netWorthGrowth >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(metrics.netWorthGrowth))} 
              ({Math.round(Math.abs(metrics.netWorthGrowthPercentage))}%)
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <div className="flex flex-col">
            <div className="text-sm text-green-700">Cash Savings</div>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(metrics.endingCashSavings)}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              From {formatCurrency(metrics.startingCashSavings)}
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border border-purple-100">
          <div className="flex flex-col">
            <div className="text-sm text-purple-700">CPF Balance</div>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(metrics.endingCpfBalance)}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              From {formatCurrency(metrics.startingCpfBalance)}
            </div>
          </div>
        </Card>

        <Card className="bg-orange-50 border border-orange-100">
          <div className="flex flex-col">
            <div className="text-sm text-orange-700">Loan Remaining</div>
            <div className="text-2xl font-bold text-orange-800">
              {formatCurrency(metrics.endingLoanRemaining)}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              From {formatCurrency(metrics.startingLoanRemaining)}
            </div>
          </div>
        </Card>
      </div>

      {/* Projection Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetWorthChart 
          chartData={filteredData} 
          loanPaidOffMonth={loanPaidOffMonth}
          savingsGoalReachedMonth={savingsGoalReachedMonth}
        />
        
        <SavingsGrowthChart 
          chartData={filteredData}
          savingsGoalReachedMonth={savingsGoalReachedMonth}
        />
      </div>

      {/* Projection Table */}
      <ProjectionTable 
        projectionData={filteredData}
        timeframe={timeframe} 
      />
    </div>
  );
};

ProjectionDashboard.propTypes = {
  projectionData: PropTypes.arrayOf(PropTypes.object).isRequired,
  loanPaidOffMonth: PropTypes.object,
  savingsGoalReachedMonth: PropTypes.object,
  currentValues: PropTypes.shape({
    salary: PropTypes.number,
    monthlySavings: PropTypes.number,
    monthlyExpenses: PropTypes.number,
    loanPayment: PropTypes.number,
    liquidCash: PropTypes.number,
    cpfBalance: PropTypes.number,
    loanRemaining: PropTypes.number
  }).isRequired,
  projectionSettings: PropTypes.shape({
    annualSalaryIncrease: PropTypes.number,
    annualExpenseIncrease: PropTypes.number,
    annualInvestmentReturn: PropTypes.number,
    annualCpfInterestRate: PropTypes.number,
    projectionYears: PropTypes.number,
    bonusMonths: PropTypes.number,
    bonusAmount: PropTypes.number
  }).isRequired,
  savingsTimeframe: PropTypes.oneOf(['before', 'after']),
  onUpdateSettings: PropTypes.func.isRequired,
  onSavingsTimeframeUpdate: PropTypes.func
};

export default ProjectionDashboard;