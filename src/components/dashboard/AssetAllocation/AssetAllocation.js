import React from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Card from "../../common/Card";
import { formatCurrency, formatPercent } from "../../../services/formatters/currencyFormatters";

/**
 * AssetAllocation Component
 * Displays breakdown of assets between liquid cash and CPF balance
 * 
 * @param {Object} props - Component props
 * @param {Array} props.assetAllocationData - Data for asset allocation pie chart
 * @param {number} props.liquidCash - Current liquid cash amount
 * @param {number} props.cpfSavings - Current CPF savings amount
 * @param {number} props.totalAssets - Total assets amount
 * @param {number} props.liquidCashPercentage - Percentage of assets in liquid cash
 * @param {number} props.cpfPercentage - Percentage of assets in CPF
 * @returns {JSX.Element}
 */
const AssetAllocation = ({
  assetAllocationData,
  liquidCash,
  cpfSavings,
  totalAssets,
  liquidCashPercentage,
  cpfPercentage
}) => {
  return (
    <Card title="Asset Allocation" titleColor="bg-purple-600">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800 mb-3">
            Asset Distribution
          </h3>

          <div className="flex justify-between">
            <span className="text-green-700 font-medium">
              Liquid Cash:
            </span>
            <span className="font-medium">
              {formatCurrency(liquidCash)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{
                width: `${liquidCashPercentage}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between">
            <span className="text-purple-700 font-medium">
              CPF (Locked):
            </span>
            <span className="font-medium">
              {formatCurrency(cpfSavings)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-purple-500 h-2.5 rounded-full"
              style={{ width: `${cpfPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between border-t pt-2">
            <span className="text-blue-700 font-medium">
              Total Assets:
            </span>
            <span className="text-blue-700 font-medium">
              {formatCurrency(totalAssets)}
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg mt-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">
                Liquidity Ratio:{" "}
              </span>
              {formatPercent(
                liquidCash / totalAssets
              )}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {liquidCashPercentage > 30
                ? "Good liquidity balance. Consider investing some liquid cash for better returns."
                : liquidCashPercentage > 15
                ? "Healthy liquidity ratio."
                : "Low liquidity. Consider building more accessible cash reserves."}
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetAllocationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name}: ${(
                    percent * 100
                  ).toFixed(0)}%`
                }
              >
                <Cell fill="#4ade80" /> {/* Green for liquid cash */}
                <Cell fill="#a855f7" /> {/* Purple for CPF */}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  formatCurrency(value)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

AssetAllocation.propTypes = {
  assetAllocationData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  liquidCash: PropTypes.number.isRequired,
  cpfSavings: PropTypes.number.isRequired,
  totalAssets: PropTypes.number.isRequired,
  liquidCashPercentage: PropTypes.number.isRequired,
  cpfPercentage: PropTypes.number.isRequired
};

export default AssetAllocation;