# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Improvements (2025)

### Performance & Accuracy Updates
This codebase has been significantly optimized with:
- ✅ **Age-based CPF calculations** integrated for Singapore users
- ✅ **React.memo optimizations** on expensive chart components  
- ✅ **Context memoization** with useCallback for all functions
- ✅ **Enhanced UI spacing** with responsive breakpoints
- ✅ **Build optimization** with ESLint compliance

### Key Files Modified
- `src/context/FinancialContext.js` - Optimized with useCallback functions
- `src/hooks/useProjection.js` - Enhanced with CPF age progression
- `src/hooks/useFinancialCalculations.js` - Integrated CPF utilities
- `src/components/charts/*` - Memoized with React.memo
- `src/components/dashboard/UpcomingSpending/*` - Enhanced spacing
- `src/components/EditParameters.js` - Expanded layout and improved UX

## Common Development Commands

### Build and Development
- `npm start` - Start development server at http://localhost:3000
- `npm run build` - Build for production (now ESLint compliant!)
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
- **Optimized Global State**: React Context API (`FinancialContext`) with memoized values and useCallback functions
- **Performance-Focused Hooks**: Custom hooks with intelligent dependency arrays and memoization
- **Component Optimization**: Strategic React.memo usage on expensive components (charts, tables)
- **Firebase Integration**: Authenticated user sync with localStorage fallback and sync status indicators

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
- **Dynamic CPF Integration**: Age-based CPF rates that automatically adjust during multi-year projections
- **Singapore-Specific**: Authentic CPF calculations for Singaporeans, SPRs, and Foreigners with proper age brackets
- **Smart Projections**: All projections start from current month with salary timing awareness
- **Loan Modeling**: Principal and interest calculations with early payoff detection
- **Investment Growth**: Monthly compound returns with configurable rates
- **Performance Optimized**: Memoized calculations that only recalculate when relevant data changes

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

## Current Development Best Practices

When making changes to this optimized codebase:

### Performance Considerations
1. **Use React.memo** for expensive components (charts, tables, complex calculations)
2. **Wrap functions in useCallback** when passing to memoized components or context
3. **Use useMemo** for expensive calculations or object creation
4. **Check dependency arrays** - only include values that should trigger re-computation

### Component Development
5. **Follow existing patterns** - component structure, naming conventions, and folder organization
6. **Maintain responsive design** - use established breakpoints (sm:, md:, lg:, xl:)
7. **Use consistent spacing** - follow the p-6, gap-6, mb-8 spacing hierarchy
8. **Add hover states** for interactive elements using transition classes

### Financial Calculations
9. **Leverage CPF utilities** - use `getCpfRates()` for accurate age-based calculations
10. **Validate financial logic** thoroughly, especially for edge cases and age transitions
11. **Test projections** across different age groups and employee types
12. **Consider aging effects** when building multi-year projections

### Code Quality
13. **Ensure ESLint compliance** - build will fail with ESLint errors
14. **Add proper error handling** with user-friendly messages
15. **Test thoroughly** - especially complex hooks and financial calculations
16. **Consider Firebase impact** when modifying data structures

### UI/UX Standards
17. **Use established Card component** with consistent styling
18. **Follow responsive grid patterns** - 1/2/3 column layouts as appropriate
19. **Maintain accessibility** with proper labels and semantic HTML
20. **Test across breakpoints** to ensure good mobile/tablet experience