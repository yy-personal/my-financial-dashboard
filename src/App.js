// src/App.js - Updated with authentication
import React, { useState } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EditParameters from "./components/EditParameters";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";

// Protected Route component
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="text-blue-600 animate-spin rounded-full border-t-2 border-b-2 border-blue-600 h-12 w-12 mx-auto"></div>
					<p className="mt-3 text-gray-700">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

function App() {
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { isAuthenticated, currentUser, logout } = useAuth();

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const handleLogout = async () => {
		await logout();
	};

	// If on login page, show only login component
	if (location.pathname === "/login") {
		return <Login />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Responsive Navigation */}
			<nav className="bg-blue-700 text-white shadow-lg">
				<div className="container mx-auto px-4">
					{/* Desktop Navigation */}
					<div className="flex justify-between items-center h-16">
						<h1 className="text-xl font-bold">
							Financial Dashboard
						</h1>

						{/* Desktop Menu */}
						<div className="hidden md:flex space-x-4">
							<Link
								to="/"
								className={`px-4 py-2 rounded-md transition-colors ${
									location.pathname === "/"
										? "bg-blue-900"
										: "hover:bg-blue-800"
								}`}
							>
								Dashboard
							</Link>
							<Link
								to="/edit"
								className={`px-4 py-2 rounded-md transition-colors ${
									location.pathname === "/edit"
										? "bg-blue-900"
										: "hover:bg-blue-800"
								}`}
							>
								Edit Parameters
							</Link>
							{isAuthenticated && (
								<button
									onClick={handleLogout}
									className="px-4 py-2 rounded-md transition-colors hover:bg-blue-800"
								>
									Logout
								</button>
							)}
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<button
								onClick={toggleMobileMenu}
								className="flex items-center p-2 rounded-md hover:bg-blue-800"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d={
											mobileMenuOpen
												? "M6 18L18 6M6 6l12 12"
												: "M4 6h16M4 12h16M4 18h16"
										}
									></path>
								</svg>
							</button>
						</div>
					</div>

					{/* Mobile Navigation Menu */}
					{mobileMenuOpen && (
						<div className="md:hidden py-2 pb-4">
							<Link
								to="/"
								className={`block px-4 py-2 my-1 rounded-md ${
									location.pathname === "/"
										? "bg-blue-900"
										: "hover:bg-blue-800"
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								Dashboard
							</Link>
							<Link
								to="/edit"
								className={`block px-4 py-2 my-1 rounded-md ${
									location.pathname === "/edit"
										? "bg-blue-900"
										: "hover:bg-blue-800"
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								Edit Parameters
							</Link>
							{isAuthenticated && (
								<button
									onClick={() => {
										handleLogout();
										setMobileMenuOpen(false);
									}}
									className="block w-full text-left px-4 py-2 my-1 rounded-md hover:bg-blue-800"
								>
									Logout
								</button>
							)}
						</div>
					)}
				</div>
			</nav>

			<main className="container mx-auto px-4 py-6">
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/edit"
						element={
							<ProtectedRoute>
								<EditParameters />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>

			<footer className="bg-gray-200 p-4 text-center text-gray-600 mt-8">
				<p>Personal Financial Dashboard © {new Date().getFullYear()}</p>
				{isAuthenticated && (
					<p className="text-xs text-gray-500 mt-1">
						Logged in as: {currentUser?.email}
					</p>
				)}
			</footer>
		</div>
	);
}

export default App;
