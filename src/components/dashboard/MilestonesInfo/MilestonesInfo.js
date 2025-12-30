import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import InfoItem from "../../common/InfoItem";

/**
 * MilestonesInfo component to display financial milestone information
 *
 * @param {Object} props - Component props
 * @param {string} props.timeToSavingsGoal - Time to reach savings goal
 * @param {Object|null} props.savingsGoalReachedMonth - Month when savings goal is reached or null
 * @returns {JSX.Element}
 */
const MilestonesInfo = ({
  timeToSavingsGoal,
  savingsGoalReachedMonth
}) => {
  return (
    <Card title="Financial Milestones">
      <div className="space-y-1">
        <InfoItem
          label="Time to $100K Savings"
          value={timeToSavingsGoal}
        />
        <InfoItem
          label="Expected $100K Date"
          value={
            savingsGoalReachedMonth
              ? savingsGoalReachedMonth.date
              : "Not within projection"
          }
          highlighted={true}
        />
      </div>
    </Card>
  );
};

MilestonesInfo.propTypes = {
  timeToSavingsGoal: PropTypes.string.isRequired,
  savingsGoalReachedMonth: PropTypes.shape({
    date: PropTypes.string.isRequired,
    month: PropTypes.number.isRequired
  })
};

export default MilestonesInfo;
