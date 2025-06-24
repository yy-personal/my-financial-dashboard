import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';

/**
 * Temporary utility component to fix the salary adjustment persistence issue
 * This component helps clear old salary adjustment fields that are causing conflicts
 */
const SalaryAdjustmentFixer = () => {
  const { financialData, updateFinancialData } = useFinancial();
  const [isFixed, setIsFixed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check if old salary adjustment fields exist
  const hasOldFields = financialData?.income && (
    financialData.income.futureSalary !== undefined ||
    financialData.income.salaryAdjustmentMonth !== undefined ||
    financialData.income.salaryAdjustmentYear !== undefined
  );

  // Clear the old salary adjustment fields
  const clearOldFields = () => {
    const updatedIncome = {
      ...financialData.income,
      futureSalary: undefined,
      salaryAdjustmentMonth: undefined,
      salaryAdjustmentYear: undefined
    };
    
    updateFinancialData({
      income: updatedIncome
    });
    
    setIsFixed(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setIsFixed(false);
    }, 3000);
  };

  // If no old fields exist, don't show the component
  if (!hasOldFields) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-green-800 font-medium">Salary Adjustments Clean</h3>
        </div>
        <p className="text-green-700 mt-1 text-sm">
          No old salary adjustment fields detected. Your system is using the new salary adjustments format.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-yellow-800 font-medium">Legacy Salary Adjustment Fields Detected</h3>
          <p className="text-yellow-700 mt-1 text-sm">
            Your system has old salary adjustment fields that may be causing the "Future Salary Adjustments" to persist at 5100. 
            Click the button below to clear these legacy fields and fix the issue.
          </p>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
              <h4 className="text-yellow-800 font-medium text-sm mb-2">Legacy fields found:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                {financialData.income.futureSalary !== undefined && (
                  <li>• Future Salary: ${financialData.income.futureSalary}</li>
                )}
                {financialData.income.salaryAdjustmentMonth !== undefined && (
                  <li>• Adjustment Month: {financialData.income.salaryAdjustmentMonth}</li>
                )}
                {financialData.income.salaryAdjustmentYear !== undefined && (
                  <li>• Adjustment Year: {financialData.income.salaryAdjustmentYear}</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={clearOldFields}
              disabled={isFixed}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isFixed 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {isFixed ? (
                <>
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Fixed!
                </>
              ) : (
                'Clear Legacy Fields'
              )}
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {isFixed && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm">
                ✅ Legacy salary adjustment fields have been cleared! The "Future Salary Adjustments" persistence issue should now be resolved.
                You can refresh the page to see the changes take effect.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryAdjustmentFixer;