import React from 'react';
import Card from '../../common/Card';
import { formatCurrency } from '../../../utils/formatters';

/**
 * CPFContributionSummary Component
 * Displays detailed breakdown of CPF contributions including employer contributions
 * 
 * @param {Object} props
 * @param {number} props.employeeContribution - Employee's CPF contribution amount
 * @param {number} props.employerContribution - Employer's CPF contribution amount
 * @param {Object} props.cpfAllocations - Allocation to different CPF accounts
 * @param {number} props.employeeRate - Employee's CPF contribution rate (%)
 * @param {number} props.employerRate - Employer's CPF contribution rate (%)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const CPFContributionSummary = ({
  employeeContribution = 0,
  employerContribution = 0,
  cpfAllocations = { ordinary: 0, special: 0, medisave: 0 },
  employeeRate = 20,
  employerRate = 17,
  className = ''
}) => {
  // Calculate total contribution
  const totalContribution = employeeContribution + employerContribution;
  
  // Calculate percentages for the pie chart
  const employeePercentage = totalContribution > 0 ? 
    (employeeContribution / totalContribution) * 100 : 0;
  const employerPercentage = totalContribution > 0 ? 
    (employerContribution / totalContribution) * 100 : 0;
    
  return (
    <Card className={`cpf-contribution-summary ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-medium">CPF Contribution Breakdown</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="contribution-sources">
          <h4 className="text-md font-medium mb-2">Monthly Contributions</h4>
          
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Your Contribution ({employeeRate}%)</span>
            </div>
            <span className="font-medium">{formatCurrency(employeeContribution)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Employer Contribution ({employerRate}%)</span>
            </div>
            <span className="font-medium">{formatCurrency(employerContribution)}</span>
          </div>
          
          <div className="flex justify-between items-center font-medium pt-1">
            <span>Total CPF Contribution</span>
            <span>{formatCurrency(totalContribution)}</span>
          </div>
        </div>
        
        <div className="account-allocation">
          <h4 className="text-md font-medium mb-2">Account Allocation</h4>
          
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
              <span>Ordinary Account</span>
            </div>
            <span className="font-medium">{formatCurrency(cpfAllocations.ordinary)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span>Special Account</span>
            </div>
            <span className="font-medium">{formatCurrency(cpfAllocations.special)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
              <span>Medisave Account</span>
            </div>
            <span className="font-medium">{formatCurrency(cpfAllocations.medisave)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium mb-2">Key Insights</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Employer contributes an additional {employerRate}% of your salary to your CPF</li>
          <li>• Your employer's contribution is {formatCurrency(employerContribution)} per month</li>
          <li>• Your total CPF contribution is {formatCurrency(totalContribution)} per month</li>
          <li>• This builds your retirement savings without reducing your take-home pay</li>
        </ul>
      </div>
    </Card>
  );
};

export default CPFContributionSummary;