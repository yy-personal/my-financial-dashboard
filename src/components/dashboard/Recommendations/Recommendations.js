import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * RecommendationItem Component
 * Displays a single recommendation with an icon
 */
const RecommendationItem = ({ children }) => (
  <li className="flex items-start">
    <svg
      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{children}</span>
  </li>
);

RecommendationItem.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Recommendations Component
 * Displays financial recommendations based on projection data
 * 
 * @param {Object} props - Component props
 * @param {Object} props.loanPaidOffMonth - Month when loan is paid off (or null)
 * @param {number} props.monthlyRepayment - Monthly loan repayment amount
 * @returns {JSX.Element}
 */
const Recommendations = ({ loanPaidOffMonth, monthlyRepayment }) => {
  return (
    <Card title="Financial Recommendations">
      <ul className="space-y-3 text-gray-700">
        <RecommendationItem>
          Continue with your current loan repayment plan of{" "}
          <strong>{formatCurrency(monthlyRepayment)}</strong>
          /month to achieve debt freedom by{" "}
          <strong>
            {loanPaidOffMonth
              ? loanPaidOffMonth.date
              : "the projected date"}
          </strong>
        </RecommendationItem>
        
        <RecommendationItem>
          After your salary adjustments, consider
          increasing your loan payment to accelerate
          debt repayment
        </RecommendationItem>
        
        <RecommendationItem>
          Once your loan is paid off, redirect that{" "}
          <strong>{formatCurrency(monthlyRepayment)}</strong>{" "}
          to boost your savings rate further
        </RecommendationItem>
        
        <RecommendationItem>
          Maintain your current expense level even
          after salary increases to accelerate savings
        </RecommendationItem>
        
        <RecommendationItem>
          Consider diversifying your savings into
          investments once you pass $50,000 in cash
          savings
        </RecommendationItem>
      </ul>
    </Card>
  );
};

Recommendations.propTypes = {
  loanPaidOffMonth: PropTypes.object,
  monthlyRepayment: PropTypes.number.isRequired
};

export default Recommendations;