import React, { useContext, useState } from "react";
import CpfDashboard from "./CpfDashboard";
import { FinancialContext } from "../context/FinancialContext";
import useFinancialCalculations from "../hooks/useFinancialCalculations";

// Import the modern dashboard components
import FinancialSummary from "./dashboard/FinancialSummary";
import AssetAllocation from "./dashboard/AssetAllocation";
import ExpenseBreakdown from "./dashboard/ExpenseBreakdown";
import MonthlyCashFlow from "./dashboard/MonthlyCashFlow";
import UpcomingEvents from "./dashboard/UpcomingEvents";
import PersonalInfo from "./dashboard/PersonalInfo";
import MilestonesInfo from "./dashboard/MilestonesInfo";
import Recommendations from "./dashboard/Recommendations";
import ProjectionDashboard from "./dashboard/ProjectionDashboard";
import MilestonesDashboard from "./dashboard/MilestonesDashboard";
import { NetWorthChart, SavingsGrowthChart, CashFlowChart } from "./dashboard/charts";

// Add a console log to check if Dashboard.js is loaded
console.log('Dashboard component loaded and rendering');

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	ComposedChart,
	ReferenceLine,
} from "recharts";

const Dashboard = () => {
	const {
		financialData,
		updateFinancialData,
		updateProjectionSettings,
		totalExpenses,
		calculateAge,
		getMonthName,
		formatDate,
	} = useContext(FinancialContext);

	// Use the modern financial calculations hook
	const {
		// Financial metrics
		currentSalary,
		cpfContribution,
		employerCpfContribution,
		takeHomePay,
		monthlyExpenses,
		loanPayment,
		monthlySavings,
		savingsRate,
		totalMonthlyIncome,
		
		// Assets and allocation
		liquidCash,
		cpfSavings,
		totalAssets,
		liquidCashPercentage,
		cpfPercentage,
		assetAllocationData,
		
		// Projection data
		projection,
		chartData,
		loanPaidOffMonth,
		savingsGoalReachedMonth,
		timeToPayLoan,
		timeToSavingsGoal,
		
		// Other formatted data
		expenseData,
		upcomingEvents,
		
		// Settings and update functions
		projectionSettings,
		updateProjectionSettings: updateProjection,
		savingsTimeframe,
		updateSavingsTimeframe,
		
		// Current values for ProjectionDashboard
		currentMonth
	} = useFinancialCalculations();

	const [activeTab, setActiveTab] = useState("summary");

	// State for projection rows to display
	const [rowsToDisplay, setRowsToDisplay] = useState(
		financialData.projectionSettings?.rowsToDisplay || 36
	);

	// Format number as currency
	const formatCurrency = (value) => {
		return new Intl.NumberFormat("en-SG", {
			style: "currency",
			currency: "SGD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	// Format number as percentage
	const formatPercent = (value) => {
		return new Intl.NumberFormat("en-SG", {
			style: "percent",
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		}).format(value);
	};

	// Handle changing the number of rows to display
	const handleRowsToDisplayChange = (e) => {
		const value = parseInt(e.target.value);
		setRowsToDisplay(value);
		updateProjectionSettings({
			rowsToDisplay: value,
		});
	};

	// Legacy calculation for backwards compatibility (simplified version)
	const { projection: legacyProjection, loanPaidOffMonth: legacyLoanPaidOff, savingsGoalReachedMonth: legacySavingsGoal } = React.useMemo(() => {
		// Use the modern projection data if available, otherwise fallback to legacy calculation
		if (projection && projection.length > 0) {
			return {
				projection,
				loanPaidOffMonth,
				savingsGoalReachedMonth
			};
		}

		// Fallback legacy calculation (simplified)
		const legacyProjection = [];
		let currentSavings = financialData?.personalInfo?.currentSavings || 0;
		let loanRemaining = financialData?.personalInfo?.remainingLoan || 0;
		let cpfBalance = financialData?.personalInfo?.currentCpfBalance || 0;

		const currentSalaryLegacy = financialData?.income?.currentSalary || 0;
		const cpfRate = (financialData?.income?.cpfRate || 20) / 100;
		const employerCpfRate = (financialData?.income?.employerCpfRate || 17) / 100;
		const monthlyExpensesLegacy = totalExpenses || 0;
		const loanPaymentLegacy = financialData?.personalInfo?.monthlyRepayment || 0;

		let loanPaidOffIndex = null;
		let savingsGoalIndex = null;

		for (let month = 0; month < 60; month++) {
			const takeHomePayLegacy = currentSalaryLegacy - (currentSalaryLegacy * cpfRate);
			const monthlySavingsLegacy = takeHomePayLegacy - monthlyExpensesLegacy - loanPaymentLegacy;
			
			currentSavings += monthlySavingsLegacy;
			cpfBalance += (currentSalaryLegacy * cpfRate) + (currentSalaryLegacy * employerCpfRate);
			
			if (loanRemaining > 0) {
				loanRemaining = Math.max(0, loanRemaining - loanPaymentLegacy);
				if (loanRemaining === 0 && loanPaidOffIndex === null) {
					loanPaidOffIndex = month;
				}
			}

			if (currentSavings >= 100000 && savingsGoalIndex === null) {
				savingsGoalIndex = month;
			}

			const currentDate = new Date();
			const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 1);
			
			legacyProjection.push({
				month: month + 1,
				date: `${projectionDate.toLocaleString('default', { month: 'short' })} ${projectionDate.getFullYear()}`,
				takeHomePay: takeHomePayLegacy,
				expenses: monthlyExpensesLegacy,
				loanPayment: loanPaymentLegacy,
				loanRemaining: loanRemaining,
				monthlySavings: monthlySavingsLegacy,
				cashSavings: currentSavings,
				cpfBalance: cpfBalance,
				totalNetWorth: currentSavings + cpfBalance - loanRemaining,
			});
		}

		return {
			projection: legacyProjection,
			loanPaidOffMonth: loanPaidOffIndex !== null ? legacyProjection[loanPaidOffIndex] : null,
			savingsGoalReachedMonth: savingsGoalIndex !== null ? legacyProjection[savingsGoalIndex] : null
		};
	}, [projection, loanPaidOffMonth, savingsGoalReachedMonth, financialData, totalExpenses]);

	// Colors for pie chart
	const COLORS = [
		"#0088FE",
		"#00C49F",
		"#FFBB28",
		"#FF8042",
		"#8884d8",
		"#82ca9d",
		"#ffc658",
		"#ff7300",
		"#ff0000",
		"#B10DC9",
		"#FF851B",
		"#85144b",
		"#3D9970",
		"#2ECC40",
		"#01FF70",
	];

	// Extract summary data
	const timeToPayLoanFormatted = legacyLoanPaidOff
		? `${Math.floor(legacyLoanPaidOff.month / 12)} years ${
				legacyLoanPaidOff.month % 12
		  } months`
		: "Not within projection";

	const timeToSavingsGoalFormatted = legacySavingsGoal
		? `${Math.floor(legacySavingsGoal.month / 12)} years ${
				legacySavingsGoal.month % 12
		  } months`
		: "Not within projection";

	// Current monthly income & expenses breakdown
	const currentSalaryDisplay = currentSalary || financialData?.income?.currentSalary || 0;
	const cpfContributionDisplay = cpfContribution || (currentSalaryDisplay * ((financialData?.income?.cpfRate || 20) / 100));
	const employerCpfContributionDisplay = employerCpfContribution || (currentSalaryDisplay * ((financialData?.income?.employerCpfRate || 17) / 100));
	const takeHomePayDisplay = takeHomePay || (currentSalaryDisplay - cpfContributionDisplay);
	const monthlyExpensesDisplay = monthlyExpenses || totalExpenses || 0;
	const loanPaymentDisplay = loanPayment || financialData?.personalInfo?.monthlyRepayment || 0;
	const monthlySavingsDisplay = monthlySavings || (takeHomePayDisplay - monthlyExpensesDisplay - loanPaymentDisplay);
	const savingsRateDisplay = savingsRate || ((monthlySavingsDisplay / takeHomePayDisplay) * 100);
	const totalMonthlyIncomeDisplay = totalMonthlyIncome || (currentSalaryDisplay + employerCpfContributionDisplay);

	// Calculate total yearly bonuses for current year
	const currentYear = new Date().getFullYear();
	const yearlyBonusesThisYear = financialData.yearlyBonuses
		? financialData.yearlyBonuses
				.filter((bonus) => bonus.year === currentYear)
				.reduce((total, bonus) => total + bonus.amount, 0)
		: 0;

	// Filtered data for charts (every 3 months)
	const chartDataDisplay = chartData && chartData.length > 0 ? 
		chartData.filter((item, index) => index % 3 === 0) : 
		legacyProjection.filter((item, index) => index % 3 === 0);

	// Calculate asset allocation percentages
	const liquidCashDisplay = liquidCash || financialData?.personalInfo?.currentSavings || 0;
	const cpfSavingsDisplay = cpfSavings || financialData?.personalInfo?.currentCpfBalance || 0;
	const totalAssetsDisplay = totalAssets || (liquidCashDisplay + cpfSavingsDisplay);

	const liquidCashPercentageDisplay = liquidCashPercentage || (totalAssetsDisplay > 0 ? (liquidCashDisplay / totalAssetsDisplay) * 100 : 0);
	const cpfPercentageDisplay = cpfPercentage || (totalAssetsDisplay > 0 ? (cpfSavingsDisplay / totalAssetsDisplay) * 100 : 0);

	// Asset allocation data for pie chart
	const assetAllocationDataDisplay = assetAllocationData && assetAllocationData.length > 0 ? assetAllocationData : [
		{ name: "Liquid Cash", value: liquidCashDisplay },
		{ name: "CPF (Locked)", value: cpfSavingsDisplay },
	];

	// Expense data for pie chart
	const expenseDataDisplay = expenseData && expenseData.length > 0 ? expenseData : [
		...financialData.expenses.map((expense) => ({
			name: expense.name,
			value: expense.amount,
		})),
		{
			name: "Loan Payment",
			value: financialData.personalInfo.monthlyRepayment,
		},
	];

	// Prepare current values for ProjectionDashboard
	const currentValues = {
		salary: currentSalaryDisplay,
		monthlySavings: monthlySavingsDisplay,
		monthlyExpenses: monthlyExpensesDisplay,
		loanPayment: loanPaymentDisplay,
		liquidCash: liquidCashDisplay,
		cpfBalance: cpfSavingsDisplay,
		loanRemaining: financialData?.personalInfo?.remainingLoan || 0,
		takeHomePay: takeHomePayDisplay
	};

	// Calculate upcoming financial events
	const upcomingEventsDisplay = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents : (() => {
		const events = [];
		const today = new Date();
		const currentMonthNum = today.getMonth() + 1;
		const nextThreeMonths = [
			{ month: currentMonthNum, year: currentYear },
			{
				month: currentMonthNum + 1 > 12 ? currentMonthNum + 1 - 12 : currentMonthNum + 1,
				year: currentMonthNum + 1 > 12 ? currentYear + 1 : currentYear,
			},
			{
				month: currentMonthNum + 2 > 12 ? currentMonthNum + 2 - 12 : currentMonthNum + 2,
				year: currentMonthNum + 2 > 12 ? currentYear + 1 : currentYear,
			},
		];

		// Find salary adjustments in next 3 months
		if (financialData.income.salaryAdjustments) {
			financialData.income.salaryAdjustments.forEach((adjustment) => {
				const isUpcoming = nextThreeMonths.some(
					(period) =>
						period.month === adjustment.month &&
						period.year === adjustment.year
				);

				if (isUpcoming) {
					events.push({
						type: "Salary Adjustment",
						date: `${getMonthName(adjustment.month)} ${adjustment.year}`,
						amount: adjustment.newSalary,
						description: `Salary changes to ${formatCurrency(adjustment.newSalary)}`,
					});
				}
			});
		}

		// Find bonuses in next 3 months
		if (financialData.yearlyBonuses) {
			financialData.yearlyBonuses.forEach((bonus) => {
				const isUpcoming = nextThreeMonths.some(
					(period) =>
						period.month === bonus.month && period.year === bonus.year
				);

				if (isUpcoming) {
					events.push({
						type: "Bonus",
						date: `${getMonthName(bonus.month)} ${bonus.year}`,
						amount: bonus.amount,
						description: bonus.description,
					});
				}
			});
		}

		return events;
	})();

	// Custom card component for consistency
	const Card = ({
		children,
		title,
		className = "",
		titleColor = "bg-blue-600",
	}) => (
		<div
			className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
		>
			{title && (
				<div className={`${titleColor} px-4 py-3`}>
					<h2 className="text-lg font-semibold text-white">
						{title}
					</h2>
				</div>
			)}
			<div className="p-4">{children}</div>
		</div>
	);

	// InfoItem component for consistent display of key-value pairs
	const InfoItem = ({ label, value, highlighted = false }) => (
		<div
			className={`py-2 flex justify-between items-center border-b ${
				highlighted ? "bg-blue-50" : ""
			}`}
		>
			<span className="text-gray-700">{label}</span>
			<span
				className={`font-medium ${highlighted ? "text-blue-700" : ""}`}
			>
				{value}
			</span>
		</div>
	);

	// Status indicator component
	const StatusIndicator = ({
		value,
		threshold1,
		threshold2,
		reverse = false,
	}) => {
		let color = "bg-green-500";

		if (reverse) {
			if (value > threshold1) color = "bg-yellow-500";
			if (value > threshold2) color = "bg-red-500";
		} else {
			if (value < threshold1) color = "bg-yellow-500";
			if (value < threshold2) color = "bg-red-500";
		}

		return (
			<div className="flex items-center">
				<div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
			</div>
		);
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
				<button
					className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
						activeTab === "cpf"
							? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
							: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
					}`}
					onClick={() => setActiveTab("cpf")}
				>
					CPF
				</button>
			</div>

			{/* Summary Tab */}
			{activeTab === "summary" && (
				<div className="space-y-6">
					{/* Financial Snapshot Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Liquid Cash Card */}
						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-500">
										Liquid Cash
									</p>
									<p className="text-2xl font-bold text-green-700">
										{formatCurrency(liquidCashDisplay)}
									</p>
									<p className="text-xs text-gray-500">
										Immediately available
									</p>
								</div>
								<StatusIndicator
									value={liquidCashDisplay}
									threshold1={5000}
									threshold2={2000}
								/>
							</div>
						</div>

						{/* CPF Balance Card */}
						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-500">
										CPF Balance
									</p>
									<p className="text-2xl font-bold text-purple-700">
										{formatCurrency(cpfSavingsDisplay)}
									</p>
									<p className="text-xs text-gray-500">
										Locked until retirement
									</p>
								</div>
							</div>
						</div>

						{/* Remaining Loan Card */}
						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-500">
										Remaining Loan
									</p>
									<p className="text-2xl font-bold text-red-700">
										{formatCurrency(
											financialData.personalInfo
												.remainingLoan
										)}
									</p>
									<p className="text-xs text-gray-500">
										{timeToPayLoanFormatted !==
										"Not within projection"
											? `Paid off in ${timeToPayLoanFormatted}`
											: "Long-term loan"}
									</p>
								</div>
								<StatusIndicator
									value={
										financialData.personalInfo.remainingLoan
									}
									threshold1={20000}
									threshold2={40000}
									reverse={true}
								/>
							</div>
						</div>

						{/* Net Worth Card */}
						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
							<p className="text-sm text-gray-500">
								Total Net Worth
							</p>
							<p className="text-2xl font-bold text-blue-700">
								{formatCurrency(
									liquidCashDisplay +
										cpfSavingsDisplay -
										financialData.personalInfo.remainingLoan
								)}
							</p>
							<p className="text-xs text-gray-500">
								Assets minus liabilities
							</p>
						</div>
					</div>

					{/* Monthly Overview Card */}
					<Card title="Monthly Cash Flow" titleColor="bg-green-600">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<div className="bg-blue-50 p-3 rounded-lg">
								<h3 className="font-medium text-blue-800 mb-2">
									Monthly Income
								</h3>
								<p className="text-2xl font-bold text-blue-700">
									{formatCurrency(takeHomePayDisplay)}
								</p>
								<p className="text-sm text-gray-600">
									Take-home pay after CPF
								</p>
							</div>

							<div className="bg-red-50 p-3 rounded-lg">
								<h3 className="font-medium text-red-800 mb-2">
									Monthly Expenses
								</h3>
								<p className="text-2xl font-bold text-red-700">
									{formatCurrency(
										monthlyExpensesDisplay + loanPaymentDisplay
									)}
								</p>
								<p className="text-sm text-gray-600">
									Including loan payment
								</p>
							</div>

							<div className="bg-green-50 p-3 rounded-lg">
								<h3 className="font-medium text-green-800 mb-2">
									Monthly Savings
								</h3>
								<p className="text-2xl font-bold text-green-700">
									{formatCurrency(monthlySavingsDisplay)}
								</p>
								<p className="text-sm text-gray-600">
									{formatPercent(savingsRateDisplay / 100)} of take-home
									pay
								</p>
							</div>
						</div>

						{/* Cash Flow Progress Bar */}
						<div className="mt-2 mb-6">
							<div className="flex justify-between text-sm mb-1">
								<span className="text-blue-600 font-medium">
									Income
								</span>
								<span className="text-gray-600">
									{formatCurrency(takeHomePayDisplay)}
								</span>
							</div>
							<div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
								<div className="flex h-full">
									<div
										className="bg-red-500 h-full"
										style={{
											width: `${
												(monthlyExpensesDisplay /
													takeHomePayDisplay) *
												100
											}%`,
										}}
										title="Living Expenses"
									></div>
									<div
										className="bg-orange-500 h-full"
										style={{
											width: `${
												(loanPaymentDisplay / takeHomePayDisplay) *
												100
											}%`,
										}}
										title="Loan Payment"
									></div>
									<div
										className="bg-green-500 h-full"
										style={{
											width: `${
												(monthlySavingsDisplay / takeHomePayDisplay) *
												100
											}%`,
										}}
										title="Savings"
									></div>
								</div>
							</div>
							<div className="flex text-xs mt-1 justify-between">
								<span className="text-red-600">
									Expenses: {formatCurrency(monthlyExpensesDisplay)}
								</span>
								<span className="text-orange-600">
									Loan: {formatCurrency(loanPaymentDisplay)}
								</span>
								<span className="text-green-600">
									Savings: {formatCurrency(monthlySavingsDisplay)}
								</span>
							</div>
						</div>
					</Card>

					{/* Liquid vs Locked Assets */}
					<Card title="Asset Allocation" titleColor="bg-purple-600">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<h3 className="font-medium text-gray-800 mb-3">
									Asset Distribution
								</h3>

								<div className="flex justify-between">
									<span className="text-green-700 font-medium">
										Liquid Cash:
									</span>
									<span className="font-medium">
										{formatCurrency(liquidCashDisplay)}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
									<div
										className="bg-green-500 h-2.5 rounded-full"
										style={{
											width: `${liquidCashPercentageDisplay}%`,
										}}
									></div>
								</div>

								<div className="flex justify-between">
									<span className="text-purple-700 font-medium">
										CPF (Locked):
									</span>
									<span className="font-medium">
										{formatCurrency(cpfSavingsDisplay)}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
									<div
										className="bg-purple-500 h-2.5 rounded-full"
										style={{ width: `${cpfPercentageDisplay}%` }}
									></div>
								</div>

								<div className="flex justify-between border-t pt-2">
									<span className="text-blue-700 font-medium">
										Total Assets:
									</span>
									<span className="text-blue-700 font-medium">
										{formatCurrency(totalAssetsDisplay)}
									</span>
								</div>

								<div className="p-3 bg-blue-50 rounded-lg mt-4">
									<p className="text-sm text-blue-800">
										<span className="font-medium">
											Liquidity Ratio:{" "}
										</span>
										{formatPercent(
											liquidCashDisplay / totalAssetsDisplay
										)}
									</p>
									<p className="text-xs text-blue-600 mt-1">
										{liquidCashPercentageDisplay > 30
											? "Good liquidity balance. Consider investing some liquid cash for better returns."
											: liquidCashPercentageDisplay > 15
											? "Healthy liquidity ratio."
											: "Low liquidity. Consider building more accessible cash reserves."}
									</p>
								</div>
							</div>

							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={assetAllocationDataDisplay}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={80}
											label={({ name, percent }) =>
												`${name}: ${(
													percent * 100
												).toFixed(0)}%`
											}
										>
											<Cell fill="#4ade80" />{" "}
											{/* Green for liquid cash */}
											<Cell fill="#a855f7" />{" "}
											{/* Purple for CPF */}
										</Pie>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</Card>

					{/* Upcoming Financial Events */}
					<Card
						title="Upcoming Financial Events"
						titleColor="bg-yellow-600"
					>
						{upcomingEventsDisplay.length > 0 ? (
							<div className="space-y-4">
								{upcomingEventsDisplay.map((event, index) => (
									<div
										key={index}
										className="flex p-3 bg-yellow-50 rounded-lg border border-yellow-200"
									>
										<div className="flex-shrink-0 mr-3">
											<div
												className={`p-2 rounded-full ${
													event.type === "Bonus"
														? "bg-green-100 text-green-600"
														: "bg-blue-100 text-blue-600"
												}`}
											>
												{event.type === "Bonus" ? (
													<svg
														className="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														></path>
													</svg>
												) : (
													<svg
														className="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
														></path>
													</svg>
												)}
											</div>
										</div>
										<div>
											<div className="flex items-center">
												<h4 className="font-medium text-gray-800">
													{event.type}
												</h4>
												<span className="ml-2 text-sm text-gray-600">
													{event.date}
												</span>
											</div>
											<p className="text-sm mt-1">
												{event.type === "Bonus"
													? `${
															event.description
													  }: ${formatCurrency(
															event.amount
													  )}`
													: event.description}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-4 bg-gray-50 rounded-lg text-center">
								<p className="text-gray-600">
									No upcoming financial events in the next 3
									months.
								</p>
							</div>
						)}
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Personal Information */}
						<Card title="Personal Information">
							<div className="space-y-1">
								<InfoItem
									label="Birthday"
									value={`${getMonthName(
										financialData.personalInfo.birthday
											.month
									)} ${
										financialData.personalInfo.birthday.year
									}`}
								/>
								<InfoItem
									label="Current Age"
									value={`${calculateAge()} years old`}
									highlighted={true}
								/>
								<InfoItem
									label="Employment Start"
									value={`${getMonthName(
										financialData.personalInfo
											.employmentStart.month
									)} ${
										financialData.personalInfo
											.employmentStart.year
									}`}
								/>
								<InfoItem
									label="Projection Start"
									value={`${getMonthName(
										financialData.personalInfo
											.projectionStart.month
									)} ${
										financialData.personalInfo
											.projectionStart.year
									}`}
								/>
							</div>
						</Card>

						{/* Key Timeframes */}
						<Card title="Financial Milestones">
							<div className="space-y-1">
								<InfoItem
									label="Time to Pay Off Loan"
									value={timeToPayLoanFormatted}
								/>
								<InfoItem
									label="Expected Loan Payoff Date"
									value={
										legacyLoanPaidOff
											? legacyLoanPaidOff.date
											: "Not within projection"
									}
									highlighted={true}
								/>
								<InfoItem
									label="Time to $100K Savings"
									value={timeToSavingsGoalFormatted}
								/>
								<InfoItem
									label="Expected $100K Date"
									value={
										legacySavingsGoal
											? legacySavingsGoal.date
											: "Not within projection"
									}
									highlighted={true}
								/>
							</div>
						</Card>
					</div>

					{/* Expense Breakdown */}
					<Card title="Monthly Expense Breakdown">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead>
										<tr className="bg-gray-50">
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Category
											</th>
											<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Amount
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{financialData.expenses.map(
											(expense) => (
												<tr
													key={expense.id}
													className="hover:bg-gray-50"
												>
													<td className="px-4 py-3 text-sm text-gray-700">
														{expense.name}
													</td>
													<td className="px-4 py-3 text-sm text-gray-700 text-right">
														{formatCurrency(
															expense.amount
														)}
													</td>
												</tr>
											)
										)}
										<tr className="hover:bg-gray-50">
											<td className="px-4 py-3 text-sm text-gray-700">
												Loan Payment
											</td>
											<td className="px-4 py-3 text-sm text-gray-700 text-right">
												{formatCurrency(
													financialData.personalInfo
														.monthlyRepayment
												)}
											</td>
										</tr>
										<tr className="bg-blue-50">
											<td className="px-4 py-3 text-sm font-medium text-blue-700">
												Total
											</td>
											<td className="px-4 py-3 text-sm font-medium text-blue-700 text-right">
												{formatCurrency(
													totalExpenses +
														financialData
															.personalInfo
															.monthlyRepayment
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div className="h-64 md:h-80">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseDataDisplay}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius="70%"
											fill="#8884d8"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${(
													percent * 100
												).toFixed(0)}%`
											}
										>
											{expenseDataDisplay.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														COLORS[
															index %
																COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</Card>

					{/* Recommendations */}
					<Card title="Financial Recommendations">
						<ul className="space-y-3 text-gray-700">
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Continue with your current loan repayment
									plan of{" "}
									<strong>
										{formatCurrency(
											financialData.personalInfo
												.monthlyRepayment
										)}
									</strong>
									/month to achieve debt freedom by{" "}
									<strong>
										{legacyLoanPaidOff
											? legacyLoanPaidOff.date
											: "the projected date"}
									</strong>
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									After your salary adjustments, consider
									increasing your loan payment to accelerate
									debt repayment
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Once your loan is paid off, redirect that{" "}
									<strong>
										{formatCurrency(
											financialData.personalInfo
												.monthlyRepayment
										)}
									</strong>{" "}
									to boost your savings rate further
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Maintain your current expense level even
									after salary increases to accelerate savings
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Consider diversifying your savings into
									investments once you pass $50,000 in cash
									savings
								</span>
							</li>
						</ul>
					</Card>
				</div>
			)}

			{/* Milestones Tab */}
			{activeTab === "milestones" && (
				<div className="space-y-6">
					<Card title="Key Financial Milestones">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="bg-gray-50">
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Milestone
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Time to Achieve
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Age
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Savings at Milestone
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									<tr className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700 font-medium">
											Student Loan Paid Off
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacyLoanPaidOff
												? legacyLoanPaidOff.date
												: "Not within projection"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{timeToPayLoanFormatted}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacyLoanPaidOff
												? legacyLoanPaidOff.age || "-"
												: "-"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacyLoanPaidOff
												? formatCurrency(
														legacyLoanPaidOff.cashSavings
												  )
												: "-"}
										</td>
									</tr>
									<tr className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700 font-medium">
											$100,000 Savings Achieved
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacySavingsGoal
												? legacySavingsGoal.date
												: "Not within projection"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{timeToSavingsGoalFormatted}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacySavingsGoal
												? legacySavingsGoal.age || "-"
												: "-"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{legacySavingsGoal
												? formatCurrency(
														legacySavingsGoal.cashSavings
												  )
												: "-"}
										</td>
									</tr>

									{/* Yearly Bonuses as Milestones */}
									{financialData.yearlyBonuses &&
										financialData.yearlyBonuses.map(
											(bonus, index) => {
												// Find projection entry for this bonus
												const bonusMonth =
													legacyProjection.find((p) =>
														p.date.includes(
															`${getMonthName(
																bonus.month
															).substring(
																0,
																3
															)} ${bonus.year}`
														)
													);

												if (!bonusMonth) return null;

												return (
													<tr
														key={`bonus-${index}`}
														className="hover:bg-gray-50 bg-green-50"
													>
														<td className="px-4 py-3 text-sm text-gray-700 font-medium">
															{bonus.description}
														</td>
														<td className="px-4 py-3 text-sm text-gray-700">
															{bonusMonth.date}
														</td>
														<td className="px-4 py-3 text-sm text-gray-700">
															{Math.floor(
																bonusMonth.month /
																	12
															)}{" "}
															years{" "}
															{bonusMonth.month %
																12}{" "}
															months
														</td>
														<td className="px-4 py-3 text-sm text-gray-700">
															{bonusMonth.age || "-"}
														</td>
														<td className="px-4 py-3 text-sm text-gray-700">
															{formatCurrency(
																bonus.amount
															)}
														</td>
													</tr>
												);
											}
										)}
								</tbody>
							</table>
						</div>
					</Card>

					{/* Progress cards remain the same */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Progress Towards Loan Payment */}
						<Card title="Progress Towards Loan Payment">
							{legacyLoanPaidOff && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Original Loan:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Remaining:{" "}
											<span className="font-medium text-green-600">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan > 0
														? legacyProjection[0]
																.loanRemaining
														: 0
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														((financialData
															.personalInfo
															.remainingLoan -
															legacyProjection[0]
																.loanRemaining) /
															financialData
																.personalInfo
																.remainingLoan) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-green-800 font-medium">
													Congratulations! You'll be
													debt-free by{" "}
													<span className="font-bold">
														{legacyLoanPaidOff.date}
													</span>{" "}
													at age{" "}
													{legacyLoanPaidOff.age || "unknown"}.
												</p>
												<p className="mt-1 text-green-700">
													Total repayment period:{" "}
													{timeToPayLoanFormatted} from{" "}
													{getMonthName(
														financialData
															.personalInfo
															.projectionStart
															.month
													)}{" "}
													{
														financialData
															.personalInfo
															.projectionStart
															.year
													}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
							{!legacyLoanPaidOff && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Original Loan:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Remaining:{" "}
											<span className="font-medium text-red-600">
												{formatCurrency(
													legacyProjection[
														legacyProjection.length - 1
													].loanRemaining
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														(1 -
															legacyProjection[
																legacyProjection.length -
																	1
															].loanRemaining /
																financialData
																	.personalInfo
																	.remainingLoan) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-blue-800 font-medium">
													You're making progress, but
													your loan won't be fully
													paid within the 5-year
													projection period.
												</p>
												<p className="mt-1 text-blue-700">
													Consider increasing your
													monthly payments to
													accelerate debt payoff.
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</Card>

						{/* Progress Towards Savings Goal */}
						<Card title="Progress Towards $100K Cash Savings">
							{legacySavingsGoal && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Starting Cash:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.currentSavings
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Goal:{" "}
											<span className="font-medium text-green-600">
												{formatCurrency(100000)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.min(
													100,
													(financialData.personalInfo
														.currentSavings /
														100000) *
														100
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-green-800 font-medium">
													Congratulations! You'll
													reach $100,000 in cash
													savings by{" "}
													<span className="font-bold">
														{
															legacySavingsGoal.date
														}
													</span>{" "}
													at age{" "}
													{
														legacySavingsGoal.age || "unknown"
													}
													.
												</p>
												<p className="mt-1 text-green-700">
													Total savings period:{" "}
													{timeToSavingsGoalFormatted} from{" "}
													{getMonthName(
														financialData
															.personalInfo
															.projectionStart
															.month
													)}{" "}
													{
														financialData
															.personalInfo
															.projectionStart
															.year
													}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
							{!legacySavingsGoal && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Starting Cash:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.currentSavings
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Current:{" "}
											<span className="font-medium text-blue-600">
												{formatCurrency(
													legacyProjection[
														legacyProjection.length - 1
													].cashSavings
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														(financialData
															.personalInfo
															.currentSavings /
															100000) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-blue-800 font-medium">
													You're making progress, but
													you won't reach the $100,000
													cash savings goal within the
													5-year projection period.
												</p>
												<p className="mt-1 text-blue-700">
													Consider increasing your
													savings rate after paying
													off your loan to accelerate
													progress.
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</Card>
					</div>
				</div>
			)}

			{/* Charts Tab */}
			{activeTab === "charts" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-6">
						{/* Combined Savings Growth and Loan Repayment Chart */}
						<Card title="Financial Progress Over Time">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<ComposedChart
										data={chartDataDisplay}
										margin={{
											top: 10,
											right: 10,
											left: 0,
											bottom: 20,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											angle={-45}
											textAnchor="end"
											height={60}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											yAxisId="left"
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
											label={{
												value: "Savings",
												angle: -90,
												position: "insideLeft",
												offset: 10,
											}}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
											label={{
												value: "Loan Remaining",
												angle: 90,
												position: "insideRight",
												offset: 10,
											}}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="cashSavings"
											name="Cash Savings"
											stroke="#2FD87B"
											fill="#2FD87B"
											fillOpacity={0.3}
											activeDot={{ r: 6 }}
										/>
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="cpfBalance"
											name="CPF Balance (Locked)"
											stroke="#82ca9d"
											fill="#82ca9d"
											fillOpacity={0.3}
											activeDot={{ r: 6 }}
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="loanRemaining"
											name="Remaining Loan"
											stroke="#ff7300"
											strokeWidth={2}
											dot={{ r: 3 }}
											activeDot={{ r: 6 }}
										/>
										{legacyLoanPaidOff && (
											<ReferenceLine
												yAxisId="right"
												x={legacyLoanPaidOff.date}
												stroke="green"
												strokeDasharray="3 3"
												label={{
													value: "Loan Paid Off",
													position: "top",
													fill: "green",
												}}
											/>
										)}
										{legacySavingsGoal && (
											<ReferenceLine
												yAxisId="left"
												x={legacySavingsGoal.date}
												stroke="blue"
												strokeDasharray="3 3"
												label={{
													value: "$100K Savings",
													position: "top",
													fill: "blue",
												}}
											/>
										)}
									</ComposedChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="bg-blue-50 p-3 rounded-lg">
									<h3 className="font-medium text-blue-800 mb-2">
										Savings Growth
									</h3>
									<p className="text-sm">
										{legacySavingsGoal
											? `You'll reach $100K in cash savings by ${legacySavingsGoal.date}`
											: `Your cash savings will grow to ${formatCurrency(
													legacyProjection[
														legacyProjection.length - 1
													].cashSavings
											  )} in 5 years`}
									</p>
								</div>
								<div className="bg-orange-50 p-3 rounded-lg">
									<h3 className="font-medium text-orange-800 mb-2">
										Loan Repayment
									</h3>
									<p className="text-sm">
										{legacyLoanPaidOff
											? `You'll be debt-free by ${legacyLoanPaidOff.date}`
											: `Your loan will decrease to ${formatCurrency(
													legacyProjection[
														legacyProjection.length - 1
													].loanRemaining
											  )} in 5 years`}
									</p>
								</div>
							</div>
						</Card>

						{/* Monthly Expenses Breakdown */}
						<Card title="Monthly Expense Breakdown">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseDataDisplay}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius="70%"
											fill="#8884d8"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${(
													percent * 100
												).toFixed(0)}%`
											}
										>
											{expenseDataDisplay.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														COLORS[
															index %
																COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend
											layout="vertical"
											align="right"
											verticalAlign="middle"
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</Card>

						{/* Monthly Cash Flow */}
						<Card title="Monthly Cash Flow">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartDataDisplay.slice(0, 6)}
										margin={{
											top: 10,
											right: 10,
											left: 0,
											bottom: 20,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											angle={-45}
											textAnchor="end"
											height={60}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Bar
											dataKey="takeHomePay"
											name="Take-Home Pay"
											fill="#8884d8"
										/>
										<Bar
											dataKey="expenses"
											name="Living Expenses"
											fill="#ff7300"
										/>
										<Bar
											dataKey="loanPayment"
											name="Loan Payment"
											fill="#ff0000"
										/>
										<Bar
											dataKey="monthlySavings"
											name="Cash Savings"
											fill="#82ca9d"
										/>
										<Bar
											dataKey="totalCpfContribution"
											name="CPF Contributions (Locked)"
											fill="#9370DB"
										/>
										<Bar
											dataKey="bonusAmount"
											name="Bonuses"
											fill="#2ECC40"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</Card>
					</div>
				</div>
			)}

			{/* Modern Projection Tab with Settings */}
			{activeTab === "projection" && (
				<ProjectionDashboard
					projectionData={projection || legacyProjection}
					loanPaidOffMonth={loanPaidOffMonth || legacyLoanPaidOff}
					savingsGoalReachedMonth={savingsGoalReachedMonth || legacySavingsGoal}
					currentValues={currentValues}
					projectionSettings={projectionSettings || {
						annualSalaryIncrease: 3.0,
						annualExpenseIncrease: 2.0,
						annualInvestmentReturn: 4.0,
						annualCpfInterestRate: 2.5,
						projectionYears: 30,
						bonusMonths: 2,
						bonusAmount: currentSalaryDisplay
					}}
					savingsTimeframe={savingsTimeframe || 'before'}
					onUpdateSettings={updateProjection || updateProjectionSettings}
					onSavingsTimeframeUpdate={updateSavingsTimeframe}
				/>
			)}

			{/* CPF Calculator Tab */}
			{activeTab === "cpf" && (
				<>
				{console.log('Rendering CPF tab')}
				<CpfDashboard />
				</>
			)}
		</div>
	);
};

export default Dashboard;
