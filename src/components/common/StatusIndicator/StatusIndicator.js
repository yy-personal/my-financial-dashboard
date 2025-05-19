import React from "react";
import PropTypes from "prop-types";

/**
 * StatusIndicator Component
 * A visual indicator that changes color based on value thresholds
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Value to evaluate against thresholds
 * @param {number} props.threshold1 - First threshold for color change
 * @param {number} props.threshold2 - Second threshold for color change
 * @param {boolean} [props.reverse=false] - Reverse the threshold logic (for values where lower is better)
 * @param {string} [props.className] - Additional CSS classes to apply
 * @returns {JSX.Element}
 */
const StatusIndicator = ({
  value,
  threshold1,
  threshold2,
  reverse = false,
  className = ""
}) => {
  let color = "bg-green-500";

  // Determine color based on thresholds
  if (reverse) {
    // For metrics where higher values are worse (e.g., debt)
    if (value > threshold1) color = "bg-yellow-500";
    if (value > threshold2) color = "bg-red-500";
  } else {
    // For metrics where lower values are worse (e.g., savings)
    if (value < threshold1) color = "bg-yellow-500";
    if (value < threshold2) color = "bg-red-500";
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
    </div>
  );
};

StatusIndicator.propTypes = {
  value: PropTypes.number.isRequired,
  threshold1: PropTypes.number.isRequired,
  threshold2: PropTypes.number.isRequired,
  reverse: PropTypes.bool,
  className: PropTypes.string
};

export default StatusIndicator;