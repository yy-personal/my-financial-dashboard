import React, { useState, useEffect, useRef } from 'react';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import Card from '../../common/Card';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import CPFContributionSummary from './CPFContributionSummary';
import CPFContributionChart from './CPFContributionChart';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';

/**
 * CPFDashboard Component
 * Comprehensive dashboard showing CPF information including employer contributions
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const CPFDashboard = ({ className = '' }) => {
  // Use a ref to track if we've already processed the initial error
  const errorProcessedRef = useRef(false);
  
  // Component state
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use our financial calculations hook with error handling (wrap in try/catch)
  let financial = {};
  try {
    financial = useFinancialCalculations() || {};
  } catch (err) {
    console.error('Error in useFinancialCalculations:', err);
    // Only set error state once to prevent loops
    if (!errorProcessedRef.current) {
      setHasError(true);
      errorProcessedRef.current = true;
    }
  }
  
  // Process error state only once to avoid loops - use a ref to track this
  useEffect(() => {
    // Skip if we've already processed an error
    if (errorProcessedRef.current) return;
    
    // Check if the hook returned an error
    if (financial && financial.hasCalculationError) {
      console.error('CPF Dashboard calculation error:', financial.calculationError);
      setHasError(true);
      errorProcessedRef.current = true;
    } else {
      // Only update if this is our first time seeing no error
      if (!isLoaded) {
        setHasError(false);
      }
    }
    
    // Only set loaded to true once
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }, []); // Empty dependency array - only run once on mount
  
  // Extract CPF-related data with safe defaults
  const {
    // Current salary and rates
    currentSalary = 0,
    cpfContributionRate = 20,
    employerCpfContributionRate = 17,
    
    // CPF contributions
    cpfContribution = 0,
    employerCpfContribution = 0,
    totalCpfContribution = 0,
    
    // CPF account balances
    cpfOrdinaryAccount = 0,
    cpfSpecialAccount = 0,
    cpfMedisaveAccount = 0,
    cpfTotalSavings = 0,
    
    // CPF account percentages
    cpfOrdinaryPercentage = 0,
    cpfSpecialPercentage = 0,
    cpfMedisavePercentage = 0,
    
    // CPF allocations
    cpfOrdinaryAllocation = 0,
    cpfSpecialAllocation = 0,
    cpfMedisaveAllocation = 0,
    
    // CPF contribution caps
    cpfContributionCaps = {},
  } = financial;
  
  // Current allocations object for passing to components
  const cpfAllocations = {
    ordinary: cpfOrdinaryAllocation || 0,
    special: cpfSpecialAllocation || 0,
    medisave: cpfMedisaveAllocation || 0
  };
  
  // Account balances for display
  const cpfAccounts = [
    { 
      name: 'Ordinary Account', 
      value: cpfOrdinaryAccount || 0, 
      percentage: cpfOrdinaryPercentage || 0,
      color: 'blue',
      description: 'For housing, education, investment and insurance'
    },
    { 
      name: 'Special Account', 
      value: cpfSpecialAccount || 0, 
      percentage: cpfSpecialPercentage || 0,
      color: 'purple',
      description: 'For retirement and investments in retirement-related financial products'
    },
    { 
      name: 'Medisave Account', 
      value: cpfMedisaveAccount || 0, 
      percentage: cpfMedisavePercentage || 0,
      color: 'pink',
      description: 'For hospitalization and approved medical insurance'
    }
  ];
  
  // Calculate total compensation
  const totalCompensation = (currentSalary || 0) + (employerCpfContribution || 0);
  
  // If not loaded yet, show loading state
  if (!isLoaded) {
    return (
      <div className="cpf-dashboard-loading flex justify-center items-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading CPF Dashboard...</p>
        </div>
      </div>
    );
  }
  
  // If there's an error, show error message
  if (hasError) {
    return (
      <div className="cpf-dashboard-error bg-red-50 border border-red-200 rounded-lg p-6 my-4">
        <h2 className="text-2xl font-bold text-red-800 mb-4">CPF Dashboard</h2>
        <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-red-800">Unable to load CPF data</h3>
          </div>
          <p className="text-red-700 mb-4">
            We encountered an error while calculating your CPF information. This could be due to missing financial data.
          </p>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm font-medium text-red-800">Troubleshooting steps:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-red-700 space-y-1">
              <li>Make sure you've entered your monthly salary information</li>
              <li>Update your CPF account balances in the Edit Parameters section</li>
              <li>Check for any invalid or negative values in your financial data</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  // Normal rendering with data
  return (
    <div className={`cpf-dashboard ${className} space-y-6`}>
      <h2 className="text-2xl font-bold">CPF Dashboard</h2>
      
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-lg font-medium text-blue-800 mb-1">Total CPF Savings</h3>
          <div className="text-2xl font-bold">{formatCurrency(cpfTotalSavings)}</div>
          <div className="text-sm text-blue-800 mt-2">
            Across all three CPF accounts
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-teal-50">
          <h3 className="text-lg font-medium text-green-800 mb-1">Monthly CPF Contribution</h3>
          <div className="text-2xl font-bold">{formatCurrency(totalCpfContribution)}</div>
          <div className="text-sm text-green-800 mt-2">
            {formatCurrency(cpfContribution)} from you + {formatCurrency(employerCpfContribution)} from employer
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-lg font-medium text-purple-800 mb-1">Total Compensation</h3>
          <div className="text-2xl font-bold">{formatCurrency(totalCompensation)}</div>
          <div className="text-sm text-purple-800 mt-2">
            Salary + Employer CPF Contribution
          </div>
        </Card>
      </div>
      
      {/* Contribution Chart and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary componentName="CPFContributionChart" showDetails={false}>
          <CPFContributionChart 
            employeeContribution={cpfContribution}
            employerContribution={employerCpfContribution}
            salary={currentSalary}
          />
        </ErrorBoundary>
        
        <ErrorBoundary componentName="CPFContributionSummary" showDetails={false}>
          <CPFContributionSummary 
            employeeContribution={cpfContribution}
            employerContribution={employerCpfContribution}
            cpfAllocations={cpfAllocations}
            employeeRate={cpfContributionRate}
            employerRate={employerCpfContributionRate}
          />
        </ErrorBoundary>
      </div>
      
      {/* Account Balances */}
      <Card>
        <h3 className="text-lg font-medium mb-4">CPF Account Balances</h3>
        <div className="space-y-4">
          {cpfAccounts.map((account, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${account.color}-500 mr-2`}></div>
                  <span className="font-medium">{account.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(account.value)}</div>
                  <div className="text-sm text-gray-500">{formatPercentage(account.percentage)} of total CPF</div>
                </div>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-${account.color}-500`}
                  style={{ width: `${account.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">{account.description}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Monthly Allocation */}
      <Card>
        <h3 className="text-lg font-medium mb-4">Monthly CPF Allocation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your total monthly CPF contribution of {formatCurrency(totalCpfContribution)} is 
          distributed across your three CPF accounts according to your age.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded p-4">
            <div className="text-blue-800 font-medium mb-1">Ordinary Account</div>
            <div className="text-xl font-bold">{formatCurrency(cpfOrdinaryAllocation)}</div>
            <div className="text-sm text-blue-800 mt-1">
              {formatPercentage(totalCpfContribution > 0 ? (cpfOrdinaryAllocation / totalCpfContribution * 100) : 0)} of total contribution
            </div>
          </div>
          
          <div className="bg-purple-50 rounded p-4">
            <div className="text-purple-800 font-medium mb-1">Special Account</div>
            <div className="text-xl font-bold">{formatCurrency(cpfSpecialAllocation)}</div>
            <div className="text-sm text-purple-800 mt-1">
              {formatPercentage(totalCpfContribution > 0 ? (cpfSpecialAllocation / totalCpfContribution * 100) : 0)} of total contribution
            </div>
          </div>
          
          <div className="bg-pink-50 rounded p-4">
            <div className="text-pink-800 font-medium mb-1">Medisave Account</div>
            <div className="text-xl font-bold">{formatCurrency(cpfMedisaveAllocation)}</div>
            <div className="text-sm text-pink-800 mt-1">
              {formatPercentage(totalCpfContribution > 0 ? (cpfMedisaveAllocation / totalCpfContribution * 100) : 0)} of total contribution
            </div>
          </div>
        </div>
      </Card>
      
      {/* Employer Contribution Benefits */}
      <Card className="bg-gradient-to-r from-teal-50 to-green-50">
        <h3 className="text-lg font-medium text-teal-800 mb-3">Employer CPF Contribution Benefits</h3>
        
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-medium text-teal-800">Long-term Growth</h4>
              <p className="text-sm text-teal-600">
                Your employer contributes {formatCurrency(employerCpfContribution)} monthly, which grows 
                with compound interest over time.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-medium text-teal-800">Retirement Security</h4>
              <p className="text-sm text-teal-600">
                Your employer's contribution boosts your retirement savings without reducing your 
                take-home pay.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-md font-medium text-teal-800">Annual Value</h4>
              <p className="text-sm text-teal-600">
                Over a year, your employer contributes {formatCurrency(employerCpfContribution * 12)} to your CPF,
                which is an important part of your total compensation package.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CPFDashboard;