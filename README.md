# Financial Dashboard

A comprehensive React application for personal financial planning with Singapore-specific CPF calculations, optimized performance, and advanced projection capabilities.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Performance](#performance)
- [Contributing](#contributing)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Features

### Financial Planning
- **CPF Integration**: Age-accurate Singapore CPF calculations with automatic rate adjustments based on age brackets (55, 60, 65, 70)
- **Financial Projections**: Multi-year projections with aging-based CPF rate calculations and yearly expense integration
- **Expense Tracking**: Monthly and yearly expenses with recurring/one-time support and start/end dates
- **Investment Tracking**: Portfolio allocation with Modern Portfolio Theory metrics
- **Tax Calculations**: Singapore personal income tax with YA 2025 rates and reliefs
- **Inflation Analysis**: Real vs nominal return calculations using Fisher equation

### Visualization
- **Interactive Charts**: Net worth growth, savings projections, and cash flow analysis
- **Expense Analysis**: Categorized monthly expense breakdown with yearly expense visualization
- **Consolidated View**: Combined monthly and yearly expense analysis by year
- **Asset Allocation**: Visual breakdown of investment portfolio
- **Milestone Timeline**: Track financial goals and achievements

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Firebase Integration**: Cloud sync for authenticated users with localStorage fallback
- **Real-time Updates**: Dynamic projections that update based on user input
- **Error Handling**: Comprehensive error boundaries with graceful recovery

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **Charts**: Recharts for data visualization
- **Backend**: Firebase (Authentication & Firestore)
- **Routing**: React Router
- **Testing**: Jest & React Testing Library
- **Performance**: React.memo, useCallback, useMemo optimizations

## Documentation

| Document | Description |
|----------|-------------|
| [**Architecture**](docs/ARCHITECTURE.md) | Component architecture, data flow, and design patterns |
| [**Calculations**](CALCULATIONS.md) | Complete financial calculation API reference |
| [**Performance**](PERFORMANCE.md) | Performance optimizations and best practices |
| [**Hooks**](docs/HOOKS.md) | Custom React hooks documentation |

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/my-financial-dashboard.git
cd my-financial-dashboard

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Firebase Configuration (Optional)

For cloud sync features, create a `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Development

### Available Scripts

```bash
npm start                 # Start development server
npm test                  # Run tests in interactive mode
npm test -- --coverage    # Run tests with coverage report
npm run build             # Build for production
npm run deploy            # Deploy to GitHub Pages
```

### Code Quality

```bash
# ESLint checks run automatically during build
npm run build             # Will fail on ESLint errors

# Run specific test suites
npm test -- --testPathPattern="calculations"
npm test -- --testPathPattern="useProjection"
```

### Development Best Practices

1. **Component Optimization**: Use React.memo for expensive components (charts, tables)
2. **Hook Memoization**: Wrap functions in useCallback when passing to memoized components
3. **Calculation Caching**: Use useMemo for expensive financial calculations
4. **Dependency Arrays**: Only include values that should trigger re-computation

## Testing

### Test Coverage

- **96 passing tests** across all modules
- **Calculation Tests**: 52 tests for investment, age, and CPF calculations
- **Component Tests**: React Testing Library for UI components
- **Hook Tests**: Custom hook functionality and edge cases

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test -- useProjection.test.js

# With coverage
npm test -- --coverage

# Calculation tests only
npm test -- --testPathPattern="calculations"
```

## Deployment

### GitHub Pages Deployment

Automatic deployment configured via GitHub Actions:

1. Update `package.json` homepage field:
   ```json
   {
     "homepage": "https://yourusername.github.io/my-financial-dashboard"
   }
   ```

2. Push to master branch:
   ```bash
   git add .
   git commit -m "Deploy updates"
   git push origin master
   ```

3. GitHub Actions will automatically build and deploy

### Manual Deployment

```bash
npm run deploy  # Builds and deploys to gh-pages branch
```

## Project Structure

```
my-financial-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components (Card, InfoItem, etc.)
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── charts/          # Chart components (NetWorthChart, YearlyExpenseBreakdown, etc.)
│   ├── context/             # React Context providers
│   │   └── FinancialContext.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useProjection.js
│   │   ├── useFinancialCalculations.js
│   │   └── useMilestones.js
│   ├── services/
│   │   └── calculations/    # Financial calculation modules
│   │       ├── cpf/         # CPF utilities and allocation
│   │       ├── taxCalculations.js
│   │       ├── investmentCalculations.js
│   │       └── inflationCalculations.js
│   ├── utils/               # Helper utilities
│   │   ├── calculations/    # Age calculator and other utilities
│   │   └── errors/          # Error handling utilities
│   └── App.js               # Main application component
├── docs/                    # Documentation
├── public/                  # Static assets
└── package.json
```

### Key Files

| Path | Description |
|------|-------------|
| `src/context/FinancialContext.js` | Central state management with Firebase sync and yearly expenses |
| `src/hooks/useProjection.js` | Core financial projection engine with yearly expense integration |
| `src/services/calculations/` | 8+ financial calculation modules |
| `src/components/dashboard/` | Main dashboard components |
| `src/components/EditParameters.js` | Settings form with yearly expenses management |
| `src/components/charts/YearlyExpenseBreakdown.js` | Yearly expenses visualization component |
| `src/components/charts/ConsolidatedExpenseBreakdown.js` | Monthly + yearly expense analysis |

## Performance

### Optimization Results

- **22% faster** projection calculations (30-year projections)
- **46% faster** re-calculations on data updates
- **60-80% reduction** in component re-renders
- **98% faster** cached calculations (memoization)

### Key Optimizations

1. **React.memo** on expensive chart components
2. **useCallback** for all FinancialContext functions
3. **useMemo** for complex calculations and insights
4. **Memoization cache** for investment calculations
5. **Pre-calculated multipliers** in projection loops
6. **Arithmetic optimizations** replacing Date object creation

For detailed performance documentation, see [PERFORMANCE.md](PERFORMANCE.md).

## Financial Calculations

### Singapore-Specific Features

- **CPF Calculations**: Official 2025 rates with age-based transitions
- **Tax Calculations**: IRAS YA 2025 progressive tax brackets
- **Inflation Data**: Singapore Department of Statistics rates
- **Investment Returns**: Historical Singapore market data (STI, SGS)

### Calculation Modules

| Module | Functions | Description |
|--------|-----------|-------------|
| **CPF** | 11 functions | Contribution rates, account allocation, tiered interest |
| **Tax** | 8 functions | Income tax, reliefs, monthly estimation |
| **Investment** | 12 functions | Portfolio metrics, compound growth, retirement planning |
| **Inflation** | 11 functions | Real returns, purchasing power, inflation adjustment |

For complete API documentation, see [CALCULATIONS.md](CALCULATIONS.md).

## Custom Hooks

### Core Hooks

- **useProjection**: Financial projection engine with aging-based CPF rates
- **useFinancialCalculations**: Centralized calculations with age-based CPF integration
- **useMilestones**: Financial goal tracking and timeline visualization
- **useErrorHandler**: Comprehensive error handling and recovery

For detailed hook documentation, see [docs/HOOKS.md](docs/HOOKS.md).

## Yearly Expenses

### Overview

The dashboard includes comprehensive support for tracking yearly (annual) expenses alongside monthly expenses. This allows for better financial planning by accounting for irregular expenses like insurance, taxes, and maintenance.

### Features

- **Recurring Expenses**: Track expenses that occur every year (no end date)
- **One-Time Expenses**: Define expenses with specific start and end years
- **Flexible Dates**: Set the month when expense occurs and years it applies
- **Visualization**: Dedicated breakdown views and consolidated analysis
- **Integration**: Automatically deducted in financial projections during applicable months

### Management

Yearly expenses are managed in the **Edit Parameters** form under the "Yearly Expenses" section:

1. **Add New Expense**: Name, annual amount, month, start year, and optional end year
2. **Edit Existing**: Change any field including amount, date, or type (recurring/one-time)
3. **Remove**: Delete expenses no longer needed
4. **View Total**: Automatic calculation of total yearly expense amount

### Dashboard Visualization

Two complementary views on the Summary tab:

1. **Yearly Expense Breakdown**:
   - Pie chart showing expense distribution
   - Summary cards with total, average monthly impact, and count
   - Detailed table with all expenses for selected year
   - Year selector for multi-year analysis

2. **Consolidated Expense Breakdown**:
   - Combined view of monthly and yearly expenses
   - Bar chart showing total monthly impact
   - Expense distribution across all categories
   - Monthly average calculations

## Architecture

### Data Flow

```
Firebase/LocalStorage → FinancialContext → Custom Hooks → Components
```

### State Management

- **Global State**: React Context API with memoized values
- **Local State**: Component-specific UI state
- **Derived State**: Custom hooks for complex calculations

### Design Patterns

- Custom Hook Pattern for business logic separation
- Context Provider for global state
- Container/Presenter for data/UI separation
- Error Boundary for graceful error handling

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow existing code style and patterns
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Build successfully: `npm run build`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Style

- Functional components with hooks
- Component composition for reusability
- Clear separation of concerns
- Comprehensive error handling
- Thorough testing

## Accuracy & Sources

All calculations verified against official Singapore sources:

- **CPF Rates**: [CPF Board](https://www.cpf.gov.sg) (2025 rates)
- **Tax Rates**: [IRAS](https://www.iras.gov.sg) (YA 2025)
- **Inflation**: Singapore Department of Statistics
- **Investment Returns**: Historical Singapore market data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Open-source libraries that made this project possible
- Singapore government sources for accurate financial data
- Financial modeling best practices for projection algorithms

---

**Built with** React 19 • Tailwind CSS • Recharts • Firebase

**Optimized for** Performance • Accuracy • User Experience
