import React, { useState, useEffect } from 'react';
import Card from '../common/Card/Card';

/**
 * CurrentSavingsUpdater Component
 * 
 * Allows users to manually update their current savings and CPF balance
 * for more accurate financial projections starting from the current month
 */
const CurrentSavingsUpdater = ({ 
  currentSavings = 0,
  currentCpfBalance = 0,
  currentMonth,
  onUpdateSavings,
  onUpdateCpfBalance,
  onUpdateSavingsTimeframe,
  savingsTimeframe = 'before', // 'before' or 'after' monthly expenses
  projectionInsights,
  className = ""
}) => {
  const [savingsInput, setSavingsInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');
  const [showImpact, setShowImpact] = useState(false);
  const [isEditing, setIsEditing] = useState({ savings: false, cpf: false });
  const [tempValues, setTempValues] = useState({ savings: 0, cpf: 0 });

  // Initialize input values
  useEffect(() => {
    setSavingsInput(currentSavings.toString());
    setCpfInput(currentCpfBalance.toString());
    setTempValues({ savings: currentSavings, cpf: currentCpfBalance });
  }, [currentSavings, currentCpfBalance]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (value) => {
    return (value || 0).toLocaleString();
  };

  const handleSavingsUpdate = () => {
    const newAmount = parseFloat(savingsInput) || 0;
    if (newAmount !== currentSavings) {
      onUpdateSavings(newAmount);
      setTempValues(prev => ({ ...prev, savings: newAmount }));
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 3000);
    }
    setIsEditing(prev => ({ ...prev, savings: false }));
  };

  const handleCpfUpdate = () => {
    const newAmount = parseFloat(cpfInput) || 0;
    if (newAmount !== currentCpfBalance) {
      onUpdateCpfBalance(newAmount);
      setTempValues(prev => ({ ...prev, cpf: newAmount }));
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 3000);
    }
    setIsEditing(prev => ({ ...prev, cpf: false }));
  };

  const handleSavingsKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSavingsUpdate();
    } else if (e.key === 'Escape') {
      setSavingsInput(currentSavings.toString());
      setIsEditing(prev => ({ ...prev, savings: false }));
    }
  };

  const handleCpfKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCpfUpdate();
    } else if (e.key === 'Escape') {
      setCpfInput(currentCpfBalance.toString());
      setIsEditing(prev => ({ ...prev, cpf: false }));
    }
  };

  const totalAssets = currentSavings + currentCpfBalance;
  const savingsPercentage = totalAssets > 0 ? (currentSavings / totalAssets) * 100 : 0;
  const cpfPercentage = totalAssets > 0 ? (currentCpfBalance / totalAssets) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Month Info */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              Current Financial Position
            </h3>
            <p className="text-blue-600">
              {currentMonth ? `As of ${currentMonth.formatted}` : 'Current Status'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Total Assets</p>
            <p className="text-xl font-bold text-blue-800">
              {formatCurrency(totalAssets)}
            </p>
          </div>
        </div>
      </Card>

      {/* Savings and CPF Update Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liquid Cash/Savings */}
        <Card className="relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">
                Current Savings (SGD)
              </h4>
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, savings: !prev.savings }))}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isEditing.savings ? 'Cancel' : 'Update'}
              </button>
            </div>
            
            <div className="space-y-2">
              {isEditing.savings ? (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={savingsInput}
                    onChange={(e) => setSavingsInput(e.target.value)}
                    onKeyDown={handleSavingsKeyPress}
                    onBlur={handleSavingsUpdate}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    placeholder="Enter current savings"
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  className="text-2xl font-bold text-green-600 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setIsEditing(prev => ({ ...prev, savings: true }))}
                >
                  {formatCurrency(currentSavings)}
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Liquid Cash</span>
                <span>{savingsPercentage.toFixed(1)}% of total assets</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Savings Timeframe Selection */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-800 mb-2">
                Savings Balance Timing
              </h5>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="savingsTimeframe"
                    value="before"
                    checked={savingsTimeframe === 'before'}
                    onChange={(e) => onUpdateSavingsTimeframe && onUpdateSavingsTimeframe(e.target.value)}
                    className="text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-yellow-700">
                    <strong>Before</strong> monthly expenses (add monthly savings to projection)
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="savingsTimeframe"
                    value="after"
                    checked={savingsTimeframe === 'after'}
                    onChange={(e) => onUpdateSavingsTimeframe && onUpdateSavingsTimeframe(e.target.value)}
                    className="text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-yellow-700">
                    <strong>After</strong> monthly expenses (start projection from this amount)
                  </span>
                </label>
              </div>
              <div className="mt-2 text-xs text-yellow-600">
                {savingsTimeframe === 'before' 
                  ? '💡 Your savings will grow each month from this starting point' 
                  : '💡 This is your balance after all current month expenses are paid'}
              </div>
            </div>
          </div>
        </Card>

        {/* CPF Balance */}
        <Card className="relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">
                Current CPF Balance (SGD)
              </h4>
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, cpf: !prev.cpf }))}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isEditing.cpf ? 'Cancel' : 'Update'}
              </button>
            </div>
            
            <div className="space-y-2">
              {isEditing.cpf ? (
                <div className="flex items-center space-x-2">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(e.target.value)}
                    onKeyDown={handleCpfKeyPress}
                    onBlur={handleCpfUpdate}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    placeholder="Enter current CPF balance"
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  className="text-2xl font-bold text-blue-600 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setIsEditing(prev => ({ ...prev, cpf: true }))}
                >
                  {formatCurrency(currentCpfBalance)}
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>CPF Ordinary Account</span>
                <span>{cpfPercentage.toFixed(1)}% of total assets</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(cpfPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Impact Notification */}
      {showImpact && (
        <Card className="bg-green-50 border-green-200 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-green-800 font-medium">
                Financial data updated successfully!
              </h4>
              <p className="text-green-700 text-sm">
                Your projections have been recalculated based on your current balances.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Projection Impact Summary */}
      {projectionInsights && (
        <Card className="bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Projection Impact
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Net Worth in 5 Years</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(projectionInsights.projectedNetWorthIn5Years)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Average Monthly Savings</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(projectionInsights.averageMonthlySavings)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Investment Returns</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(projectionInsights.totalInvestmentReturns)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-yellow-800">
            💡 Tips for Accurate Projections
          </h4>
          
          <ul className="space-y-2 text-yellow-700 text-sm">
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>
                <strong>Before Monthly Expenses:</strong> Use if you want to see savings grow from this starting point (current system adds monthly net savings)
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>
                <strong>After Monthly Expenses:</strong> Use if this is your actual balance after all current month expenses are paid
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>Update your current savings monthly for the most accurate projections</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>Include all liquid assets like bank accounts, fixed deposits, and investments</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>Check your CPF statement regularly to keep the balance current</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-1 h-1 bg-yellow-600 rounded-full mt-2"></span>
              <span>Projections automatically start from {currentMonth?.formatted || 'the current month'}</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default CurrentSavingsUpdater;