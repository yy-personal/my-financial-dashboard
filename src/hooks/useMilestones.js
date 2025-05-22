import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * useMilestones hook
 * Manages financial milestones and goals
 * 
 * @param {Object} initialMilestones - Initial milestones data
 * @param {Object} projectionData - Financial projection data
 * @returns {Object} Milestone management functions and data
 */
const useMilestones = (initialMilestones = [], projectionData = {}) => {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [customMilestones, setCustomMilestones] = useState([]);
  const [filteredMilestones, setFilteredMilestones] = useState([]);
  const [milestoneTypes, setMilestoneTypes] = useState([
    { id: "all", label: "All Milestones", active: true },
    { id: "loan", label: "Loan Milestones", active: false },
    { id: "savings", label: "Savings Milestones", active: false },
    { id: "retirement", label: "Retirement Milestones", active: false },
    { id: "custom", label: "Custom Milestones", active: false }
  ]);

  // Add a new custom milestone
  const addMilestone = useCallback((milestone) => {
    const newMilestone = {
      id: uuidv4(),
      ...milestone,
      type: milestone.type || "custom",
      custom: true
    };
    
    setCustomMilestones(prev => [...prev, newMilestone]);
  }, []);

  // Edit an existing milestone
  const editMilestone = useCallback((id, updatedData) => {
    setCustomMilestones(prev => 
      prev.map(milestone => 
        milestone.id === id 
          ? { ...milestone, ...updatedData } 
          : milestone
      )
    );
  }, []);

  // Delete a milestone
  const deleteMilestone = useCallback((id) => {
    setCustomMilestones(prev => 
      prev.filter(milestone => milestone.id !== id)
    );
  }, []);

  // Toggle milestone type filter
  const toggleMilestoneType = useCallback((typeId) => {
    // If toggling 'all', set only 'all' active
    if (typeId === 'all') {
      setMilestoneTypes(prev => 
        prev.map(type => ({
          ...type,
          active: type.id === 'all'
        }))
      );
    } else {
      // If toggling a specific type, deactivate 'all'
      setMilestoneTypes(prev => 
        prev.map(type => {
          if (type.id === 'all') {
            return { ...type, active: false };
          }
          if (type.id === typeId) {
            return { ...type, active: !type.active };
          }
          return type;
        })
      );
      
      // If no specific types are active after toggling, re-activate 'all'
      const updatedTypes = milestoneTypes.map(type => {
        if (type.id === typeId) {
          return { ...type, active: !type.active };
        }
        return type;
      });
      
      const anySpecificActive = updatedTypes.some(type => 
        type.id !== 'all' && type.active
      );
      
      if (!anySpecificActive) {
        setMilestoneTypes(prev => 
          prev.map(type => ({
            ...type,
            active: type.id === 'all'
          }))
        );
      }
    }
  }, [milestoneTypes]);

  // Filter milestones based on active types
  useEffect(() => {
    // Combine automatic milestones with custom ones
    const allMilestones = [...milestones, ...customMilestones];
    
    // Check if "All" is active
    const isAllActive = milestoneTypes.find(type => type.id === 'all')?.active;
    
    if (isAllActive) {
      setFilteredMilestones(allMilestones);
      return;
    }
    
    // Get active type IDs
    const activeTypeIds = milestoneTypes
      .filter(type => type.active)
      .map(type => type.id);
    
    // Filter milestones by active types
    const filtered = allMilestones.filter(milestone => 
      activeTypeIds.includes(milestone.type)
    );
    
    setFilteredMilestones(filtered);
  }, [milestones, customMilestones, milestoneTypes]);

  // Auto-update system milestones when projection data changes
  useEffect(() => {
    if (!projectionData.loanPaidOffMonth && !projectionData.savingsGoalReachedMonth) {
      return;
    }
    
    const autoMilestones = [];
    
    // Loan payoff milestone
    if (projectionData.loanPaidOffMonth) {
      autoMilestones.push({
        id: "system-loan-payoff",
        title: "Loan Paid Off",
        description: "Complete payment of your outstanding loan",
        date: projectionData.loanPaidOffMonth.date,
        timeRemaining: projectionData.timeToPayLoan,
        complete: projectionData.timeToPayLoan <= 0,
        progress: 100 - (projectionData.timeToPayLoan / (projectionData.timeToPayLoan + 1) * 100),
        type: "loan",
        system: true
      });
    }
    
    // Savings goal milestone
    if (projectionData.savingsGoalReachedMonth) {
      autoMilestones.push({
        id: "system-savings-goal",
        title: "Savings Goal Reached",
        description: "Reach your liquid cash savings goal of $100,000",
        date: projectionData.savingsGoalReachedMonth.date,
        timeRemaining: projectionData.timeToSavingsGoal,
        complete: projectionData.timeToSavingsGoal <= 0,
        progress: Math.min(100, (projectionData.currentLiquidCash / 100000) * 100),
        type: "savings",
        system: true
      });
    }
    
    // Retirement milestone
    if (projectionData.currentAge) {
      const yearsToRetirement = 65 - projectionData.currentAge;
      const monthsToRetirement = yearsToRetirement * 12;
      
      autoMilestones.push({
        id: "system-retirement",
        title: "Retirement",
        description: "Target retirement age: 65",
        date: null, // Would need to calculate based on current date + years
        timeRemaining: monthsToRetirement,
        complete: monthsToRetirement <= 0,
        progress: Math.min(100, (projectionData.currentAge / 65) * 100),
        type: "retirement",
        system: true
      });
    }
    
    setMilestones(autoMilestones);
  }, [projectionData]);

  return {
    milestones: filteredMilestones,
    milestoneTypes,
    addMilestone,
    editMilestone,
    deleteMilestone,
    toggleMilestoneType
  };
};

export default useMilestones;