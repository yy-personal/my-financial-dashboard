// src/index.js - Updated with AuthProvider
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { FinancialProvider } from "./context/FinancialContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<BrowserRouter basename={process.env.PUBLIC_URL}>
			<AuthProvider>
				<FinancialProvider>
					<App />
				</FinancialProvider>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
