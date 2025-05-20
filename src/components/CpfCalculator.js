import React, { useState } from 'react';
import useCpfCalculator from '../hooks/useCpfCalculator';

/**
 * CPF Calculator Component
 * 
 * This component provides a user interface for calculating and displaying
 * CPF contributions based on salary and other parameters.
 */
const CpfCalculator = ({ initialData = {}, onChange }) => {
  // Initialize with provided data or defaults
  const {
    cpfInputs,
    cpfResults,
    monthlyCpf,
    bonusCpf,
    yearlyCpf,
    employeeRate,
    employerRate,
    updateCpfInput,
    updateSalary,
    updateEmployeeType,
    EMPLOYEE_TYPE
  } = useCpfCalculator(initialData);

  // Local UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handler for salary input change
  const handleSalaryChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    updateSalary(value);
    
    // Notify parent component if needed
    if (onChange && typeof onChange === 'function') {
      onChange({
        ...cpfInputs,
        salary: value
      });
    }
  };

  // Handler for age input change
  const handleAgeChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    updateCpfInput('age', value);
    
    // Notify parent component if needed
    if (onChange && typeof onChange === 'function') {
      onChange({
        ...cpfInputs,
        age: value
      });
    }
  };

  // Handler for employee type change
  const handleEmployeeTypeChange = (e) => {
    const value = e.target.value;
    updateEmployeeType(value);
    
    // Notify parent component if needed
    if (onChange && typeof onChange === 'function') {
      onChange({
        ...cpfInputs,
        employeeType: value
      });
    }
  };

  // Handler for bonus months change
  const handleBonusMonthsChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    updateCpfInput('bonusMonths', value);
    
    // Notify parent component if needed
    if (onChange && typeof onChange === 'function') {
      onChange({
        ...cpfInputs,
        bonusMonths: value
      });
    }
  };

  // Format currency values for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format percentage values for display
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        CPF Calculator
      </h2>
      
      {/* Input section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Salary
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">S$</span>
            </div>
            <input
              type="number"
              value={cpfInputs.salary}
              onChange={handleSalaryChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="0.00"
              min="0"
              step="50"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            value={cpfInputs.age}
            onChange={handleAgeChange}
            className="focus:ring-green-500 focus:border-green-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="30"
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Status
          </label>
          <select
            value={cpfInputs.employeeType}
            onChange={handleEmployeeTypeChange}
            className="focus:ring-green-500 focus:border-green-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value={EMPLOYEE_TYPE.SINGAPOREAN}>Singaporean Citizen</option>
            <option value={EMPLOYEE_TYPE.PR_FIRST_YEAR}>PR (1st Year)</option>
            <option value={EMPLOYEE_TYPE.PR_SECOND_YEAR}>PR (2nd Year)</option>
            <option value={EMPLOYEE_TYPE.PR_THIRD_YEAR_ONWARDS}>PR (3rd Year+)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Bonus (Months)
          </label>
          <input
            type="number"
            value={cpfInputs.bonusMonths}
            onChange={handleBonusMonthsChange}
            className="focus:ring-green-500 focus:border-green-500 block w-full px-3 py-2 sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
            placeholder="0"
            min="0"
            step="0.5"
          />
        </div>
      </div>
      
      {/* Results section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-3">
          Monthly CPF Contributions
        </h3>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-gray-600">Your Contribution:</div>
          <div className="text-gray-900 font-medium">
            {formatCurrency(monthlyCpf.employeeContribution)} ({formatPercentage(employeeRate)})
          </div>
          
          <div className="text-gray-600">Employer Contribution:</div>
          <div className="text-gray-900 font-medium">
            {formatCurrency(monthlyCpf.employerContribution)} ({formatPercentage(employerRate)})
          </div>
          
          <div className="text-gray-600">Total CPF Contribution:</div>
          <div className="text-gray-900 font-medium">
            {formatCurrency(monthlyCpf.totalContribution)}
          </div>
          
          <div className="text-gray-600">Take-Home Pay:</div>
          <div className="text-gray-900 font-medium">
            {formatCurrency(monthlyCpf.takeHomePay)}
          </div>
        </div>
      </div>
      
      {/* Toggle for advanced details */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center mb-4"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Details
        <svg 
          className={`ml-1 h-4 w-4 transition-transform ${showAdvanced ? 'transform rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Advanced details section */}
      {showAdvanced && (
        <>
          {/* Yearly estimates */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Yearly Estimates
            </h3>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-600">Your Yearly Contribution:</div>
              <div className="text-gray-900 font-medium">
                {formatCurrency(yearlyCpf.yearlyEmployeeContribution)}
              </div>
              
              <div className="text-gray-600">Employer Yearly Contribution:</div>
              <div className="text-gray-900 font-medium">
                {formatCurrency(yearlyCpf.yearlyEmployerContribution)}
              </div>
              
              <div className="text-gray-600">Total Yearly CPF:</div>
              <div className="text-gray-900 font-medium">
                {formatCurrency(yearlyCpf.yearlyTotalContribution)}
              </div>
            </div>
          </div>
          
          {/* Bonus details (if applicable) */}
          {cpfInputs.bonusMonths > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Bonus CPF Contributions
              </h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-600">Bonus Amount:</div>
                <div className="text-gray-900 font-medium">
                  {formatCurrency(cpfInputs.salary * cpfInputs.bonusMonths)}
                </div>
                
                <div className="text-gray-600">Your Contribution:</div>
                <div className="text-gray-900 font-medium">
                  {formatCurrency(bonusCpf.employeeContribution)}
                </div>
                
                <div className="text-gray-600">Employer Contribution:</div>
                <div className="text-gray-900 font-medium">
                  {formatCurrency(bonusCpf.employerContribution)}
                </div>
                
                <div className="text-gray-600">Total Bonus CPF:</div>
                <div className="text-gray-900 font-medium">
                  {formatCurrency(bonusCpf.totalContribution)}
                </div>
              </div>
            </div>
          )}
          
          {/* CPF allocation information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              CPF Allocation Information
            </h3>
            
            <p className="text-xs text-gray-500 mb-2">
              Below age 55, CPF contributions are typically allocated to these accounts:
            </p>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-100 p-2 rounded">
                <div className="font-medium text-blue-800">Ordinary Account</div>
                <div className="text-blue-600">
                  For housing, insurance, investment and education
                </div>
              </div>
              
              <div className="bg-green-100 p-2 rounded">
                <div className="font-medium text-green-800">
                  Special Account
                </div>
                <div className="text-green-600">
                  For retirement and investment in retirement-related financial products
                </div>
              </div>
              
              <div className="bg-purple-100 p-2 rounded">
                <div className="font-medium text-purple-800">
                  MediSave Account
                </div>
                <div className="text-purple-600">
                  For hospitalization expenses and approved medical insurance
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Disclaimer:</strong> This calculator provides estimates based on standard CPF 
          contribution rates. For the most accurate information, please refer to the 
          official CPF Board website.
        </p>
      </div>
    </div>
  );
};

export default CpfCalculator;