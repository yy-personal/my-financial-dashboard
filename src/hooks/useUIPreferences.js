import { useState, useEffect, useCallback } from "react";

/**
 * useUIPreferences hook
 * Manages UI preferences including theme, chart colors, and display settings
 * 
 * @returns {Object} UI preferences and functions to update them
 */
const useUIPreferences = () => {
  // Initialize from localStorage if available, otherwise use defaults
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("uiTheme");
    return savedTheme || "light";
  });

  const [chartColors, setChartColors] = useState(() => {
    const savedColors = localStorage.getItem("chartColors");
    return savedColors 
      ? JSON.parse(savedColors) 
      : {
          primary: "#0088FE",
          secondary: "#00C49F",
          tertiary: "#FFBB28",
          quaternary: "#FF8042",
          danger: "#FF0000",
          success: "#00C853",
          warning: "#FFB300"
        };
  });

  const [compactMode, setCompactMode] = useState(() => {
    const savedMode = localStorage.getItem("compactMode");
    return savedMode === "true";
  });

  const [currencyFormat, setCurrencyFormat] = useState(() => {
    const savedFormat = localStorage.getItem("currencyFormat");
    return savedFormat || "USD";
  });

  const [dateFormat, setDateFormat] = useState(() => {
    const savedFormat = localStorage.getItem("dateFormat");
    return savedFormat || "MMM yyyy"; // Default format (e.g., "Jan 2023")
  });

  // Update theme
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("uiTheme", newTheme);
      return newTheme;
    });
  }, []);

  // Update specific chart color
  const updateChartColor = useCallback((colorKey, newColor) => {
    setChartColors(prevColors => {
      const updatedColors = { ...prevColors, [colorKey]: newColor };
      localStorage.setItem("chartColors", JSON.stringify(updatedColors));
      return updatedColors;
    });
  }, []);

  // Reset chart colors to defaults
  const resetChartColors = useCallback(() => {
    const defaultColors = {
      primary: "#0088FE",
      secondary: "#00C49F",
      tertiary: "#FFBB28",
      quaternary: "#FF8042",
      danger: "#FF0000",
      success: "#00C853",
      warning: "#FFB300"
    };
    
    setChartColors(defaultColors);
    localStorage.setItem("chartColors", JSON.stringify(defaultColors));
  }, []);

  // Toggle compact mode
  const toggleCompactMode = useCallback(() => {
    setCompactMode(prev => {
      const newMode = !prev;
      localStorage.setItem("compactMode", String(newMode));
      return newMode;
    });
  }, []);

  // Update currency format
  const updateCurrencyFormat = useCallback((format) => {
    setCurrencyFormat(format);
    localStorage.setItem("currencyFormat", format);
  }, []);

  // Update date format
  const updateDateFormat = useCallback((format) => {
    setDateFormat(format);
    localStorage.setItem("dateFormat", format);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply additional CSS variables for theme colors
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--bg-primary', '#121212');
      document.documentElement.style.setProperty('--bg-secondary', '#1e1e1e');
      document.documentElement.style.setProperty('--text-primary', '#ffffff');
      document.documentElement.style.setProperty('--text-secondary', '#b3b3b3');
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff');
      document.documentElement.style.setProperty('--bg-secondary', '#f5f5f5');
      document.documentElement.style.setProperty('--text-primary', '#333333');
      document.documentElement.style.setProperty('--text-secondary', '#666666');
    }
  }, [theme]);

  // Get color palette for charts based on current theme and preferences
  const getChartColorPalette = useCallback(() => {
    // Create an array of colors for charts
    const baseColors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.tertiary,
      chartColors.quaternary,
      // Add additional colors based on theme
      theme === 'dark' ? '#9370DB' : '#8884d8',
      theme === 'dark' ? '#20B2AA' : '#82ca9d', 
      theme === 'dark' ? '#CD853F' : '#ffc658',
      theme === 'dark' ? '#4682B4' : '#8dd1e1'
    ];
    
    return baseColors;
  }, [theme, chartColors]);

  // Format currency based on current preferences
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyFormat,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, [currencyFormat]);

  return {
    theme,
    chartColors,
    compactMode,
    currencyFormat,
    dateFormat,
    toggleTheme,
    updateChartColor,
    resetChartColors,
    toggleCompactMode,
    updateCurrencyFormat,
    updateDateFormat,
    getChartColorPalette,
    formatCurrency,
    isDarkMode: theme === 'dark'
  };
};

export default useUIPreferences;