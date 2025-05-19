import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency, formatPercent } from "../../../services/formatters/currencyFormatters";

/**
 * MonthlyCashFlow Component
 * Displays monthly income, expenses, savings, and cash flow progress bar
 * 
 * @param {Object} props - Component props
 * @param {number} props.takeHomePay - Monthly take-home pay after CPF
 * @param {number} props.monthlyExpenses - Total monthly expenses
 * @param {number} props.loanPayment - Monthly loan payment amount
 * @param {number} props.monthlySavings - Monthly savings amount
 * @param {number} props.savingsRate - Savings as a percentage of take-home pay
 * @returns {JSX.Element}
 */
const MonthlyCashFlow = ({
  takeHomePay,
  monthlyExpenses,
  loanPayment,
  monthlySavings,
  savingsRate
}) => {
  return (
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
            {formatPercent(savingsRate)} of take-home pay
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
                  (monthlyExpenses / takeHomePay) *
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
  );
};

MonthlyCashFlow.propTypes = {
  takeHomePay: PropTypes.number.isRequired,
  monthlyExpenses: PropTypes.number.isRequired,
  loanPayment: PropTypes.number.isRequired,
  monthlySavings: PropTypes.number.isRequired,
  savingsRate: PropTypes.number.isRequired
};

export default MonthlyCashFlow;