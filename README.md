# Financial Dashboard

A personal financial dashboard that provides projections for loan repayment, savings goals, and visualizes your financial journey with a clear distinction between liquid assets and restricted funds like CPF.

## Live Demo

View the live demo: [https://yy-personal.github.io/my-financial-dashboard](https://yy-personal.github.io/my-financial-dashboard)

## Features

- **Interactive financial dashboard with summary view**
  - Visual breakdowns of assets, savings, and expenses
  - Monthly cash flow analysis
  - Financial health indicators
  
- **Liquidity Dashboard** (New)
  - Clear separation between accessible assets and CPF funds
  - Liquid Net Worth tracking (assets you can actually use)
  - Liquidity Ratio analysis
  - 12-month projection of available vs. restricted funds
  - Personalized recommendations for improving your liquidity position

- **Net Worth Tracker**
  - Track both total net worth and liquid net worth over time
  - Asset allocation visualization
  - Customizable update mechanism for recording financial milestones

- **Goal Tracker**
  - Create and track financial goals with progress visualization
  - Customizable goal categories (savings, debt repayment, investments)
  - Priority-based display
  
- **Retirement Planner**
  - Sophisticated retirement calculator with multiple parameters
  - CPF LIFE integration
  - Funding ratio visualization
  - Customizable retirement scenarios
  
- **Monthly Projections**
  - Detailed month-by-month financial forecasting
  - Loan repayment schedule
  - Savings growth projection
  - CPF accumulation tracking
  
- **Key Financial Insights**
  - Milestone tracking (loan payoff, savings targets)
  - Personalized financial recommendations
  - Asset and expense breakdowns
  
- **Additional Features**
  - Automatic age calculation based on birthday
  - Editable financial parameters
  - Data persistence using localStorage
  - Optional Firebase integration for cross-device syncing
  - Responsive design for mobile and desktop

## Local Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yy-personal/my-financial-dashboard.git
cd my-financial-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and visit [http://localhost:3000](http://localhost:3000)

### Project Structure

```
my-financial-dashboard/
├── public/               # Static files
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.js          # Main dashboard component
│   │   ├── EditParameters.js     # Form for editing parameters
│   │   ├── GoalTracker.js        # Goal tracking component
│   │   ├── RetirementPlanner.js  # Retirement planning component
│   │   ├── NetWorthTracker.js    # Net worth tracking component
│   │   ├── LiquidityDashboard.js # Liquid vs restricted assets dashboard
│   │   ├── Login.js              # Authentication component
│   │   └── SyncStatusIndicator.js# Syncing status component
│   ├── context/
│   │   ├── FinancialContext.js   # React context for financial data
│   │   └── AuthContext.js        # React context for authentication
│   ├── firebase/
│   │   └── firebase.js           # Firebase configuration and utilities
│   ├── App.js            # Main application component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles including Tailwind imports
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration for Tailwind
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Deployment to GitHub Pages

### Automatic Deployment

The easiest way to deploy updates is to use the deployment script:

1. Make your changes locally and commit them
2. Push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

3. Run the deployment script:
```bash
npm run deploy
```

4. Your changes will be live at [https://yy-personal.github.io/my-financial-dashboard](https://yy-personal.github.io/my-financial-dashboard) within a few minutes

### Manual Setup (If Starting From Scratch)

If you're setting up GitHub Pages for the first time:

1. Ensure your `package.json` has the correct homepage URL:
```json
"homepage": "https://yy-personal.github.io/my-financial-dashboard"
```

2. Make sure you have the gh-pages package installed:
```bash
npm install --save-dev gh-pages
```

3. Add these scripts to your `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build",
  // other existing scripts...
}
```

4. Deploy for the first time:
```bash
npm run deploy
```

5. Go to your GitHub repository settings, navigate to Pages, and ensure it's set to deploy from the gh-pages branch

## Customization

You can customize all your financial parameters by clicking on "Edit Parameters" in the navigation bar. The dashboard includes:

- Personal information (birthday, employment start, current savings, etc.)
- Income details (current and future salary, CPF rates)
- Monthly expenses (fully customizable categories)
- Loan details (remaining amount, interest rate, monthly repayment)

All changes are automatically saved to your browser's localStorage. If you enable Firebase authentication, your data can be synced across devices.

## Cross-Device Synchronization

The dashboard supports optional cross-device synchronization using Firebase:

1. Log in using the authentication feature
2. Your financial data will be automatically synced across all your devices
3. A sync status indicator shows when your data was last synced
4. You can manually sync your data using the "Sync Now" button if needed

## Understanding CPF vs. Liquid Assets

With the addition of the Liquidity Dashboard, you can now clearly distinguish between:

- **Liquid Assets**: Money you can immediately access and use (cash savings)
- **Restricted Assets**: Money in CPF accounts that has limitations on usage
- **Liquid Net Worth**: Your accessible assets minus debts (without CPF)
- **Total Net Worth**: All assets (including CPF) minus debts

This separation helps you make more realistic financial plans based on what funds are actually available to you.

## Working with Tailwind CSS

If you make changes to the Tailwind configuration or encounter CSS issues:

1. Make sure you have the proper configuration files:
   - `tailwind.config.js` in the root directory
   - `postcss.config.js` in the root directory
   - Tailwind directives (`@tailwind`) in your `src/index.css`

2. If you encounter build issues related to Tailwind, try:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Restart your development server

## Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check browser console for errors
   - Verify that the homepage URL in package.json matches your GitHub Pages URL
   - Make sure the BrowserRouter has the correct basename (`basename={process.env.PUBLIC_URL}`)

2. **Styling issues**
   - Ensure Tailwind CSS is properly configured with PostCSS
   - Check that the build process is completing successfully

3. **Data persistence issues**
   - Check localStorage in browser DevTools
   - Clear localStorage if data gets corrupted: `localStorage.removeItem('financialData')`
   - For Firebase syncing issues, check Authentication status in the footer

4. **Syncing issues**
   - Ensure you're logged in (check the footer for login status)
   - Try manual sync using the "Sync Now" button
   - Check console for any Firebase-related errors

### Getting Help

If you encounter issues not covered here, please [open an issue](https://github.com/yy-personal/my-financial-dashboard/issues) on the GitHub repository.

## Technologies Used

- React.js - UI framework
- React Router - Navigation
- Recharts - Data visualization
- Tailwind CSS - Styling
- Firebase - Authentication and data storage (optional)
- localStorage - Local data persistence

## License

MIT
