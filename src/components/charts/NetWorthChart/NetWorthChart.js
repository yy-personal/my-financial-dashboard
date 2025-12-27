import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  ComposedChart,
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
 * NetWorthChart Component
 * Displays a chart showing the growth of net worth over time, including cash savings and CPF balance
 *
 * @param {Object} props - Component props
 * @param {Array} props.chartData - Filtered projection data points for the chart
 * @param {Object} props.savingsGoalReachedMonth - Month when 100K savings goal is reached (or null)
 * @returns {JSX.Element}
 */
const NetWorthChart = ({ chartData, savingsGoalReachedMonth }) => {
  return (
    <Card title="Net Worth Growth" titleColor="bg-blue-600">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
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
              yAxisId="left"
              tickFormatter={(value) => formatCurrency(value)}
              width={70}
              label={{
                value: "Savings",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cashSavings"
              name="Cash Savings"
              stroke="#2FD87B"
              fill="#2FD87B"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cpfBalance"
              name="CPF Balance (Locked)"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              activeDot={{ r: 6 }}
            />
            {savingsGoalReachedMonth && (
              <ReferenceLine
                yAxisId="left"
                x={savingsGoalReachedMonth.date}
                stroke="blue"
                strokeDasharray="3 3"
                label={{
                  value: "$100K Savings",
                  position: "top",
                  fill: "blue",
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">
            Savings Growth
          </h3>
          <p className="text-sm">
            {savingsGoalReachedMonth
              ? `You'll reach $100K in cash savings by ${savingsGoalReachedMonth.date}`
              : `Your cash savings will grow over the projection period`}
          </p>
        </div>
      </div>
    </Card>
  );
};

NetWorthChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
  savingsGoalReachedMonth: PropTypes.object
};

export default memo(NetWorthChart);