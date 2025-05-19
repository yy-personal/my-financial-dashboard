import React from "react";
import PropTypes from "prop-types";
import Card from "../../common/Card";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * UpcomingEvents Component
 * Displays upcoming financial events for the next few months
 * 
 * @param {Object} props - Component props
 * @param {Array} props.upcomingEvents - List of upcoming financial events
 * @returns {JSX.Element}
 */
const UpcomingEvents = ({ upcomingEvents }) => {
  return (
    <Card title="Upcoming Financial Events" titleColor="bg-yellow-600">
      {upcomingEvents.length > 0 ? (
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              className="flex p-3 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`p-2 rounded-full ${
                    event.type === "Bonus"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {event.type === "Bonus" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      ></path>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-800">
                    {event.type}
                  </h4>
                  <span className="ml-2 text-sm text-gray-600">
                    {event.date}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {event.type === "Bonus"
                    ? `${event.description}: ${formatCurrency(
                        event.amount
                      )}`
                    : event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            No upcoming financial events in the next 3 months.
          </p>
        </div>
      )}
    </Card>
  );
};

UpcomingEvents.propTypes = {
  upcomingEvents: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number,
      description: PropTypes.string.isRequired
    })
  ).isRequired
};

export default UpcomingEvents;