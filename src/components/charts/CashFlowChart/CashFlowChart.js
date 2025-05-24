import React from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * CashFlowChart Component
 * Displays a chart showing the monthly cash flow breakdown
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chartData - Filtered projection data points for the chart
 * @returns {JSX.Element}
 */
const CashFlowChart = ({ chartData }) => {
  // Use only the first 6 months of data for the bar chart
  const limitedData = chartData.slice(0, 6);
  
  return (
    <Card title="Monthly Cash Flow" titleColor="bg-blue-600">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={limitedData}
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
            <Bar
              dataKey="takeHomePay"
              name="Take-Home Pay"
              fill="#8884d8"
            />
            <Bar
              dataKey="expenses"
              name="Living Expenses"
              fill="#ff7300"
            />
            <Bar
              dataKey="loanPayment"
              name="Loan Payment"
              fill="#ff0000"
            />
            <Bar
              dataKey="monthlySavings"
              name="Cash Savings"
              fill="#82ca9d"
            />
            <Bar
              dataKey="totalCpfContribution"
              name="CPF Contributions"
              fill="#9370DB"
            />
            <Bar
              dataKey="bonusAmount"
              name="Bonuses"
              fill="#2ECC40"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">
          Cash Flow Breakdown
        </h3>
        <p className="text-sm">
          This chart shows your monthly cash flow for the next 6 months, including income, expenses, and savings.
        </p>
      </div>
    </Card>
  );
};

CashFlowChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default CashFlowChart;