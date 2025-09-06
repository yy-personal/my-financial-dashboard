import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../services/formatters/currencyFormatters';
import Card from '../../common/Card';

const UpcomingSpending = () => {
  const {
    financialData,
    getMonthName
  } = useFinancial();

  const navigate = useNavigate();

  const upcomingSpending = financialData.upcomingSpending || [];

  const handleEditClick = () => {
    navigate('/edit');
  };


  const sortedUpcomingSpending = [...upcomingSpending].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return (a.day || 15) - (b.day || 15);
  });

  const formatSpendingDate = (spending) => {
    const day = spending.day || 15;
    return `${getMonthName(spending.month)} ${day}, ${spending.year}`;
  };



  return (
    <Card title="Upcoming Spending" titleColor="bg-purple-600">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-sm">
            Your planned one-time future purchases and their timing.
          </p>
          <button
            onClick={handleEditClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Manage Spending
          </button>
        </div>

        {sortedUpcomingSpending.length > 0 ? (
          <div className="space-y-3">
            {sortedUpcomingSpending.map((spending) => (
              <div
                key={spending.id}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{spending.name}</h4>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="font-medium text-purple-600">
                        {formatCurrency(spending.amount)}
                      </span>
                      <span>{formatSpendingDate(spending)}</span>
                      {spending.description && <span>{spending.description}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="mt-2">No upcoming spending planned</p>
            <p className="text-sm">Click "Manage Spending" above to add planned purchases</p>
          </div>
        )}

        {sortedUpcomingSpending.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
            <div className="text-sm text-blue-700">
              <p>Total upcoming spending: <span className="font-medium">
                {formatCurrency(sortedUpcomingSpending.reduce((total, spending) => total + spending.amount, 0))}
              </span></p>
              <p>Number of planned purchases: <span className="font-medium">{sortedUpcomingSpending.length}</span></p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingSpending;