// src/components/RetirementPlanner.js
import React, { useState, useContext, useEffect } from "react";
import { FinancialContext } from "../context/FinancialContext";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    LineChart,
    Line
} from "recharts";

const RetirementPlanner = () => {
    const { financialData, calculateAge } = useContext(FinancialContext);
    
    // Initialize state with default retirement settings
    const [retirementPlan, setRetirementPlan] = useState({
        retirementAge: 65,
        lifeExpectancy: 90,
        desiredMonthlyIncome: 6000,
        inflationRate: 2.5,
        investmentReturnPreRetirement: 7,
        investmentReturnPostRetirement: 4,
        cpfLifePayout: 1500,
        additionalIncomeSource: 0,
        currentSavings: financialData.personalInfo.currentSavings || 0,
        currentAge: calculateAge(),
        currentCpfBalance: financialData.personalInfo.currentCpfBalance || 0,
        monthlySavingsRate: financialData.income.currentSalary * 0.2 || 1000, // Default to 20% of current salary
    });
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-SG", {
            style: "currency",
            currency: "SGD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };
    
    // Handle input changes
    const handleInputChange = (name, value) => {
        setRetirementPlan({
            ...retirementPlan,
            [name]: parseFloat(value) || 0
        });
    };
    
    // Calculate retirement projections
    const calculateRetirementProjection = () => {
        const {
            retirementAge,
            lifeExpectancy,
            desiredMonthlyIncome,
            inflationRate,
            investmentReturnPreRetirement,
            investmentReturnPostRetirement,
            cpfLifePayout,
            additionalIncomeSource,
            currentSavings,
            currentAge,
            currentCpfBalance,
            monthlySavingsRate
        } = retirementPlan;
        
        const yearsToRetirement = retirementAge - currentAge;
        const yearsInRetirement = lifeExpectancy - retirementAge;
        
        // Inflation-adjusted monthly income at retirement
        const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetirement);
        const inflationAdjustedMonthlyIncome = desiredMonthlyIncome * inflationFactor;
        
        // Annual income needed in retirement
        const annualIncomeNeeded = inflationAdjustedMonthlyIncome * 12;
        
        // Projected CPF Life payout with inflation
        const projectedCpfPayout = cpfLifePayout * inflationFactor;
        
        // Additional income source with inflation
        const projectedAdditionalIncome = additionalIncomeSource * inflationFactor;
        
        // Annual retirement withdrawal needed
        const annualWithdrawalNeeded = annualIncomeNeeded - (projectedCpfPayout + projectedAdditionalIncome) * 12;
        
        // Calculate retirement nest egg needed using the 4% rule
        // Adjusted with post-retirement investment return
        const withdrawalRate = investmentReturnPostRetirement / 100;
        const retirementNestEggNeeded = Math.max(0, annualWithdrawalNeeded / withdrawalRate);
        
        // Project savings growth until retirement
        const projection = [];
        let savingsBalance = currentSavings;
        let cpfBalance = currentCpfBalance;
        const annualSavings = monthlySavingsRate * 12;
        const annualReturnRate = investmentReturnPreRetirement / 100;
        
        for (let year = 0; year <= yearsToRetirement + yearsInRetirement; year++) {
            const currentYear = new Date().getFullYear() + year;
            const age = currentAge + year;
            const isRetired = age >= retirementAge;
            
            if (!isRetired) {
                // Pre-retirement: Add savings and investment returns
                savingsBalance = savingsBalance * (1 + annualReturnRate) + annualSavings;
                cpfBalance = cpfBalance * (1.04); // Assuming 4% return on CPF
            } else {
                // Post-retirement: Withdraw from savings
                const yearsSinceRetirement = age - retirementAge;
                const inflationFactorRetirement = Math.pow(1 + inflationRate / 100, yearsSinceRetirement);
                const withdrawalThisYear = annualWithdrawalNeeded * inflationFactorRetirement;
                
                savingsBalance = Math.max(0, savingsBalance * (1 + investmentReturnPostRetirement / 100) - withdrawalThisYear);
                
                // CPF Life continues to pay out, but balance doesn't change after retirement
                // Just keeping it in the model for total net worth tracking
            }
            
            // Total net worth
            const totalNetWorth = savingsBalance + (isRetired ? 0 : cpfBalance);
            
            // Calculate savings ratio compared to target
            const savingsRatio = isRetired ? 
                savingsBalance / retirementNestEggNeeded :
                totalNetWorth / retirementNestEggNeeded;
            
            projection.push({
                year: currentYear,
                age,
                savingsBalance: Math.round(savingsBalance),
                cpfBalance: Math.round(isRetired ? 0 : cpfBalance), // CPF not counted after retirement
                totalNetWorth: Math.round(totalNetWorth),
                targetNeeded: Math.round(retirementNestEggNeeded),
                savingsRatio,
                isRetired,
                annualIncome: isRetired ? 
                    Math.round(annualWithdrawalNeeded + (projectedCpfPayout + projectedAdditionalIncome) * 12) :
                    0,
                monthlyIncome: isRetired ?
                    Math.round((annualWithdrawalNeeded + (projectedCpfPayout + projectedAdditionalIncome) * 12) / 12) :
                    0
            });
        }
        
        return projection;
    };
    
    // Calculate if savings are adequate
    const determineRetirementReadiness = (projection) => {
        const retirementYear = projection.findIndex(year => year.age === retirementPlan.retirementAge);
        
        if (retirementYear === -1) {
            return {
                status: "unknown",
                message: "Could not determine retirement readiness.",
                shortfall: 0,
                retirementYear: null
            };
        }
        
        const retirementData = projection[retirementYear];
        const retirementNestEggNeeded = retirementData.targetNeeded;
        const projectedSavings = retirementData.totalNetWorth;
        const shortfall = retirementNestEggNeeded - projectedSavings;
        const savingsRatio = projectedSavings / retirementNestEggNeeded;
        
        let status;
        let message;
        
        if (savingsRatio >= 1) {
            status = "excellent";
            message = `You're on track for retirement! By age ${retirementPlan.retirementAge}, you're projected to have ${formatCurrency(projectedSavings)}, exceeding your goal by ${formatCurrency(projectedSavings - retirementNestEggNeeded)}.`;
        } else if (savingsRatio >= 0.8) {
            status = "good";
            message = `You're close to your retirement goal. By age ${retirementPlan.retirementAge}, you're projected to have ${formatCurrency(projectedSavings)}, which is ${Math.round(savingsRatio * 100)}% of your target. Consider increasing your savings slightly.`;
        } else if (savingsRatio >= 0.5) {
            status = "caution";
            message = `You're making progress, but may fall short. By age ${retirementPlan.retirementAge}, you're projected to have ${formatCurrency(projectedSavings)}, which is ${Math.round(savingsRatio * 100)}% of your target. Consider increasing your monthly savings.`;
        } else {
            status = "warning";
            message = `You're at risk of falling short of your retirement goal. By age ${retirementPlan.retirementAge}, you're projected to have ${formatCurrency(projectedSavings)}, which is only ${Math.round(savingsRatio * 100)}% of your target. You may need to significantly increase savings or adjust your retirement plan.`;
        }
        
        return {
            status,
            message,
            shortfall: Math.max(0, shortfall),
            retirementYear: retirementData.year,
            savingsRatio,
            projectedSavings
        };
    };
    
    // Calculate monthly savings needed
    const calculateMonthlySavingsNeeded = (projection) => {
        const { retirementAge, currentAge } = retirementPlan;
        const yearsToRetirement = retirementAge - currentAge;
        
        const retirementYear = projection.findIndex(year => year.age === retirementAge);
        if (retirementYear === -1) return 0;
        
        const retirementData = projection[retirementYear];
        const shortfall = Math.max(0, retirementData.targetNeeded - retirementData.totalNetWorth);
        
        if (shortfall <= 0) return 0;
        
        // Basic calculation assuming even monthly contributions and ignoring investment returns
        // For a more accurate calculation, this would need to be an iterative process
        const annualReturnRate = retirementPlan.investmentReturnPreRetirement / 100;
        const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
        
        // Present value of an annuity formula
        // PMT = FV * r / ((1+r)^n - 1)
        const months = yearsToRetirement * 12;
        const additionalSavingsNeeded = shortfall * monthlyReturnRate / 
            (Math.pow(1 + monthlyReturnRate, months) - 1);
            
        return Math.round(additionalSavingsNeeded);
    };
    
    const projectionData = calculateRetirementProjection();
    const retirementReadiness = determineRetirementReadiness(projectionData);
    const additionalMonthlySavingsNeeded = calculateMonthlySavingsNeeded(projectionData);
    
    // Filter projection data for chart to avoid too many data points
    const chartData = projectionData.filter((_, index) => index % 5 === 0 || index === projectionData.length - 1);
    
    // Colors based on readiness status
    const getStatusColor = (status) => {
        switch (status) {
            case "excellent": return "bg-green-100 text-green-800 border-green-200";
            case "good": return "bg-blue-100 text-blue-800 border-blue-200";
            case "caution": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "warning": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Retirement Planner
                </h2>
                
                {/* Quick Summary */}
                <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(retirementReadiness.status)}`}>
                    <h3 className="font-medium text-lg mb-2">Retirement Readiness Summary</h3>
                    <p className="mb-1">{retirementReadiness.message}</p>
                    
                    {retirementReadiness.shortfall > 0 && (
                        <p className="text-sm mt-2">
                            To close the projected shortfall of {formatCurrency(retirementReadiness.shortfall)}, 
                            consider saving an additional {formatCurrency(additionalMonthlySavingsNeeded)} per month 
                            until retirement.
                        </p>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Retirement Settings */}
                    <div>
                        <h3 className="font-medium text-blue-700 border-b pb-2 mb-4">Retirement Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Current Age: {retirementPlan.currentAge}
                                </label>
                                <p className="text-xs text-gray-500">
                                    Auto-calculated from your birthday
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Retirement Age
                                </label>
                                <input
                                    type="range"
                                    min="55"
                                    max="75"
                                    step="1"
                                    value={retirementPlan.retirementAge}
                                    onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>55</span>
                                    <span className="font-medium">{retirementPlan.retirementAge}</span>
                                    <span>75</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Life Expectancy
                                </label>
                                <input
                                    type="range"
                                    min="75"
                                    max="105"
                                    step="1"
                                    value={retirementPlan.lifeExpectancy}
                                    onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>75</span>
                                    <span className="font-medium">{retirementPlan.lifeExpectancy}</span>
                                    <span>105</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Monthly Retirement Income Needed
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={retirementPlan.desiredMonthlyIncome}
                                        onChange={(e) => handleInputChange('desiredMonthlyIncome', e.target.value)}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Today's dollars (will be adjusted for inflation)
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Current Monthly Savings Rate
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={retirementPlan.monthlySavingsRate}
                                        onChange={(e) => handleInputChange('monthlySavingsRate', e.target.value)}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Expected CPF LIFE Monthly Payout
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={retirementPlan.cpfLifePayout}
                                        onChange={(e) => handleInputChange('cpfLifePayout', e.target.value)}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Estimated monthly payout from CPF LIFE
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Additional Monthly Income Source
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={retirementPlan.additionalIncomeSource}
                                        onChange={(e) => handleInputChange('additionalIncomeSource', e.target.value)}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Rental income, part-time work, etc.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Advanced Settings */}
                    <div>
                        <h3 className="font-medium text-blue-700 border-b pb-2 mb-4">Advanced Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Inflation Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={retirementPlan.inflationRate}
                                        onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        step="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Long-term inflation rate (2-3% is typical)
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Pre-Retirement Investment Return (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={retirementPlan.investmentReturnPreRetirement}
                                        onChange={(e) => handleInputChange('investmentReturnPreRetirement', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        step="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Expected annual return before retirement
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Post-Retirement Investment Return (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={retirementPlan.investmentReturnPostRetirement}
                                        onChange={(e) => handleInputChange('investmentReturnPostRetirement', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        step="0.1"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Expected annual return during retirement (typically more conservative)
                                </p>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-2">Retirement Calculator Metrics</h4>
                                
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Years to Retirement:</div>
                                        <div className="text-sm text-gray-700 font-medium">
                                            {retirementPlan.retirementAge - retirementPlan.currentAge} years
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Retirement Duration:</div>
                                        <div className="text-sm text-gray-700 font-medium">
                                            {retirementPlan.lifeExpectancy - retirementPlan.retirementAge} years
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Savings at Retirement:</div>
                                        <div className="text-sm text-gray-700 font-medium">
                                            {formatCurrency(retirementReadiness.projectedSavings)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Target Nest Egg Needed:</div>
                                        <div className={`text-sm font-medium ${
                                            retirementReadiness.shortfall > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {formatCurrency(retirementReadiness.projectedSavings + retirementReadiness.shortfall)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Projected Shortfall:</div>
                                        <div className={`text-sm font-medium ${
                                            retirementReadiness.shortfall > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {retirementReadiness.shortfall > 0 
                                                ? formatCurrency(retirementReadiness.shortfall)
                                                : "No Shortfall"
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-sm text-gray-700">Monthly Income in Retirement:</div>
                                        <div className="text-sm text-gray-700 font-medium">
                                            {formatCurrency(projectionData.find(data => data.age === retirementPlan.retirementAge)?.monthlyIncome || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Projection Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Retirement Savings Projection
                </h2>
                
                <div className="h-96 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <ReferenceLine
                                x={retirementReadiness.retirementYear}
                                stroke="red"
                                label={{ value: "Retirement", position: "top", fill: "red" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="savingsBalance"
                                name="Savings"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="cpfBalance"
                                name="CPF Balance"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="targetNeeded"
                                name="Target Needed"
                                stroke="#ff7300"
                                fill="#ff7300"
                                fillOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Retirement Savings Ratio
                </h3>
                
                <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis 
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                                domain={[0, Math.max(1.5, Math.ceil(Math.max(...chartData.map(d => d.savingsRatio)) * 10) / 10)]}
                            />
                            <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
                            <Legend />
                            <ReferenceLine
                                x={retirementReadiness.retirementYear}
                                stroke="red"
                                label={{ value: "Retirement", position: "top", fill: "red" }}
                            />
                            <ReferenceLine y={1} stroke="green" strokeDasharray="3 3" label={{ value: "100% Funded", position: "right" }} />
                            <Line
                                type="monotone"
                                dataKey="savingsRatio"
                                name="Funding Ratio"
                                stroke="#ff7300"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Retirement Tips Section */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-6">
                    <h3 className="font-medium text-gray-800 mb-3">Retirement Planning Tips</h3>
                    
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Aim to save at least 20% of your income for retirement.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Consider diversifying your investments to balance growth and risk.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>As you approach retirement, shift to more conservative investments to protect your savings.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Consider maximizing your CPF contributions to take advantage of the guaranteed interest rates.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Review your retirement plan annually and adjust as your life circumstances change.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RetirementPlanner;
