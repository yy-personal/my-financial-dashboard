// src/index.js - Updated with proper base URL handling
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { FinancialProvider } from "./context/FinancialContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Determine base URL - handle both deployment and development environments
const getBasename = () => {
	// For GitHub Pages deployment
	if (process.env.NODE_ENV === "production") {
		return "/my-financial-dashboard";
	}
	// For local development
	return "";
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<BrowserRouter basename={getBasename()}>
			<AuthProvider>
				<FinancialProvider>
					<App />
				</FinancialProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
