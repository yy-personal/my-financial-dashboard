import React from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * ExpenseBreakdown Component
 * Displays a breakdown of monthly expenses with a table and pie chart visualization
 *
 * @param {Object} props - Component props
 * @param {Array} props.expenseData - Array of expense objects with name and value
 * @param {number} props.totalExpenses - Sum of all expenses
 * @returns {JSX.Element}
 */
const ExpenseBreakdown = ({ expenseData, totalExpenses }) => {
  // Colors for pie chart
  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
    "#82ca9d", "#ffc658", "#ff7300", "#ff0000", "#B10DC9",
    "#FF851B", "#85144b", "#3D9970", "#2ECC40", "#01FF70"
  ];

  return (
    <Card title="Monthly Expense Breakdown">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenseData.map((expense, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {expense.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">
                    {formatCurrency(expense.value)}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm font-medium text-blue-700">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-medium text-blue-700 text-right">
                  {formatCurrency(totalExpenses)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expense Pie Chart */}
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

ExpenseBreakdown.propTypes = {
  expenseData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  totalExpenses: PropTypes.number.isRequired
};

export default ExpenseBreakdown;