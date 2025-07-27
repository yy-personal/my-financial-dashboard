import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import InfoItem from "../../common/InfoItem";
import { formatDate } from "../../../services/formatters/dateFormatters";

/**
 * PersonalInfo component displays basic personal information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.personalInfo - Personal information data
 * @param {number} props.currentAge - Current calculated age
 * @returns {JSX.Element}
 */
const PersonalInfo = ({ personalInfo, currentAge }) => {
  return (
    <Card title="Personal Information">
      <div className="space-y-1">
        <InfoItem
          label="Birthday"
          value={formatDate(personalInfo.birthday)}
        />
        <InfoItem
          label="Current Age"
          value={`${currentAge} years old`}
          highlighted={true}
        />
        <InfoItem
          label="Projection Start"
          value="Current Month (Auto-detected)"
        />
      </div>
    </Card>
  );
};

PersonalInfo.propTypes = {
  personalInfo: PropTypes.shape({
    birthday: PropTypes.shape({
      month: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired
    }).isRequired,
    // projectionStart removed - now auto-detected
  }).isRequired,
  currentAge: PropTypes.number.isRequired
};

export default PersonalInfo;
