import React from "react";
import PropTypes from "prop-types";

/**
 * Card component for consistent styling across the application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to render inside the card
 * @param {string} [props.title] - Optional card title
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {string} [props.titleColor="bg-blue-600"] - Background color for the title area
 * @returns {JSX.Element}
 */
const Card = ({ children, title, className = "", titleColor = "bg-blue-600" }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {title && (
      <div className={`${titleColor} px-4 py-3`}>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  titleColor: PropTypes.string,
};

export default Card;
