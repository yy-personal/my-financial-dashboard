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
import { formatCurrency } from "../../../services/formatters/currencyFormatters";
import useUIPreferences from "../../../hooks/useUIPreferences";

/**
 * CpfGrowthChart Component
 * Displays a chart showing the growth of CPF savings over time
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chartData - Filtered projection data points for the chart
 * @param {Object} props.cpfMilestone - Month when CPF milestone is reached (optional)
 * @returns {JSX.Element}
 */
const CpfGrowthChart = ({ chartData, cpfMilestone }) => {
  const { getChartColorPalette } = useUIPreferences();
  const colors = getChartColorPalette();
  
  // Use the secondary color from the palette for CPF
  const cpfColor = colors[1]; // Using the secondary color from the palette
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-green-600 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">Projected CPF Growth</h2>
      </div>
      <div className="p-4">
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
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                width={70}
                tick={{ fill: '#374151' }}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb'
                }}
                labelStyle={{
                  color: '#374151'
                }}
              />
              <Legend
                wrapperStyle={{
                  color: '#374151'
                }}
              />
              <Area
                type="monotone"
                dataKey="cpfBalance"
                name="CPF Balance"
                stroke={cpfColor}
                fill={cpfColor}
                fillOpacity={0.3}
                activeDot={{ r: 6 }}
              />
              {cpfMilestone && (
                <ReferenceLine
                  x={cpfMilestone.date}
                  stroke="green"
                  strokeDasharray="3 3"
                  label={{
                    value: `CPF ${formatCurrency(cpfMilestone.amount)}`,
                    position: "top",
                    fill: 'green',
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 bg-green-50 p-3 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">
            CPF Growth
          </h3>
          <p className="text-sm text-green-600">
            {cpfMilestone
              ? `Your CPF savings are projected to reach ${formatCurrency(cpfMilestone.amount)} by ${cpfMilestone.date}`
              : `Your CPF savings will continue to grow with regular contributions and interest`}
          </p>
        </div>
      </div>
    </div>
  );
};

CpfGrowthChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
  cpfMilestone: PropTypes.object
};

export default CpfGrowthChart;