import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "../../../services/formatters/currencyFormatters";

/**
 * ProjectionSettings Component
 * Allows users to adjust financial projection settings
 *
 * @param {Object} props - Component props
 * @param {Object} props.currentSettings - Current projection settings
 * @param {Object} props.currentValues - Current financial values
 * @param {Function} props.onUpdate - Function to update settings
 * @returns {JSX.Element}
 */
const ProjectionSettings = ({ 
  currentSettings, 
  currentValues,
  onUpdate
}) => {
  const [settings, setSettings] = useState(currentSettings);
  const [hasChanged, setHasChanged] = useState(false);

  // Update local state when currentSettings change
  useEffect(() => {
    setSettings(currentSettings);
    setHasChanged(false);
  }, [currentSettings]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    // Validate input as a number
    if (!isNaN(numValue)) {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
      setHasChanged(true);
    }
  };

  // Handle save button click
  const handleSave = () => {
    onUpdate(settings);
    setHasChanged(false);
  };

  // Handle reset to defaults
  const handleReset = () => {
    setSettings({
      annualSalaryIncrease: 3.0,
      annualExpenseIncrease: 2.0,
      annualInvestmentReturn: 4.0,
      annualCpfInterestRate: 2.5,
      projectionYears: 30,
      bonusMonths: 2,
      bonusAmount: currentValues.salary || 0 // One month salary by default
    });
    setHasChanged(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Adjust Projection Settings
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize your financial projections by adjusting the parameters below. These settings affect how your future financial situation is calculated.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Growth Rates */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Growth Rates</h4>
          
          <div>
            <label htmlFor="annualSalaryIncrease" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Salary Increase (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="annualSalaryIncrease"
                id="annualSalaryIncrease"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                value={settings.annualSalaryIncrease}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="20"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Historical average: 3-5% per year
            </p>
          </div>
          
          <div>
            <label htmlFor="annualExpenseIncrease" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Expense Increase (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="annualExpenseIncrease"
                id="annualExpenseIncrease"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                value={settings.annualExpenseIncrease}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="15"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Based on inflation, typically 1.5-3%
            </p>
          </div>
        </div>

        {/* Return Rates */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Return Rates</h4>
          
          <div>
            <label htmlFor="annualInvestmentReturn" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Investment Return (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="annualInvestmentReturn"
                id="annualInvestmentReturn"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                value={settings.annualInvestmentReturn}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="20"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Conservative estimate: 4-6% per year
            </p>
          </div>
          
          <div>
            <label htmlFor="annualCpfInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Annual CPF Interest Rate (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="annualCpfInterestRate"
                id="annualCpfInterestRate"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                value={settings.annualCpfInterestRate}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Standard CPF rate: 2.5-4% per year
            </p>
          </div>
        </div>

        {/* Other Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Additional Settings</h4>
          
          <div>
            <label htmlFor="projectionYears" className="block text-sm font-medium text-gray-700 mb-1">
              Projection Years
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="projectionYears"
                id="projectionYears"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md"
                value={settings.projectionYears}
                onChange={handleChange}
                step="1"
                min="1"
                max="50"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Number of years to project into the future
            </p>
          </div>
          
          <div>
            <label htmlFor="bonusMonths" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Bonus Months
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="bonusMonths"
                id="bonusMonths"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-3 sm:text-sm border-gray-300 rounded-md"
                value={settings.bonusMonths}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="12"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Typical: 1-3 months of salary as bonus
            </p>
          </div>
          
          <div>
            <label htmlFor="bonusAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Bonus Amount per Month
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="bonusAmount"
                id="bonusAmount"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                value={settings.bonusAmount}
                onChange={handleChange}
                step="100"
                min="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Current monthly salary: {formatCurrency(currentValues.salary || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanged}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
            hasChanged
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-400 cursor-not-allowed"
          }`}
        >
          Update Projection
        </button>
      </div>
    </div>
  );
};

ProjectionSettings.propTypes = {
  currentSettings: PropTypes.shape({
    annualSalaryIncrease: PropTypes.number,
    annualExpenseIncrease: PropTypes.number,
    annualInvestmentReturn: PropTypes.number,
    annualCpfInterestRate: PropTypes.number,
    projectionYears: PropTypes.number,
    bonusMonths: PropTypes.number,
    bonusAmount: PropTypes.number
  }).isRequired,
  currentValues: PropTypes.shape({
    salary: PropTypes.number,
    monthlySavings: PropTypes.number,
    monthlyExpenses: PropTypes.number,
    loanPayment: PropTypes.number,
    liquidCash: PropTypes.number,
    cpfBalance: PropTypes.number,
    loanRemaining: PropTypes.number
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ProjectionSettings;