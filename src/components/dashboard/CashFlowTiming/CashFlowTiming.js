import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../common/Card';
import { formatCurrency } from '../../../services/formatters/currencyFormatters';

/**
 * CashFlowTiming component displays intra-month cash flow analysis
 * Shows when salary is received vs when expenses are due
 * 
 * @param {Object} props - Component props
 * @param {Object} props.cashFlowAnalysis - Analysis from useIntraMonthCashFlow
 * @param {Array} props.liquidityWarnings - Array of liquidity warnings
 * @returns {JSX.Element}
 */
const CashFlowTiming = ({ cashFlowAnalysis, liquidityWarnings = [] }) => {
  // Show loading state if analysis is not ready yet
  if (!cashFlowAnalysis) {
    return (
      <Card title="Cash Flow Timing">
        <div className="text-center py-4">
          <p className="text-gray-500">Loading cash flow analysis...</p>
        </div>
      </Card>
    );
  }

  // If no intra-month analysis available, show a helpful message
  if (!cashFlowAnalysis.intraMonthAnalysis) {
    return (
      <Card title="Cash Flow Timing">
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2">Detailed cash flow timing analysis not available</p>
          <p className="text-sm text-gray-400">Check your projection settings or financial data configuration</p>
        </div>
      </Card>
    );
  }

  const { dailyEvents, minBalance, minBalanceDay, metrics } = cashFlowAnalysis.intraMonthAnalysis;

  // Get salary and major expense events
  const salaryEvent = dailyEvents.find(event => event.type === 'income');
  const rentEvent = dailyEvents.find(event => event.description.toLowerCase().includes('rent'));
  
  return (
    <Card title="Cash Flow Timing Analysis">
      <div className="space-y-4">
        {/* Timing Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Your Cash Flow Pattern</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Salary Received:</span>
              <p className="font-medium">Day {salaryEvent?.day || 'N/A'} of each month</p>
            </div>
            <div>
              <span className="text-blue-700">Rent Due:</span>
              <p className="font-medium">Day {rentEvent?.day || 'N/A'} of each month</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`border rounded-lg p-4 ${
          liquidityWarnings.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center mb-2">
            {liquidityWarnings.length > 0 ? (
              <>
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="font-semibold text-red-800">Cash Flow Risk Detected</h4>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="font-semibold text-green-800">Cash Flow Looks Healthy</h4>
              </>
            )}
          </div>
          
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Lowest balance:</span> {formatCurrency(minBalance)} on day {minBalanceDay}
            </p>
            <p>
              <span className="font-medium">Recommended buffer:</span> {formatCurrency(metrics.recommendedBuffer)}
            </p>
          </div>
        </div>

        {/* Monthly Timeline */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Monthly Cash Flow Timeline</h4>
          <div className="space-y-2">
            {dailyEvents.slice(0, 8).map((event, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {event.day}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{event.description}</p>
                    <p className="text-xs text-gray-500 capitalize">{event.type}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  event.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {event.amount > 0 ? '+' : ''}{formatCurrency(event.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {cashFlowAnalysis.recommendations && cashFlowAnalysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
            <div className="space-y-3">
              {cashFlowAnalysis.recommendations.map((rec, index) => (
                <div key={index} className={`border rounded-lg p-3 ${
                  rec.type === 'critical' ? 'bg-red-50 border-red-200' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <h5 className={`font-medium mb-1 ${
                    rec.type === 'critical' ? 'text-red-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {rec.title}
                  </h5>
                  <p className={`text-sm mb-2 ${
                    rec.type === 'critical' ? 'text-red-700' :
                    rec.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {rec.description}
                  </p>
                  {rec.actionItems && (
                    <ul className={`text-xs space-y-1 ${
                      rec.type === 'critical' ? 'text-red-600' :
                      rec.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

CashFlowTiming.propTypes = {
  cashFlowAnalysis: PropTypes.object,
  liquidityWarnings: PropTypes.array
};

export default CashFlowTiming;