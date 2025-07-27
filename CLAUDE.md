# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Development
- `npm start` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm test` - Run all tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- --coverage` - Generate test coverage report

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (requires gh-pages setup)
- `npm run predeploy` - Build before deployment (runs automatically)

## Architecture Overview

This is a React-based financial dashboard application that helps users track and project their financial data. The application follows a component-driven architecture with centralized state management.

### Key Architectural Patterns

**State Management Strategy:**
- Global state via React Context API (`FinancialContext`) for financial data
- Custom hooks for complex business logic and calculations
- Local component state for UI-specific interactions
- Firebase integration for authenticated users with localStorage fallback

**Component Architecture:**
- Modular component structure under `src/components/`
- Shared components in `src/components/common/`
- Dashboard-specific components in `src/components/dashboard/`
- Chart components in `src/components/charts/`
- Reusable UI patterns with consistent styling

**Data Flow:**
```
Firebase/LocalStorage → FinancialContext → Custom Hooks → Components
```

### Core Custom Hooks

**useProjection** (`src/hooks/useProjection.js`):
- Primary financial projection engine
- Handles monthly salary calculations, CPF contributions, loan payments
- Generates projections starting from current month
- Supports salary adjustments, bonuses, and milestone tracking
- Includes error handling and validation

**useFinancialCalculations** (`src/hooks/useFinancialCalculations.js`):
- Centralized financial calculations and data processing
- Handles CPF calculations, expense totals, and derived metrics

**useMilestones** (`src/hooks/useMilestones.js`):
- Manages financial milestones and goal tracking
- Timeline generation and milestone achievement calculations

### Data Structure

The application manages structured financial data including:
- Personal information (birthday, employment dates, savings)
- Income details (current/future salary, CPF rates, adjustments)
- Expenses (array of categorized monthly expenses)
- Yearly bonuses (structured bonus data with dates)
- Projection settings (display options, calculation parameters)

### Technology Stack

- **React 19** with functional components and hooks
- **Tailwind CSS** for utility-first styling
- **Recharts** for financial data visualizations
- **Firebase** for user authentication and data persistence
- **React Testing Library & Jest** for testing

### Key Development Notes

**Financial Calculations:**
- All projections start from the current month by default
- Salary is received at the beginning of each month (simplified model)
- CPF contributions calculated based on Singapore regulations
- Loan payments include principal and interest calculations
- Investment returns applied monthly with compound growth

**Error Handling:**
- Comprehensive error boundaries at component level
- Custom error handling utilities in `src/utils/errors/`
- Graceful degradation for missing or invalid data
- User-friendly error messages and fallback states

**Testing Strategy:**
- Component unit tests focus on rendering and user interactions
- Hook tests verify calculation logic and state management
- Integration tests for complex user flows
- Fixtures and mocks for predictable test data

**Firebase Integration:**
- Automatic sync for authenticated users
- localStorage fallback for offline/unauthenticated usage
- Data migration handling for schema changes
- Sync status indicators for user feedback

### File Structure Highlights

- `src/context/FinancialContext.js` - Central state management with Firebase sync
- `src/hooks/useProjection.js` - Core financial projection calculations  
- `src/components/dashboard/` - Main dashboard components
- `src/services/calculations/` - Financial calculation utilities
- `src/utils/errors/` - Error handling utilities
- `docs/ARCHITECTURE.md` - Detailed architectural documentation

When making changes:
1. Follow existing component patterns and naming conventions
2. Maintain financial calculation accuracy and validation
3. Ensure proper error handling and user feedback
4. Test calculations thoroughly, especially edge cases
5. Consider impact on Firebase data structure and migration needs