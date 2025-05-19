import React, { useState } from "react";
import useFinancialCalculations from "../../hooks/useFinancialCalculations";
import { useFinancial } from "../../context/FinancialContext";

// Common components
import Card from "../../components/common/Card";
import InfoItem from "../../components/common/InfoItem";
import StatusIndicator from "../../components/common/StatusIndicator";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// Dashboard components
import FinancialSummary from "../../components/dashboard/FinancialSummary";
import AssetAllocation from "../../components/dashboard/AssetAllocation";
import ExpenseBreakdown from "../../components/dashboard/ExpenseBreakdown";
import MonthlyCashFlow from "../../components/dashboard/MonthlyCashFlow";
import UpcomingEvents from "../../components/dashboard/UpcomingEvents";
import PersonalInfo from "../../components/dashboard/PersonalInfo";
import MilestonesInfo from "../../components/dashboard/MilestonesInfo";
import Recommendations from "../../components/dashboard/Recommendations";
import MilestonesDashboard from "../../components/dashboard/MilestonesDashboard";
import ProjectionDashboard from "../../components/dashboard/ProjectionDashboard";

// Chart components
import { 
  NetWorthChart, 
  SavingsGrowthChart, 
  CashFlowChart 
} from "../../components/dashboard/charts";

/**
 * Dashboard page component
 * 
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { financialData, calculateAge, syncStatus, updateProjectionSettings } = useFinancial();
  
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
    upcomingEvents,
    projectionSettings
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

  // Current values for projection
  const currentValues = {
    salary: currentSalary,
    monthlySavings,
    monthlyExpenses,
    loanPayment,
    liquidCash,
    cpfBalance: cpfSavings,
    loanRemaining: projection[0]?.loanRemaining || 0
  };

  // Handle projection setting updates
  const handleUpdateProjectionSettings = (newSettings) => {
    updateProjectionSettings(newSettings);
  };

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV !== 'production'}>
      <div className="bg-gray-50 rounded-lg max-w-6xl mx-auto">
        {/* Header with Status */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-lg mb-6 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              PERSONAL FINANCIAL DASHBOARD
            </h1>
            <StatusIndicator status={syncStatus} />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <InfoItem label="Last Updated" value="Today" />
          </div>
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
              activeTab === "insights"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("insights")}
          >
            Insights
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssetAllocation 
                assetAllocationData={assetAllocationData}
                liquidCash={liquidCash}
                cpfSavings={cpfSavings}
                totalAssets={totalAssets}
                liquidCashPercentage={liquidCashPercentage}
                cpfPercentage={cpfPercentage}
              />
              
              <ExpenseBreakdown 
                expenseData={expenseData}
                totalExpenses={monthlyExpenses}
                loanPayment={loanPayment}
              />
            </div>
            
            <MonthlyCashFlow
              takeHomePay={takeHomePay}
              totalExpenses={monthlyExpenses}
              loanPayment={loanPayment}
              monthlySavings={monthlySavings}
              cpfContribution={cpfContribution}
              employerCpfContribution={employerCpfContribution}
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
              savingsRate={savingsRate}
            />
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <ErrorBoundary>
            <div className="space-y-6">
              <Card title="Financial Insights" titleColor="bg-purple-600">
                <p className="mb-4">Insights content will be implemented as separate components.</p>
                <ExpenseBreakdown 
                  expenseData={expenseData}
                  totalExpenses={monthlyExpenses}
                  loanPayment={loanPayment}
                />
              </Card>
              
              <Recommendations 
                monthlyRepayment={financialData.personalInfo.monthlyRepayment}
                loanPaidOffMonth={loanPaidOffMonth}
                savingsRate={savingsRate}
              />
            </div>
          </ErrorBoundary>
        )}
        
        {/* Charts Tab */}
        {activeTab === "charts" && (
          <ErrorBoundary>
            <div className="space-y-6">
              <NetWorthChart 
                chartData={chartData}
                loanPaidOffMonth={loanPaidOffMonth}
                savingsGoalReachedMonth={savingsGoalReachedMonth}
              />
              
              <SavingsGrowthChart 
                chartData={chartData}
                savingsGoalReachedMonth={savingsGoalReachedMonth}
              />
              
              <CashFlowChart 
                chartData={projection}
              />
            </div>
          </ErrorBoundary>
        )}
        
        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <ErrorBoundary>
            <MilestonesDashboard 
              milestones={[]}
              loanPaidOffMonth={loanPaidOffMonth}
              savingsGoalReachedMonth={savingsGoalReachedMonth}
              timeToPayLoan={timeToPayLoan}
              timeToSavingsGoal={timeToSavingsGoal}
              currentLiquidCash={liquidCash}
              savingsGoal={100000}
              currentLoanBalance={projection[0]?.loanRemaining || 0}
              retirementAge={65}
              currentAge={currentAge}
              retirementSavingsGoal={1000000}
              currentRetirementSavings={cpfSavings}
            />
          </ErrorBoundary>
        )}
        
        {/* Projection Tab */}
        {activeTab === "projection" && (
          <ErrorBoundary>
            <ProjectionDashboard 
              projectionData={projection}
              loanPaidOffMonth={loanPaidOffMonth}
              savingsGoalReachedMonth={savingsGoalReachedMonth}
              currentValues={currentValues}
              projectionSettings={projectionSettings}
              onUpdateSettings={handleUpdateProjectionSettings}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;