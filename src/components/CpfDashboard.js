import React, { useState, useEffect, useCallback } from 'react';
import { useFinancial } from '../context/FinancialContext';
import CpfCalculator from '../components/CpfCalculator';
import { EMPLOYEE_TYPE } from '../services/calculations/cpf';
// import useUIPreferences from '../hooks/useUIPreferences';
import { CpfGrowthChart } from './charts';

/**
 * CPF Dashboard Tab Component
 * 
 * This component integrates the CPF calculator with the rest of the
 * financial dashboard application.
 */
const CpfDashboard = () => {
  const { 
    financialData, 
    updateFinancialData,
    calculateAge
  } = useFinancial();
  
  // const { getChartColorPalette } = useUIPreferences();
  
  // Local state to track changes before committing to global state
  const [localCpfData, setLocalCpfData] = useState({
    salary: financialData.income?.currentSalary || 0,
    age: calculateAge() || 30,
    employeeType: EMPLOYEE_TYPE.SINGAPOREAN,
    bonusMonths: financialData.yearlyBonuses?.length || 0
  });

  // Generate projection data for the CPF growth chart
  const [projectionData, setProjectionData] = useState([]);
  
  // Generate projection data for the CPF growth chart - wrapped in useCallback to prevent infinite re-renders
  const generateProjectionData = useCallback(() => {
    const currentCpfBalance = financialData.personalInfo?.currentCpfBalance || 0;
    const monthlyContribution = (
      (financialData.income?.currentSalary * financialData.income?.cpfRate / 100) +
      (financialData.income?.currentSalary * financialData.income?.employerCpfRate / 100)
    );
    const annualInterestRate = 0.04; // 4% average annual interest rate
    
    const projectionYears = 10;
    const data = [];
    
    let projectedBalance = currentCpfBalance;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Generate projection points
    for (let year = 0; year <= projectionYears; year++) {
      for (let month = 0; month < 12; month++) {
        // Skip past months in the current year
        if (year === 0 && month < currentMonth) continue;
        
        // Add monthly contribution
        projectedBalance += monthlyContribution;
        
        // Add monthly interest (compounded)
        projectedBalance *= (1 + (annualInterestRate / 12));
        
        // Add to data array (one point per quarter to keep chart clean)
        if (month % 3 === 0) {
          const date = new Date(currentYear + year, month, 1);
          const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short'
          });
          
          data.push({
            date: formattedDate,
            cpfBalance: Math.round(projectedBalance)
          });
        }
      }
    }
    
    setProjectionData(data);
  }, [financialData.personalInfo?.currentCpfBalance, financialData.income?.currentSalary, financialData.income?.cpfRate, financialData.income?.employerCpfRate]);
  
  // Effect to update local state when financial data changes
  useEffect(() => {
    if (financialData) {
      setLocalCpfData(prevData => ({
        ...prevData,
        salary: financialData.income?.currentSalary || prevData.salary,
        age: calculateAge() || prevData.age,
        bonusMonths: financialData.yearlyBonuses?.length || prevData.bonusMonths
      }));
      
      // Generate projection data for the chart
      generateProjectionData();
    }
  }, [financialData, calculateAge, generateProjectionData]);
  
  // Handle changes in the calculator
  const handleCpfCalculatorChange = (updatedData) => {
    setLocalCpfData(updatedData);
  };
  
  // Save changes to global financial context
  const handleSaveChanges = () => {
    // Update income data
    updateFinancialData({
      income: {
        ...financialData.income,
        currentSalary: localCpfData.salary,
        cpfRate: localCpfData.employeeRate * 100 || financialData.income?.cpfRate,
        employerCpfRate: localCpfData.employerRate * 100 || financialData.income?.employerCpfRate,
      }
    });
    
    // Regenerate projection data with the new values
    generateProjectionData();
  };

  // Calculate projected CPF at age 55
  const calculateProjectedCpfAt55 = (currentCpfBalance, yearlyContribution, currentAge) => {
    // Number of years until age 55
    const yearsToAge55 = Math.max(0, 55 - currentAge);
    
    // Simplified annual growth rate (includes both contributions and interest)
    const annualInterestRate = 0.04; // 4% average annual interest rate
    
    let projectedBalance = currentCpfBalance;
    
    // Simple compound interest calculation with annual contributions
    for (let i = 0; i < yearsToAge55; i++) {
      // Add yearly contribution
      projectedBalance += yearlyContribution;
      
      // Add interest
      projectedBalance *= (1 + annualInterestRate);
    }
    
    return Math.round(projectedBalance);
  };
  
  // Format currency 
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Define CPF milestone for chart
  const cpfMilestone = {
    date: new Date(new Date().getFullYear() + 5, 0, 1).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    }),
    amount: 100000
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          CPF Calculator & Analysis
        </h2>
        
        {/* Only show save button if there are changes */}
        {(localCpfData.salary !== financialData.income?.currentSalary) && (
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save Changes
          </button>
        )}
      </div>
      
      <p className="text-gray-600">
        Calculate your CPF contributions based on your salary and personal details.
        Changes made here will update your financial projections.
      </p>
      
      {/* CPF Calculator Component */}
      <CpfCalculator 
        initialData={localCpfData}
        onChange={handleCpfCalculatorChange}
      />
      
      {/* CPF Impact Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          CPF Impact Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPF Growth Projection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <CpfGrowthChart 
              chartData={projectionData}
              cpfMilestone={cpfMilestone}
            />
          </div>
          
          {/* Retirement Readiness */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Retirement Readiness
            </h4>
            
            <p className="text-gray-600 text-sm mb-4">
              Evaluate how your current CPF savings and contribution rate
              align with your retirement goals.
            </p>
            
            {/* Retirement readiness indicators */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Current CPF Balance
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(financialData.personalInfo?.currentCpfBalance || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Yearly CPF Contribution
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency((
                    (financialData.income?.currentSalary * financialData.income?.cpfRate / 100) +
                    (financialData.income?.currentSalary * financialData.income?.employerCpfRate / 100)
                  ) * 12)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Projected at Age 55
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(calculateProjectedCpfAt55(
                    financialData.personalInfo?.currentCpfBalance || 0,
                    (financialData.income?.currentSalary * financialData.income?.cpfRate / 100) +
                    (financialData.income?.currentSalary * financialData.income?.employerCpfRate / 100) * 12,
                    calculateAge() || 30
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CPF Tips and Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          CPF Tips & Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              CPF Interest Rates
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Ordinary Account: Up to 3.5% p.a.</li>
              <li>Special Account: Up to 5% p.a.</li>
              <li>MediSave Account: Up to 5% p.a.</li>
              <li>Retirement Account: Up to 5% p.a.</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Maximizing CPF
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Consider voluntary contributions</li>
              <li>Transfer OA to SA for higher interest</li>
              <li>Use CPF for property wisely</li>
              <li>Consider CPF investment options</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Important Schemes
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Retirement Sum Scheme</li>
              <li>CPF LIFE</li>
              <li>Home Protection Scheme</li>
              <li>MediShield Life</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpfDashboard;