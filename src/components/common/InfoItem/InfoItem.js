import React from "react";
import PropTypes from "prop-types";

/**
 * InfoItem Component
 * A reusable component for displaying key-value pairs with optional highlighting
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label text to display
 * @param {string|number|React.ReactNode} props.value - Value to display
 * @param {boolean} [props.highlighted=false] - Whether to highlight this item
 * @param {string} [props.className] - Additional CSS classes to apply
 * @returns {JSX.Element}
 */
const InfoItem = ({ 
  label, 
  value, 
  highlighted = false,
  className = ""
}) => (
  <div
    className={`py-2 flex justify-between items-center border-b ${
      highlighted ? "bg-blue-50" : ""
    } ${className}`}
  >
    <span className="text-gray-700">{label}</span>
    <span
      className={`font-medium ${highlighted ? "text-blue-700" : ""}`}
    >
      {value}
    </span>
  </div>
);

InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node
  ]).isRequired,
  highlighted: PropTypes.bool,
  className: PropTypes.string
};

export default InfoItem;