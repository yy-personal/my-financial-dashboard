import React from "react";
import PropTypes from "prop-types";

/**
 * MilestoneTimeline Component
 * Displays a horizontal timeline of financial milestones
 *
 * @param {Object} props - Component props
 * @param {Array} props.milestones - Array of milestone objects
 * @returns {JSX.Element}
 */
const MilestoneTimeline = ({ milestones = [] }) => {
  // Filter out milestones with no date or timeRemaining
  const timelineMilestones = milestones.filter(
    (m) => m.date || (m.timeRemaining !== undefined && m.timeRemaining !== null)
  );

  // Sort milestones chronologically
  const sortedMilestones = [...timelineMilestones].sort((a, b) => {
    // If both have a date, compare dates
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    // If both have timeRemaining, compare timeRemaining
    if (
      a.timeRemaining !== undefined &&
      a.timeRemaining !== null &&
      b.timeRemaining !== undefined &&
      b.timeRemaining !== null
    ) {
      return a.timeRemaining - b.timeRemaining;
    }
    // If one has a date and the other timeRemaining, date comes first
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  // If no valid milestones, display a placeholder
  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No timeline milestones available</p>
      </div>
    );
  }

  // Colors for different milestone types
  const typeColors = {
    loan: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: "bg-orange-500"
    },
    savings: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: "bg-green-500"
    },
    retirement: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "bg-blue-500"
    },
    investment: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: "bg-purple-500"
    },
    custom: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: "bg-gray-500"
    }
  };

  return (
    <div className="relative pb-12">
      {/* Horizontal timeline line */}
      <div className="absolute left-0 right-0 h-0.5 bg-gray-200 top-8"></div>

      {/* Timeline milestones */}
      <div className="relative flex justify-between">
        {sortedMilestones.map((milestone, index) => {
          const type = milestone.type || "custom";
          const colors = typeColors[type] || typeColors.custom;
          const isCompleted = milestone.complete;

          return (
            <div
              key={milestone.id}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / sortedMilestones.length}%` }}
            >
              {/* Vertical line to milestone */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Milestone point */}
              <div
                className={`w-5 h-5 rounded-full shadow-sm z-10 ${
                  isCompleted ? "bg-green-500" : colors.icon
                }`}
              ></div>

              {/* Milestone details */}
              <div className="mt-3 transform -translate-x-1/2 absolute top-10 left-1/2 w-32">
                <div
                  className={`text-xs p-2 rounded border ${
                    isCompleted
                      ? "bg-green-50 border-green-200 text-green-800"
                      : `${colors.bg} ${colors.border} ${colors.text}`
                  }`}
                >
                  <div className="font-medium truncate" title={milestone.title}>
                    {milestone.title}
                  </div>
                  {milestone.date && (
                    <div className="truncate" title={milestone.date}>
                      {milestone.date}
                    </div>
                  )}
                  {!milestone.date && milestone.timeRemaining !== undefined && (
                    <div>
                      {Math.floor(milestone.timeRemaining / 12) > 0
                        ? `${Math.floor(milestone.timeRemaining / 12)}y ${
                            milestone.timeRemaining % 12
                          }m`
                        : `${milestone.timeRemaining}m`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline today marker */}
      <div className="absolute left-0 top-6 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-indigo-600 z-20 shadow"></div>
        <div className="bg-white text-xs font-medium mt-10 px-1.5 py-0.5 rounded border border-gray-200">
          Today
        </div>
      </div>
    </div>
  );
};

MilestoneTimeline.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string,
      timeRemaining: PropTypes.number,
      complete: PropTypes.bool,
      type: PropTypes.string
    })
  )
};

export default MilestoneTimeline;