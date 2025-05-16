// src/components/GoalTracker.js
import React, { useState, useContext } from 'react';
import { FinancialContext } from '../context/FinancialContext';

const GoalTracker = () => {
    const { financialData, updateFinancialData } = useContext(FinancialContext);
    
    // Initialize goals from context or create default goals
    const [goals, setGoals] = useState(
        financialData.goals || [
            { 
                id: 1, 
                name: "Emergency Fund", 
                targetAmount: 15000, 
                currentAmount: financialData.personalInfo.currentSavings, 
                targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                category: "savings",
                priority: "high",
                color: "#0088FE"
            },
            { 
                id: 2, 
                name: "Pay Off Loan", 
                targetAmount: financialData.personalInfo.remainingLoan, 
                currentAmount: financialData.personalInfo.remainingLoan - financialData.personalInfo.monthlyRepayment * 3, 
                targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                category: "debt",
                priority: "medium",
                color: "#00C49F"
            }
        ]
    );
    
    // State for new goal form
    const [newGoal, setNewGoal] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        category: 'savings',
        priority: 'medium',
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });
    
    // State for showing the form
    const [showForm, setShowForm] = useState(false);
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-SG', {
            style: 'currency',
            currency: 'SGD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Format date
    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };
    
    // Calculate progress percentage
    const calculateProgress = (goal) => {
        if (goal.category === 'debt') {
            // For debt goals, progress is how much has been paid off
            return ((goal.targetAmount - goal.currentAmount) / goal.targetAmount) * 100;
        }
        // For savings and other goals, progress is how much has been saved
        return (goal.currentAmount / goal.targetAmount) * 100;
    };
    
    // Calculate days remaining
    const calculateDaysRemaining = (targetDate) => {
        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };
    
    // Handle input changes for new goal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGoal({
            ...newGoal,
            [name]: name === 'targetDate' ? new Date(value) : value
        });
    };
    
    // Handle form submission for new goal
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (newGoal.name.trim() && newGoal.targetAmount) {
            // Create new goal with unique ID
            const newGoalWithId = {
                ...newGoal,
                id: Date.now(),
                targetAmount: parseFloat(newGoal.targetAmount),
                currentAmount: parseFloat(newGoal.currentAmount) || 0
            };
            
            // Add to goals state
            const updatedGoals = [...goals, newGoalWithId];
            setGoals(updatedGoals);
            
            // Update in context
            updateFinancialData({
                ...financialData,
                goals: updatedGoals
            });
            
            // Reset form
            setNewGoal({
                name: '',
                targetAmount: '',
                currentAmount: '',
                targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                category: 'savings',
                priority: 'medium',
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
            });
            
            // Hide form after submission
            setShowForm(false);
        }
    };
    
    // Handle updating a goal's current amount
    const handleUpdateGoal = (id, amount) => {
        const updatedGoals = goals.map(goal =>
            goal.id === id ? { ...goal, currentAmount: parseFloat(amount) || 0 } : goal
        );
        
        setGoals(updatedGoals);
        
        // Update in context
        updateFinancialData({
            ...financialData,
            goals: updatedGoals
        });
    };
    
    // Handle deleting a goal
    const handleDeleteGoal = (id) => {
        const updatedGoals = goals.filter(goal => goal.id !== id);
        
        setGoals(updatedGoals);
        
        // Update in context
        updateFinancialData({
            ...financialData,
            goals: updatedGoals
        });
    };
    
    // Get status color based on progress
    const getStatusColor = (progress) => {
        if (progress >= 90) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    
    // Sort goals by priority
    const sortedGoals = [...goals].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Financial Goals
                </h2>
                
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                        showForm ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {showForm ? 'Cancel' : '+ Add Goal'}
                </button>
            </div>
            
            {/* Add New Goal Form */}
            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3">Create New Financial Goal</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newGoal.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Target Amount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        value={newGoal.targetAmount}
                                        onChange={handleInputChange}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Current Amount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="currentAmount"
                                        value={newGoal.currentAmount}
                                        onChange={handleInputChange}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    name="targetDate"
                                    value={new Date(newGoal.targetDate).toISOString().split('T')[0]}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={newGoal.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="savings">Savings</option>
                                    <option value="debt">Debt Repayment</option>
                                    <option value="investment">Investment</option>
                                    <option value="purchase">Major Purchase</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={newGoal.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Goals List */}
            <div className="space-y-4">
                {sortedGoals.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">No financial goals yet. Add your first goal to start tracking!</p>
                    </div>
                ) : (
                    sortedGoals.map(goal => {
                        const progress = calculateProgress(goal);
                        const daysRemaining = calculateDaysRemaining(goal.targetDate);
                        
                        return (
                            <div key={goal.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-800 flex items-center">
                                            <div 
                                                className="h-3 w-3 rounded-full mr-2" 
                                                style={{ backgroundColor: goal.color }}
                                            ></div>
                                            {goal.name}
                                            <span 
                                                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                                            </span>
                                            <span 
                                                className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"
                                            >
                                                {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Target: {formatCurrency(goal.targetAmount)} by {formatDate(goal.targetDate)}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="text-red-600 hover:text-red-900 text-sm"
                                        title="Delete Goal"
                                    >
                                        Delete
                                    </button>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">
                                            {goal.category === 'debt' ? 'Remaining:' : 'Current:'}
                                            <span className="font-medium ml-1">
                                                {formatCurrency(goal.currentAmount)}
                                            </span>
                                        </span>
                                        <span className="text-gray-600">
                                            Progress:
                                            <span className="font-medium ml-1">
                                                {progress.toFixed(0)}%
                                            </span>
                                        </span>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${getStatusColor(progress)}`}
                                            style={{ width: `${Math.min(100, progress)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        {daysRemaining > 0 ? (
                                            <span>{daysRemaining} days remaining</span>
                                        ) : (
                                            <span className="text-red-600">Target date passed</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <label className="block text-sm text-gray-600">
                                            Update Progress:
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-xs">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={goal.currentAmount}
                                                onChange={(e) => handleUpdateGoal(goal.id, e.target.value)}
                                                className="w-24 pl-5 py-1 text-sm border border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GoalTracker;
