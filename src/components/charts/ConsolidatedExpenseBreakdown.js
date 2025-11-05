import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Card from "../common/Card";

/**
 * ConsolidatedExpenseBreakdown Component
 * Shows combined view of monthly and yearly expenses
 * Displays both absolute amounts and monthly averages
 */
const ConsolidatedExpenseBreakdown = ({
	monthlyExpenses = [],
	yearlyExpenses = [],
	selectedYear = new Date().getFullYear(),
}) => {
	// Calculate monthly and yearly totals
	const monthlyTotal = useMemo(() => {
		return monthlyExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
	}, [monthlyExpenses]);

	const yearlyExpensesForYear = useMemo(() => {
		if (!Array.isArray(yearlyExpenses)) return [];

		return yearlyExpenses.filter((expense) => {
			const startsBeforeOrDuring = expense.startYear <= selectedYear;
			const endsAfterOrDuring = !expense.endYear || expense.endYear >= selectedYear;
			return startsBeforeOrDuring && endsAfterOrDuring;
		});
	}, [yearlyExpenses, selectedYear]);

	const yearlyTotal = useMemo(() => {
		return yearlyExpensesForYear.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
	}, [yearlyExpensesForYear]);

	const yearlyMonthlyAverage = useMemo(() => {
		return yearlyTotal / 12;
	}, [yearlyTotal]);

	const totalMonthlyExpenses = useMemo(() => {
		return monthlyTotal + yearlyMonthlyAverage;
	}, [monthlyTotal, yearlyMonthlyAverage]);

	const annualTotal = useMemo(() => {
		return monthlyTotal * 12 + yearlyTotal;
	}, [monthlyTotal, yearlyTotal]);

	// Prepare data for breakdown
	const expenseCategories = useMemo(() => {
		const categories = {};

		// Add monthly expenses
		monthlyExpenses.forEach((expense) => {
			categories[expense.name] = {
				name: expense.name,
				monthly: parseFloat(expense.amount) || 0,
				yearly: (parseFloat(expense.amount) || 0) * 12,
				type: "Monthly",
			};
		});

		// Add yearly expenses with their monthly averages
		yearlyExpensesForYear.forEach((expense) => {
			const monthlyAvg = (parseFloat(expense.amount) || 0) / 12;
			if (categories[expense.name]) {
				categories[expense.name].yearly += parseFloat(expense.amount) || 0;
				categories[expense.name].monthly += monthlyAvg;
			} else {
				categories[expense.name] = {
					name: expense.name,
					monthly: monthlyAvg,
					yearly: parseFloat(expense.amount) || 0,
					type: "Yearly",
				};
			}
		});

		return Object.values(categories);
	}, [monthlyExpenses, yearlyExpensesForYear]);

	const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#10b981"];

	if (expenseCategories.length === 0) {
		return (
			<Card className="p-6">
				<div className="text-center py-8">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						No expenses
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Add monthly or yearly expenses to see the breakdown here
					</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="p-6">
					<div>
						<p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
						<p className="text-2xl font-bold text-gray-900 mt-2">
							${monthlyTotal.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-xs text-gray-500 mt-1">Recurring monthly</p>
					</div>
				</Card>

				<Card className="p-6">
					<div>
						<p className="text-sm font-medium text-gray-600">Yearly Expenses (Avg/Month)</p>
						<p className="text-2xl font-bold text-amber-600 mt-2">
							${yearlyMonthlyAverage.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-xs text-gray-500 mt-1">${yearlyTotal.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})} total/year</p>
					</div>
				</Card>

				<Card className="p-6">
					<div>
						<p className="text-sm font-medium text-gray-600">Total Monthly Impact</p>
						<p className="text-2xl font-bold text-red-600 mt-2">
							${totalMonthlyExpenses.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-xs text-gray-500 mt-1">Combined average</p>
					</div>
				</Card>

				<Card className="p-6">
					<div>
						<p className="text-sm font-medium text-gray-600">Annual Expenses</p>
						<p className="text-2xl font-bold text-purple-600 mt-2">
							${annualTotal.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-xs text-gray-500 mt-1">12 months total</p>
					</div>
				</Card>
			</div>

			{/* Breakdown Visualization */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Bar Chart */}
				<Card className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Impact</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={expenseCategories}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
							<YAxis />
							<Tooltip
								formatter={(value) =>
									`$${value.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}`
								}
							/>
							<Legend />
							<Bar dataKey="monthly" fill="#3b82f6" name="Monthly Amount" />
						</BarChart>
					</ResponsiveContainer>
				</Card>

				{/* Pie Chart */}
				<Card className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={expenseCategories}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, monthly }) =>
									`${name}: $${monthly.toLocaleString("en-US", {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}`
								}
								outerRadius={80}
								fill="#8884d8"
								dataKey="monthly"
							>
								{expenseCategories.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								formatter={(value) =>
									`$${value.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}`
								}
							/>
						</PieChart>
					</ResponsiveContainer>
				</Card>
			</div>

			{/* Detailed Table */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Expense Details for {selectedYear}
				</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
									Expense Category
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
									Monthly Avg
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
									Annual Total
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
									% of Total
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{expenseCategories.map((category, index) => (
								<tr key={index} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm font-medium text-gray-900">
										{category.name}
									</td>
									<td className="px-4 py-3 text-right text-sm text-gray-900">
										${category.monthly.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									<td className="px-4 py-3 text-right text-sm text-gray-900">
										${category.yearly.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									<td className="px-4 py-3 text-right text-sm text-gray-600">
										{((category.monthly / totalMonthlyExpenses) * 100).toFixed(1)}%
									</td>
								</tr>
							))}
							<tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
								<td className="px-4 py-3 text-sm text-gray-900">
									TOTAL
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									${totalMonthlyExpenses.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									${annualTotal.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									100%
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};

export default ConsolidatedExpenseBreakdown;
