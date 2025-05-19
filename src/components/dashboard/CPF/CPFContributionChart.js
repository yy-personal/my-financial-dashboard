import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../../common/Card';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

/**
 * CPFContributionChart Component
 * Visualizes CPF contributions from both employee and employer
 * 
 * @param {Object} props
 * @param {number} props.employeeContribution - Employee's CPF contribution amount
 * @param {number} props.employerContribution - Employer's CPF contribution amount
 * @param {number} props.salary - Gross monthly salary
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
const CPFContributionChart = ({
  employeeContribution = 0,
  employerContribution = 0,
  salary = 0,
  className = '',
}) => {
  // Prepare data for the chart
  const totalContribution = employeeContribution + employerContribution;
  const takeHomePay = salary - employeeContribution;
  
  const chartData = [
    { name: 'Take-Home Pay', value: takeHomePay, color: '#4299E1' }, // blue-400
    { name: 'Your CPF Contribution', value: employeeContribution, color: '#48BB78' }, // green-400
    { name: 'Employer CPF Contribution', value: employerContribution, color: '#9F7AEA' }, // purple-400
  ];
  
  // Calculate percentages
  const employeePercentage = salary > 0 ? (employeeContribution / salary) * 100 : 0;
  const employerPercentage = salary > 0 ? (employerContribution / salary) * 100 : 0;
  const takeHomePercentage = salary > 0 ? (takeHomePay / salary) * 100 : 0;
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-sm">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.value)}</p>
          <p>{formatPercentage(data.value / salary * 100)} of salary</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={`cpf-contribution-chart ${className}`}>
      <div className="card-header mb-4">
        <h3 className="text-lg font-medium">CPF Contribution Distribution</h3>
        <p className="text-sm text-gray-600">Breakdown of your salary including employer CPF</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-details">
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2">Monthly Salary Distribution</h4>
            <div className="text-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                  <span>Take-Home Pay</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(takeHomePay)}</div>
                  <div className="text-gray-500 text-xs">{formatPercentage(takeHomePercentage)} of salary</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                  <span>Your CPF Contribution</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(employeeContribution)}</div>
                  <div className="text-gray-500 text-xs">{formatPercentage(employeePercentage)} of salary</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
                  <span>Employer CPF Contribution</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(employerContribution)}</div>
                  <div className="text-gray-500 text-xs">{formatPercentage(employerPercentage)} of salary</div>
                </div>
              </div>
              
              <div className="pt-2 mt-2 border-t border-gray-200 font-medium flex justify-between">
                <span>Total Compensation</span>
                <span>{formatCurrency(salary + employerContribution)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800 mb-1">Did you know?</div>
            Your employer's CPF contribution of {formatCurrency(employerContribution)} per month 
            is additional compensation that doesn't reduce your take-home pay.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CPFContributionChart;