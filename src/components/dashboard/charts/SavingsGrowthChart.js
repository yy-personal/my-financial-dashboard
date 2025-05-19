import React from "react";
import PropTypes from "prop-types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * SavingsGrowthChart Component
 * Displays a chart showing the growth of savings over time
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chartData - Filtered projection data points for the chart
 * @param {Object} props.savingsGoalReachedMonth - Month when 100K savings goal is reached (or null)
 * @returns {JSX.Element}
 */
const SavingsGrowthChart = ({ chartData, savingsGoalReachedMonth }) => {
  return (
    <Card title="Savings Growth Projection" titleColor="bg-green-600">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              width={70}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="cashSavings"
              name="Cash Savings"
              stroke="#2FD87B"
              fill="#2FD87B"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="cpfBalance"
              name="CPF Balance"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="totalNetWorth"
              name="Total Net Worth"
              stroke="#0088FE"
              fill="#0088FE"
              fillOpacity={0.1}
              activeDot={{ r: 6 }}
            />
            {savingsGoalReachedMonth && (
              <ReferenceLine
                x={savingsGoalReachedMonth.date}
                stroke="green"
                strokeDasharray="3 3"
                label={{
                  value: "$100K Savings Goal",
                  position: "top",
                  fill: "green",
                }}
              />
            )}
            <ReferenceLine
              y={100000}
              stroke="blue"
              strokeDasharray="3 3"
              label={{
                value: "$100K",
                position: "right",
                fill: "blue",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2">
          Savings Milestone
        </h3>
        <p className="text-sm">
          {savingsGoalReachedMonth
            ? `You'll reach $100K in cash savings by ${savingsGoalReachedMonth.date}`
            : `Keep working towards your $100K cash savings goal`}
        </p>
      </div>
    </Card>
  );
};

SavingsGrowthChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
  savingsGoalReachedMonth: PropTypes.object
};

export default SavingsGrowthChart;