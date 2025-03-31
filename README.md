# Financial Dashboard

A personal financial dashboard that provides projections for loan repayment, savings goals, and visualizes your financial journey.

## Features

- Interactive financial dashboard with summary view
- Visualizations including charts for savings growth, loan repayment, and expense breakdown
- Detailed monthly projections
- Key financial milestones tracking
- Editable financial parameters
- Data persistence using localStorage

## Setup and Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/financial-dashboard.git
cd financial-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

5. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Customization

You can customize all your financial parameters by clicking on "Edit Parameters" in the navigation bar. The dashboard includes:

- Personal information (birthday, employment start, current savings, etc.)
- Income details (current and future salary, CPF rates)
- Monthly expenses (rental, food, transportation, entertainment)
- Loan details (remaining amount, interest rate, monthly repayment)

## Deployment

This project can be easily deployed to GitHub Pages by following these steps:

1. Update the `homepage` field in `package.json` with your GitHub Pages URL:
```json
"homepage": "https://yourusername.github.io/financial-dashboard"
```

2. Deploy using the gh-pages package:
```bash
npm run deploy
```

## Technologies Used

- React.js
- React Router
- Recharts (for data visualization)
- Tailwind CSS (for styling)
- localStorage (for data persistence)

## License

MIT