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
 * @param {string} props.savingsTimeframe - Current savings timeframe ('before' or 'after')
 * @param {Function} props.onUpdate - Function to update settings
 * @param {Function} props.onSavingsTimeframeUpdate - Function to update savings timeframe
 * @returns {JSX.Element}
 */
const ProjectionSettings = ({ 
  currentSettings, 
  currentValues,
  savingsTimeframe = 'before',
  onUpdate,
  onSavingsTimeframeUpdate
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

  // Handle savings timeframe toggle
  const handleSavingsTimeframeChange = (timeframe) => {
    if (onSavingsTimeframeUpdate) {
      onSavingsTimeframeUpdate(timeframe);
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

      {/* Savings Calculation Method */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-md font-medium text-blue-800 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Savings Calculation Method
        </h4>
        <p className="text-sm text-blue-700 mb-4">
          Choose how your monthly savings are calculated in the projections:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              savingsTimeframe === 'before' 
                ? 'border-blue-500 bg-blue-100' 
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
            onClick={() => handleSavingsTimeframeChange('before')}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="savings-before"
                name="savingsTimeframe"
                value="before"
                checked={savingsTimeframe === 'before'}
                onChange={() => handleSavingsTimeframeChange('before')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="savings-before" className="ml-2 text-sm font-medium text-gray-900">
                Before Monthly Expenses
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-6">
              Savings = Take-home Pay - Monthly Expenses - Loan Payment
            </p>
            <p className="text-xs text-blue-600 ml-6 mt-1">
              <strong>Current calculation:</strong> {formatCurrency((currentValues.takeHomePay || 0) - (currentValues.monthlyExpenses || 0) - (currentValues.loanPayment || 0))}
            </p>
          </div>
          
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              savingsTimeframe === 'after' 
                ? 'border-blue-500 bg-blue-100' 
                : 'border-gray-300 bg-white hover:border-blue-300'
            }`}
            onClick={() => handleSavingsTimeframeChange('after')}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="savings-after"
                name="savingsTimeframe"
                value="after"
                checked={savingsTimeframe === 'after'}
                onChange={() => handleSavingsTimeframeChange('after')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="savings-after" className="ml-2 text-sm font-medium text-gray-900">
                After Monthly Expenses
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-6">
              Monthly Expenses include your predetermined savings amount
            </p>
            <p className="text-xs text-blue-600 ml-6 mt-1">
              <strong>Use this if:</strong> You budget a fixed savings amount in your expenses
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs text-yellow-700">
              <strong>Tip:</strong> Choose "Before" if you want to see potential savings based on your income and expenses. 
              Choose "After" if you already have a fixed savings amount included in your monthly expenses.
            </p>
          </div>
        </div>
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
    loanRemaining: PropTypes.number,
    takeHomePay: PropTypes.number
  }).isRequired,
  savingsTimeframe: PropTypes.oneOf(['before', 'after']),
  onUpdate: PropTypes.func.isRequired,
  onSavingsTimeframeUpdate: PropTypes.func
};

export default ProjectionSettings;