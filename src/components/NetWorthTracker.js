// src/components/NetWorthTracker.js
import React, { useState, useContext, useEffect } from 'react';
import { FinancialContext } from '../context/FinancialContext';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const NetWorthTracker = () => {
    const { financialData, updateFinancialData } = useContext(FinancialContext);
    
    // Create default net worth history if none exists
    const generateDefaultHistory = () => {
        const history = [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Generate 12 months of dummy data
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - 11 + i, 1);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            
            // Start with current values and work backwards with some randomness
            const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
            const currentSavings = financialData.personalInfo.currentSavings;
            const currentCpfBalance = financialData.personalInfo.currentCpfBalance || 0;
            const remainingLoan = 0; // No loans

            // Calculate backwards with some randomness
            const adjustmentFactor = 1 - (0.03 * (11 - i)); // Older months have lower values

            // Additional assets
            const investments = financialData.investments?.reduce((total, investment) => total + investment.value, 0) || 0;
            const investmentsAdjusted = investments * adjustmentFactor * randomFactor;

            // Other assets (property, vehicle, etc)
            const otherAssets = 0; // Default to 0, user will add these

            // Liabilities
            const adjustedLoan = 0; // No loans
            const otherDebts = 0; // Default to 0, user will add these
            
            history.push({
                date: `${month} ${year}`,
                cash: Math.round(currentSavings * adjustmentFactor * randomFactor),
                cpf: Math.round(currentCpfBalance * adjustmentFactor * randomFactor),
                investments: Math.round(investmentsAdjusted),
                otherAssets: Math.round(otherAssets * adjustmentFactor),
                loans: Math.round(adjustedLoan),
                otherDebts: Math.round(otherDebts * adjustmentFactor),
                totalAssets: Math.round((currentSavings + currentCpfBalance + investments + otherAssets) * adjustmentFactor * randomFactor),
                totalLiabilities: Math.round((adjustedLoan + otherDebts)),
                netWorth: Math.round((currentSavings + currentCpfBalance + investments + otherAssets) * adjustmentFactor * randomFactor - (adjustedLoan + otherDebts))
            });
        }
        
        return history;
    };
    
    // Initialize state with existing data or defaults
    const [netWorthData, setNetWorthData] = useState(
        financialData.netWorthHistory || generateDefaultHistory()
    );
    
    // State for new entry form
    const [showForm, setShowForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        cash: financialData.personalInfo.currentSavings,
        cpf: financialData.personalInfo.currentCpfBalance || 0,
        investments: financialData.investments?.reduce((total, investment) => total + investment.value, 0) || 0,
        otherAssets: 0,
        loans: 0, // No loans
        otherDebts: 0
    });
    
    // State for asset and liability categories
    const [assetCategories, setAssetCategories] = useState(
        financialData.assetCategories || [
            { id: 1, name: 'Cash', color: '#0088FE', includeInCalculation: true },
            { id: 2, name: 'CPF', color: '#00C49F', includeInCalculation: true },
            { id: 3, name: 'Investments', color: '#FFBB28', includeInCalculation: true },
            { id: 4, name: 'Other Assets', color: '#FF8042', includeInCalculation: true }
        ]
    );
    
    const [liabilityCategories, setLiabilityCategories] = useState(
        financialData.liabilityCategories || [
            { id: 1, name: 'Loans', color: '#FF0000', includeInCalculation: true },
            { id: 2, name: 'Other Debts', color: '#CC0000', includeInCalculation: true }
        ]
    );
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-SG', {
            style: 'currency',
            currency: 'SGD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Calculate totals for the latest entry
    const calculateNetWorth = (entry) => {
        const totalAssets = (
            parseFloat(entry.cash || 0) +
            parseFloat(entry.cpf || 0) +
            parseFloat(entry.investments || 0) +
            parseFloat(entry.otherAssets || 0)
        );
        
        const totalLiabilities = (
            parseFloat(entry.loans || 0) +
            parseFloat(entry.otherDebts || 0)
        );
        
        return {
            totalAssets,
            totalLiabilities,
            netWorth: totalAssets - totalLiabilities
        };
    };
    
    // Handle input changes for new entry
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setNewEntry(prev => {
            const updatedEntry = {
                ...prev,
                [name]: name === 'date' ? value : parseFloat(value) || 0
            };
            
            // Recalculate derived values
            const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(updatedEntry);
            
            return {
                ...updatedEntry,
                totalAssets,
                totalLiabilities,
                netWorth
            };
        });
    };
    
    // Handle form submission for new entry
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format date for display
        const entryDate = new Date(newEntry.date);
        const formattedDate = `${entryDate.toLocaleString('default', { month: 'short' })} ${entryDate.getFullYear()}`;
        
        // Calculate derived values
        const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(newEntry);
        
        // Create new entry
        const entry = {
            ...newEntry,
            date: formattedDate,
            totalAssets,
            totalLiabilities,
            netWorth
        };
        
        // Check if an entry for this month already exists
        const existingEntryIndex = netWorthData.findIndex(item => item.date === formattedDate);
        
        let updatedHistory;
        if (existingEntryIndex >= 0) {
            // Update existing entry
            updatedHistory = [...netWorthData];
            updatedHistory[existingEntryIndex] = entry;
        } else {
            // Add new entry and sort by date
            updatedHistory = [...netWorthData, entry].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
        }
        
        // Update state
        setNetWorthData(updatedHistory);
        
        // Update in context
        updateFinancialData({
            ...financialData,
            netWorthHistory: updatedHistory
        });
        
        // Reset form and hide it
        setShowForm(false);
    };
    
    // Get the latest entry
    const latestEntry = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1] : null;
    
    // Calculate month-over-month change
    const calculateChange = () => {
        if (netWorthData.length < 2) return { amount: 0, percentage: 0 };
        
        const currentNetWorth = netWorthData[netWorthData.length - 1].netWorth;
        const previousNetWorth = netWorthData[netWorthData.length - 2].netWorth;
        
        const change = currentNetWorth - previousNetWorth;
        const percentage = previousNetWorth !== 0 ? (change / Math.abs(previousNetWorth)) * 100 : 0;
        
        return { amount: change, percentage };
    };
    
    const change = calculateChange();
    
    // Calculate net worth breakdown for pie chart
    const assetBreakdown = latestEntry ? [
        { name: 'Cash', value: latestEntry.cash },
        { name: 'CPF', value: latestEntry.cpf },
        { name: 'Investments', value: latestEntry.investments },
        { name: 'Other Assets', value: latestEntry.otherAssets }
    ] : [];
    
    const liabilityBreakdown = latestEntry ? [
        { name: 'Loans', value: latestEntry.loans },
        { name: 'Other Debts', value: latestEntry.otherDebts }
    ] : [];
    
    // Colors for pie charts
    const ASSET_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const LIABILITY_COLORS = ['#FF0000', '#CC0000'];
    
    // Update context when component mounts
    useEffect(() => {
        if (!financialData.netWorthHistory) {
            updateFinancialData({
                ...financialData,
                netWorthHistory: netWorthData,
                assetCategories,
                liabilityCategories
            });
        }
    }, []);
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Net Worth Tracker
                    </h2>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            showForm ? 'bg-gray-300 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {showForm ? 'Cancel' : 'Update Net Worth'}
                    </button>
                </div>
                
                {/* Net Worth Summary */}
                {latestEntry && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Net Worth</h3>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatCurrency(latestEntry.netWorth)}
                            </p>
                            <div className={`text-sm ${change.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change.amount >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(change.amount))}
                                <span className="ml-1">
                                    ({change.percentage >= 0 ? '+' : ''}{change.percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                As of {latestEntry.date}
                            </p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-800 mb-2">Total Assets</h3>
                            <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(latestEntry.totalAssets)}
                            </p>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="inline-block mr-2">
                                    Cash: {formatCurrency(latestEntry.cash)}
                                </span>
                                <span className="inline-block">
                                    CPF: {formatCurrency(latestEntry.cpf)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="inline-block mr-2">
                                    Investments: {formatCurrency(latestEntry.investments)}
                                </span>
                                <span className="inline-block">
                                    Other: {formatCurrency(latestEntry.otherAssets)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="font-medium text-red-800 mb-2">Total Liabilities</h3>
                            <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(latestEntry.totalLiabilities)}
                            </p>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="inline-block mr-2">
                                    Loans: {formatCurrency(latestEntry.loans)}
                                </span>
                                <span className="inline-block">
                                    Other Debts: {formatCurrency(latestEntry.otherDebts)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span>
                                    Debt-to-Asset Ratio: {(latestEntry.totalLiabilities / latestEntry.totalAssets * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Update Net Worth Form */}
                {showForm && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-3">Update Net Worth</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newEntry.date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Cash
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cash"
                                            value={newEntry.cash}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        CPF
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cpf"
                                            value={newEntry.cpf}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Investments
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="investments"
                                            value={newEntry.investments}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Other Assets
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="otherAssets"
                                            value={newEntry.otherAssets}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Loans
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="loans"
                                            value={newEntry.loans}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Other Debts
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="otherDebts"
                                            value={newEntry.otherDebts}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex flex-wrap justify-between">
                                    <div>
                                        <span className="text-sm text-gray-700">Total Assets:</span>
                                        <span className="text-sm font-medium text-green-700 ml-1">
                                            {formatCurrency(calculateNetWorth(newEntry).totalAssets)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-700">Total Liabilities:</span>
                                        <span className="text-sm font-medium text-red-700 ml-1">
                                            {formatCurrency(calculateNetWorth(newEntry).totalLiabilities)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-700">Net Worth:</span>
                                        <span className="text-sm font-medium text-blue-700 ml-1">
                                            {formatCurrency(calculateNetWorth(newEntry).netWorth)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Net Worth Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={netWorthData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="totalAssets"
                                name="Total Assets"
                                stroke="#21a366"
                                fill="#21a366"
                                fillOpacity={0.3}
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="totalLiabilities"
                                name="Total Liabilities"
                                stroke="#e74c3c"
                                fill="#e74c3c"
                                fillOpacity={0.3}
                                stackId="2"
                            />
                            <Area
                                type="monotone"
                                dataKey="netWorth"
                                name="Net Worth"
                                stroke="#3498db"
                                fill="#3498db"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Asset & Liability Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Asset Breakdown
                    </h2>
                    
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetBreakdown.filter(item => item.value > 0)}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {assetBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Asset Details</h3>
                        <div className="space-y-2">
                            {assetBreakdown.map((asset, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="h-3 w-3 rounded-full mr-2"
                                            style={{ backgroundColor: ASSET_COLORS[index % ASSET_COLORS.length] }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{asset.name}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {formatCurrency(asset.value)}
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Total Assets</span>
                                <span className="text-sm font-medium text-green-700">
                                    {formatCurrency(latestEntry ? latestEntry.totalAssets : 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Liability Breakdown
                    </h2>
                    
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={liabilityBreakdown.filter(item => item.value > 0)}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {liabilityBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={LIABILITY_COLORS[index % LIABILITY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Liability Details</h3>
                        <div className="space-y-2">
                            {liabilityBreakdown.map((liability, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="h-3 w-3 rounded-full mr-2"
                                            style={{ backgroundColor: LIABILITY_COLORS[index % LIABILITY_COLORS.length] }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{liability.name}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {formatCurrency(liability.value)}
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between">
                                <span className="text-sm font-medium text-gray-700">Total Liabilities</span>
                                <span className="text-sm font-medium text-red-700">
                                    {formatCurrency(latestEntry ? latestEntry.totalLiabilities : 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Net Worth History Table */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Net Worth History
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assets
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Liabilities
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Net Worth
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Change
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...netWorthData].reverse().map((entry, index, array) => {
                                // Calculate month-over-month change
                                const previousEntry = index < array.length - 1 ? array[index + 1] : null;
                                const change = previousEntry 
                                    ? entry.netWorth - previousEntry.netWorth 
                                    : 0;
                                const changePercentage = previousEntry && previousEntry.netWorth !== 0
                                    ? (change / Math.abs(previousEntry.netWorth)) * 100
                                    : 0;
                                
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {entry.date}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                                            {formatCurrency(entry.totalAssets)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-700">
                                            {formatCurrency(entry.totalLiabilities)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-700">
                                            {formatCurrency(entry.netWorth)}
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                                            change >= 0 ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {change !== 0 ? (
                                                <>
                                                    {change >= 0 ? '+' : ''}{formatCurrency(change)}
                                                    <span className="text-xs ml-1">
                                                        ({changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                                                    </span>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NetWorthTracker;
