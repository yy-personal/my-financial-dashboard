import React from "react";
import PropTypes from "prop-types";
import StatusIndicator from "../../common/StatusIndicator";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * FinancialSummary Component
 * Displays key financial metrics in a card-based layout at the top of the dashboard
 * 
 * @param {Object} props - Component props
 * @param {number} props.liquidCash - Current liquid cash amount
 * @param {number} props.cpfBalance - Current CPF balance amount
 * @param {number} props.remainingLoan - Remaining loan amount
 * @param {string} props.timeToPayLoan - Time remaining to pay off loan 
 * @param {number} props.netWorth - Total net worth amount
 * @returns {JSX.Element}
 */
const FinancialSummary = ({ 
  liquidCash, 
  cpfBalance, 
  remainingLoan, 
  timeToPayLoan, 
  netWorth 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Liquid Cash Card */}
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">
              Liquid Cash
            </p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(liquidCash)}
            </p>
            <p className="text-xs text-gray-500">
              Immediately available
            </p>
          </div>
          <StatusIndicator
            value={liquidCash}
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
              {formatCurrency(cpfBalance)}
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
              {formatCurrency(remainingLoan)}
            </p>
            <p className="text-xs text-gray-500">
              {timeToPayLoan !== "Not within projection"
                ? `Paid off in ${timeToPayLoan}`
                : "Long-term loan"}
            </p>
          </div>
          <StatusIndicator
            value={remainingLoan}
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
          {formatCurrency(netWorth)}
        </p>
        <p className="text-xs text-gray-500">
          Assets minus liabilities
        </p>
      </div>
    </div>
  );
};

FinancialSummary.propTypes = {
  liquidCash: PropTypes.number.isRequired,
  cpfBalance: PropTypes.number.isRequired,
  remainingLoan: PropTypes.number.isRequired,
  timeToPayLoan: PropTypes.string.isRequired,
  netWorth: PropTypes.number.isRequired,
};

export default FinancialSummary;