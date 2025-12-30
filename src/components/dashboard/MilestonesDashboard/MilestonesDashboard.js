import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";
import { formatDate } from "../../../services/formatters/dateFormatters";
import MilestoneTimeline from "../MilestoneTimeline";

/**
 * MilestonesDashboard Component
 * Comprehensive view of financial milestones, goals, and progress
 *
 * @param {Object} props - Component props
 * @param {Array} props.milestones - Array of milestone objects
 * @param {Object} props.savingsGoalReachedMonth - Month when savings goal is reached (or null)
 * @param {number} props.timeToSavingsGoal - Months remaining to reach savings goal
 * @param {number} props.currentLiquidCash - Current liquid cash amount
 * @param {number} props.savingsGoal - Target savings goal amount
 * @param {number} props.retirementAge - Target retirement age
 * @param {number} props.currentAge - Current age
 * @param {number} props.retirementSavingsGoal - Target retirement savings amount
 * @param {number} props.currentRetirementSavings - Current retirement savings
 * @returns {JSX.Element}
 */
const MilestonesDashboard = ({
  milestones = [],
  savingsGoalReachedMonth,
  timeToSavingsGoal,
  currentLiquidCash,
  savingsGoal = 100000,
  retirementAge = 65,
  currentAge,
  retirementSavingsGoal = 1000000,
  currentRetirementSavings
}) => {
  // Calculate savings goal progress
  const savingsGoalProgress = Math.min(
    Math.round((currentLiquidCash / savingsGoal) * 100),
    100
  );

  // Calculate retirement progress
  const retirementProgress = Math.min(
    Math.round((currentRetirementSavings / retirementSavingsGoal) * 100),
    100
  );

  // Calculate years to retirement
  const yearsToRetirement = retirementAge - currentAge;

  // Combine automatic and custom milestones
  const autoMilestones = [
    {
      id: "savings-goal",
      title: `Savings Goal: ${formatCurrency(savingsGoal)}`,
      description: "Reach your liquid cash savings goal",
      date: savingsGoalReachedMonth ? savingsGoalReachedMonth.date : null,
      timeRemaining: timeToSavingsGoal,
      complete: timeToSavingsGoal <= 0,
      progress: savingsGoalProgress,
      type: "savings",
      amount: savingsGoal,
      current: currentLiquidCash
    },
    {
      id: "retirement",
      title: "Retirement",
      description: `Target age: ${retirementAge}`,
      date: null, // Will be calculated based on current date + years to retirement
      timeRemaining: yearsToRetirement * 12, // Convert to months
      complete: yearsToRetirement <= 0,
      progress: retirementProgress,
      type: "retirement",
      amount: retirementSavingsGoal,
      current: currentRetirementSavings
    }
  ];

  // Combine auto-generated and custom milestones
  const allMilestones = [...autoMilestones, ...milestones]
    .filter(milestone => milestone && typeof milestone === 'object')
    .sort((a, b) => {
      // Sort by completion status, then by time remaining
      if (a.complete !== b.complete) {
        return a.complete ? 1 : -1;
      }
      return (a.timeRemaining || Infinity) - (b.timeRemaining || Infinity);
    });

  return (
    <div className="space-y-6">
      <Card title="Financial Milestones" titleColor="bg-indigo-600">
        <div className="mb-4">
          <p className="text-gray-600">
            Track your progress toward important financial goals and milestones.
          </p>
        </div>

        {/* Timeline visualization */}
        <div className="mb-6">
          <MilestoneTimeline milestones={allMilestones} />
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          {allMilestones.map(milestone => (
            <div 
              key={milestone.id} 
              className={`border rounded-lg p-4 transition-all ${
                milestone.complete 
                  ? "border-green-200 bg-green-50" 
                  : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
                {milestone.complete ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {milestone.timeRemaining
                      ? `${Math.ceil(milestone.timeRemaining / 12)} years, ${milestone.timeRemaining % 12} months`
                      : "In progress"}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {!milestone.complete && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${milestone.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      {milestone.progress || 0}% complete
                    </span>
                    {milestone.date && (
                      <span className="text-xs text-gray-500">
                        Est. completion: {milestone.date}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Show financial amounts for applicable milestones */}
              {(milestone.type === 'savings' || milestone.type === 'retirement') && milestone.current !== undefined && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Current: {formatCurrency(milestone.current)}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-gray-600">Target: {formatCurrency(milestone.amount)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new milestone button */}
        <div className="mt-6">
          <button
            className="w-full py-2 px-4 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-md text-indigo-600 font-medium transition-colors"
          >
            + Add Custom Milestone
          </button>
        </div>
      </Card>
    </div>
  );
};

MilestonesDashboard.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string,
      timeRemaining: PropTypes.number,
      complete: PropTypes.bool,
      progress: PropTypes.number,
      type: PropTypes.string,
      amount: PropTypes.number,
      current: PropTypes.number
    })
  ),
  savingsGoalReachedMonth: PropTypes.object,
  timeToSavingsGoal: PropTypes.number,
  currentLiquidCash: PropTypes.number,
  savingsGoal: PropTypes.number,
  retirementAge: PropTypes.number,
  currentAge: PropTypes.number,
  retirementSavingsGoal: PropTypes.number,
  currentRetirementSavings: PropTypes.number
};

export default MilestonesDashboard;