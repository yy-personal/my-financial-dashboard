import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  calculateCpfContributions, 
  estimateYearlyCpfContributions,
  EMPLOYEE_TYPE 
} from '../../services/calculations/cpf';

/**
 * Custom hook for managing CPF-related calculations and state
 * 
 * This hook provides CPF contribution calculations and management while
 * preventing render loops through careful state management and memoization.
 * 
 * @param {Object} initialData - Initial financial data
 * @returns {Object} CPF state and utility functions
 */
const useCpfCalculator = (initialData = {}) => {
  // Extract initial values with defaults
  const {
    salary = 0,
    age = 30,
    employeeType = EMPLOYEE_TYPE.SINGAPOREAN,
    bonusMonths = 0,
    annualBonusAmount = 0,
  } = initialData;

  // State management for input values
  const [cpfInputs, setCpfInputs] = useState({
    salary,
    age,
    employeeType,
    bonusMonths,
    annualBonusAmount
  });

  // Memoized CPF calculations to prevent unnecessary recalculations
  const cpfResults = useMemo(() => {
    const { salary, age, employeeType, bonusMonths, annualBonusAmount } = cpfInputs;
    
    // Calculate monthly CPF contributions
    const monthlyCpf = calculateCpfContributions(
      salary,
      employeeType,
      age
    );
    
    // Calculate bonus CPF if applicable
    let bonusCpf = { employeeContribution: 0, employerContribution: 0, totalContribution: 0 };
    
    if (annualBonusAmount > 0) {
      const yearToDateOW = Math.min(salary, 6000) * 12;
      bonusCpf = calculateCpfContributions(
        0,
        employeeType,
        age,
        annualBonusAmount,
        yearToDateOW
      );
    } else if (bonusMonths > 0) {
      // Use bonus months if specific bonus amount not provided
      const bonusAmount = salary * bonusMonths;
      const yearToDateOW = Math.min(salary, 6000) * 12;
      
      bonusCpf = calculateCpfContributions(
        0, 
        employeeType, 
        age, 
        bonusAmount, 
        yearToDateOW
      );
    }
    
    // Calculate yearly estimates
    const yearlyCpf = estimateYearlyCpfContributions(
      salary,
      employeeType,
      age,
      bonusMonths
    );
    
    return {
      monthly: monthlyCpf,
      bonus: bonusCpf,
      yearly: yearlyCpf,
      takeHomePay: monthlyCpf.takeHomePay,
      totalMonthlyContribution: monthlyCpf.totalContribution,
      employeeContribution: monthlyCpf.employeeContribution,
      employerContribution: monthlyCpf.employerContribution,
      rates: monthlyCpf.rates
    };
  }, [cpfInputs]);

  // Callback to update specific CPF input values
  // Using callback to maintain reference stability
  const updateCpfInput = useCallback((key, value) => {
    if (typeof key === 'string' && key in cpfInputs) {
      setCpfInputs(prev => ({
        ...prev,
        [key]: value
      }));
    } else if (typeof key === 'object') {
      // Allow batch updates with an object
      setCpfInputs(prev => ({
        ...prev,
        ...key
      }));
    }
  }, [cpfInputs]);

  // Helper to update salary (common operation)
  const updateSalary = useCallback((newSalary) => {
    updateCpfInput('salary', Number(newSalary));
  }, [updateCpfInput]);

  // Helper to update employee type
  const updateEmployeeType = useCallback((newType) => {
    if (Object.values(EMPLOYEE_TYPE).includes(newType)) {
      updateCpfInput('employeeType', newType);
    } else {
      console.error(`Invalid employee type: ${newType}`);
    }
  }, [updateCpfInput]);

  // Reset to initial values
  const resetToDefaults = useCallback(() => {
    setCpfInputs({
      salary: initialData.salary || 0,
      age: initialData.age || 30,
      employeeType: initialData.employeeType || EMPLOYEE_TYPE.SINGAPOREAN,
      bonusMonths: initialData.bonusMonths || 0,
      annualBonusAmount: initialData.annualBonusAmount || 0
    });
  }, [initialData]);

  // Effect to sync with external data changes
  // Only runs when initialData reference changes to prevent loops
  useEffect(() => {
    if (initialData && typeof initialData === 'object') {
      const updates = {};
      let hasUpdates = false;

      // Only update values that are provided and different
      if ('salary' in initialData && initialData.salary !== cpfInputs.salary) {
        updates.salary = initialData.salary;
        hasUpdates = true;
      }
      
      if ('age' in initialData && initialData.age !== cpfInputs.age) {
        updates.age = initialData.age;
        hasUpdates = true;
      }
      
      if ('employeeType' in initialData && initialData.employeeType !== cpfInputs.employeeType) {
        updates.employeeType = initialData.employeeType;
        hasUpdates = true;
      }
      
      if ('bonusMonths' in initialData && initialData.bonusMonths !== cpfInputs.bonusMonths) {
        updates.bonusMonths = initialData.bonusMonths;
        hasUpdates = true;
      }
      
      if ('annualBonusAmount' in initialData && initialData.annualBonusAmount !== cpfInputs.annualBonusAmount) {
        updates.annualBonusAmount = initialData.annualBonusAmount;
        hasUpdates = true;
      }

      // Only update state if there are actual changes
      if (hasUpdates) {
        setCpfInputs(prev => ({
          ...prev,
          ...updates
        }));
      }
    }
  }, [initialData]);

  return {
    // Current state
    cpfInputs,
    cpfResults,
    
    // Getters for common values
    employeeContribution: cpfResults.employeeContribution,
    employerContribution: cpfResults.employerContribution,
    totalContribution: cpfResults.totalMonthlyContribution,
    takeHomePay: cpfResults.takeHomePay,
    
    // Monthly, bonus and yearly breakdowns
    monthlyCpf: cpfResults.monthly,
    bonusCpf: cpfResults.bonus,
    yearlyCpf: cpfResults.yearly,
    
    // Rate information for display
    employeeRate: cpfResults.rates.employeeRate,
    employerRate: cpfResults.rates.employerRate,
    
    // Update functions
    updateCpfInput,
    updateSalary,
    updateEmployeeType,
    resetToDefaults,
    
    // Constants for reference
    EMPLOYEE_TYPE,
  };
};

export default useCpfCalculator;
