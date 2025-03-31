# Financial Dashboard

A personal financial dashboard that provides projections for loan repayment, savings goals, and visualizes your financial journey.

## Live Demo

View the live demo: [https://yy-personal.github.io/my-financial-dashboard](https://yy-personal.github.io/my-financial-dashboard)

## Features

- Interactive financial dashboard with summary view
- Visualizations including charts for savings growth, loan repayment, and expense breakdown
- Detailed monthly projections
- Key financial milestones tracking
- Customizable expense categories (add, edit, remove)
- Automatic age calculation based on birthday
- Editable financial parameters
- Data persistence using localStorage

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
│   │   ├── Dashboard.js  # Main dashboard component
│   │   └── EditParameters.js  # Form for editing parameters
│   ├── context/
│   │   └── FinancialContext.js  # React context for financial data
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

All changes are automatically saved to your browser's localStorage.

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

### Getting Help

If you encounter issues not covered here, please [open an issue](https://github.com/yy-personal/my-financial-dashboard/issues) on the GitHub repository.

## Technologies Used

- React.js - UI framework
- React Router - Navigation
- Recharts - Data visualization
- Tailwind CSS - Styling
- localStorage - Data persistence

## License

MIT