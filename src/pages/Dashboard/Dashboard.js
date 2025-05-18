import React, { useState } from "react";
import useFinancialCalculations from "../../hooks/useFinancialCalculations";
import { useFinancial } from "../../context/FinancialContext";
import FinancialSummary from "../../components/dashboard/FinancialSummary";
import AssetAllocation from "../../components/dashboard/AssetAllocation";
import UpcomingEvents from "../../components/dashboard/UpcomingEvents";
import PersonalInfo from "../../components/dashboard/PersonalInfo";
import MilestonesInfo from "../../components/dashboard/MilestonesInfo";
import Recommendations from "../../components/dashboard/Recommendations";

/**
 * Dashboard page component
 * 
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { financialData, calculateAge } = useFinancial();
  
  // Use our custom hook to get all financial calculations
  const {
    timeToPayLoan,
    projection,
    chartData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToSavingsGoal,
    currentSalary,
    cpfContribution,
    employerCpfContribution,
    takeHomePay,
    monthlyExpenses,
    loanPayment,
    monthlySavings,
    savingsRate,
    totalMonthlyIncome,
    liquidCash,
    cpfSavings,
    totalAssets,
    liquidCashPercentage,
    cpfPercentage,
    assetAllocationData,
    expenseData,
    upcomingEvents
  } = useFinancialCalculations();

  // Calculate current age
  const currentAge = calculateAge();

  // Summary data object to pass to components
  const summaryData = {
    liquidCash,
    cpfSavings,
    remainingLoan: projection[0]?.loanRemaining || 0,
    totalNetWorth: liquidCash + cpfSavings - (projection[0]?.loanRemaining || 0),
    takeHomePay,
    monthlyExpenses,
    loanPayment,
    monthlySavings,
    savingsRate,
    totalCpfContribution: cpfContribution + employerCpfContribution
  };

  return (
    <div className="bg-gray-50 rounded-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-lg mb-6 shadow-md">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          PERSONAL FINANCIAL DASHBOARD
        </h1>
      </div>

      {/* Mobile-friendly Navigation Tabs */}
      <div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "summary"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "milestones"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("milestones")}
        >
          Milestones
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "charts"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === "projection"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("projection")}
        >
          Projection
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <FinancialSummary 
            summaryData={summaryData} 
            timeToPayLoan={timeToPayLoan} 
          />
          
          <AssetAllocation 
            assetAllocationData={assetAllocationData}
            liquidCash={liquidCash}
            cpfSavings={cpfSavings}
            totalAssets={totalAssets}
            liquidCashPercentage={liquidCashPercentage}
            cpfPercentage={cpfPercentage}
          />
          
          <UpcomingEvents events={upcomingEvents} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonalInfo 
              personalInfo={financialData.personalInfo}
              currentAge={currentAge}
            />
            
            <MilestonesInfo 
              timeToPayLoan={timeToPayLoan}
              loanPaidOffMonth={loanPaidOffMonth}
              timeToSavingsGoal={timeToSavingsGoal}
              savingsGoalReachedMonth={savingsGoalReachedMonth}
            />
          </div>
          
          <Recommendations 
            monthlyRepayment={financialData.personalInfo.monthlyRepayment}
            loanPaidOffMonth={loanPaidOffMonth}
          />
        </div>
      )}

      {/* Other tabs would be implemented as separate components */}
      {activeTab === "milestones" && (
        <div className="p-4 bg-white rounded-lg shadow">
          <p>Milestones content will be implemented as a separate component.</p>
        </div>
      )}
      
      {activeTab === "charts" && (
        <div className="p-4 bg-white rounded-lg shadow">
          <p>Charts content will be implemented as a separate component.</p>
        </div>
      )}
      
      {activeTab === "projection" && (
        <div className="p-4 bg-white rounded-lg shadow">
          <p>Projection content will be implemented as a separate component.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
