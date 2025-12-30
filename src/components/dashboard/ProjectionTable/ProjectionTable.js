import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * ProjectionTable Component
 * Displays a detailed table of financial projections
 *
 * @param {Object} props - Component props
 * @param {Array} props.projectionData - Array of projection data points
 * @param {string} props.timeframe - Selected timeframe
 * @returns {JSX.Element}
 */
const ProjectionTable = ({ projectionData = [], timeframe }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [displayFrequency, setDisplayFrequency] = useState("quarterly"); // "monthly", "quarterly", "yearly"

  // Filter data based on display frequency
  const getFilteredTableData = () => {
    if (displayFrequency === "monthly") {
      return projectionData;
    }

    if (displayFrequency === "yearly") {
      return projectionData.filter((_, index) => index % 12 === 0);
    }

    // Quarterly - every 3 months
    return projectionData.filter((_, index) => index % 3 === 0);
  };

  const tableData = getFilteredTableData();

  // Calculate key metrics to highlight important changes
  const calculateRowMetrics = (dataPoint, index, data) => {
    if (index === 0) {
      return {
        isFirstMonth: true,
        isSavingsGoalReached: dataPoint.cashSavings >= 100000, // Assuming $100K goal
        isNetWorthMilestone: false,
        hasLargeIncome: false,
      };
    }

    const prevDataPoint = data[index - 1];
    const netWorthChange = dataPoint.totalNetWorth - prevDataPoint.totalNetWorth;
    const netWorthChangePercentage = (netWorthChange / prevDataPoint.totalNetWorth) * 100;

    return {
      isFirstMonth: false,
      isSavingsGoalReached: prevDataPoint.cashSavings < 100000 && dataPoint.cashSavings >= 100000,
      isNetWorthMilestone:
        (prevDataPoint.totalNetWorth < 250000 && dataPoint.totalNetWorth >= 250000) ||
        (prevDataPoint.totalNetWorth < 500000 && dataPoint.totalNetWorth >= 500000) ||
        (prevDataPoint.totalNetWorth < 1000000 && dataPoint.totalNetWorth >= 1000000),
      hasLargeIncome: dataPoint.monthlyIncome > prevDataPoint.monthlyIncome * 1.5, // Bonus months
      netWorthChangePercentage
    };
  };

  return (
    <Card title="Detailed Projection" titleColor="bg-gray-700">
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">
            {timeframe === "1year" ? "12 Month" : 
             timeframe === "5years" ? "5 Year" : 
             timeframe === "10years" ? "10 Year" : "Retirement"} Projection
          </h3>
          <p className="text-sm text-gray-600">
            Showing {displayFrequency} data points
          </p>
        </div>

        {/* Display frequency selector */}
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setDisplayFrequency("monthly")}
            className={`px-3 py-1.5 text-xs font-medium rounded-l-lg ${
              displayFrequency === "monthly"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setDisplayFrequency("quarterly")}
            className={`px-3 py-1.5 text-xs font-medium ${
              displayFrequency === "quarterly"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border-t border-b border-gray-300`}
          >
            Quarterly
          </button>
          <button
            type="button"
            onClick={() => setDisplayFrequency("yearly")}
            className={`px-3 py-1.5 text-xs font-medium rounded-r-lg ${
              displayFrequency === "yearly"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Income
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expenses
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Savings
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Worth
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((dataPoint, index) => {
              const metrics = calculateRowMetrics(dataPoint, index, tableData);
              const isHighlightRow =
                metrics.isSavingsGoalReached ||
                metrics.isNetWorthMilestone ||
                metrics.hasLargeIncome;

              return (
                <tr
                  key={dataPoint.date}
                  className={`${
                    isHighlightRow ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                  } cursor-pointer transition-colors`}
                  onClick={() => setSelectedDataPoint(dataPoint)}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    <div className="font-medium">{dataPoint.date}</div>
                    {metrics.hasLargeIncome && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Bonus
                      </span>
                    )}
                    {metrics.isSavingsGoalReached && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        $100K Saved
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(dataPoint.monthlyIncome || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(dataPoint.monthlyExpenses || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(dataPoint.monthlySavings || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(dataPoint.cashSavings || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(dataPoint.cpfBalance || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    {formatCurrency(dataPoint.totalNetWorth || 0)}
                    {index > 0 && !metrics.isFirstMonth && (
                      <div 
                        className={`text-xs ${
                          (metrics.netWorthChangePercentage || 0) >= 0 
                            ? "text-green-600" 
                            : "text-red-600"
                        }`}
                      >
                        {(metrics.netWorthChangePercentage || 0) >= 0 ? "+" : ""}
                        {(metrics.netWorthChangePercentage || 0).toFixed(1)}%
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected data point details */}
      {selectedDataPoint && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              Details for {selectedDataPoint.date}
            </h3>
            <button
              onClick={() => setSelectedDataPoint(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Income</h4>
              <div className="text-gray-800">
                <div className="flex justify-between">
                  <span>Monthly Income:</span>
                  <span>{formatCurrency(selectedDataPoint.monthlyIncome || 0)}</span>
                </div>
                {selectedDataPoint.bonusAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus Amount:</span>
                    <span>{formatCurrency(selectedDataPoint.bonusAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Take-Home Pay:</span>
                  <span>{formatCurrency(selectedDataPoint.takeHomePay || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPF Contribution:</span>
                  <span>{formatCurrency(selectedDataPoint.totalCpfContribution || 0)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Expenses</h4>
              <div className="text-gray-800">
                <div className="flex justify-between">
                  <span>Monthly Expenses:</span>
                  <span>{formatCurrency(selectedDataPoint.monthlyExpenses || 0)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium mt-1">
                  <span>Monthly Savings:</span>
                  <span>{formatCurrency(selectedDataPoint.monthlySavings || 0)}</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Assets & Liabilities</h4>
              <div className="text-gray-800">
                <div className="flex justify-between">
                  <span>Cash Savings:</span>
                  <span>{formatCurrency(selectedDataPoint.cashSavings || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPF Balance:</span>
                  <span>{formatCurrency(selectedDataPoint.cpfBalance || 0)}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-700 mt-1">
                  <span>Total Net Worth:</span>
                  <span>{formatCurrency(selectedDataPoint.totalNetWorth || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

ProjectionTable.propTypes = {
  projectionData: PropTypes.arrayOf(PropTypes.object).isRequired,
  timeframe: PropTypes.string.isRequired
};

export default memo(ProjectionTable);