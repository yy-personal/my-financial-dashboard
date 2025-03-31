import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EditParameters from "./components/EditParameters";

function App() {
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gray-100">
			<nav className="bg-blue-700 text-white p-4">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold">
						Personal Financial Dashboard
					</h1>

					{/* Desktop navigation */}
					<div className="hidden md:flex space-x-4">
						<Link
							to="/"
							className={`px-3 py-2 rounded-md ${
								location.pathname === "/"
									? "bg-blue-900"
									: "hover:bg-blue-800"
							}`}
						>
							Dashboard
						</Link>
						<Link
							to="/edit"
							className={`px-3 py-2 rounded-md ${
								location.pathname === "/edit"
									? "bg-blue-900"
									: "hover:bg-blue-800"
							}`}
						>
							Edit Parameters
						</Link>
					</div>

					{/* Mobile menu button */}
					<button
						className="md:hidden flex items-center touch-target"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
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
							/>
						</svg>
					</button>
				</div>

				{/* Mobile navigation menu */}
				{mobileMenuOpen && (
					<div className="md:hidden mt-2 px-2 pt-2 pb-3 space-y-1 sm:px-3">
						<Link
							to="/"
							className={`block px-3 py-2 rounded-md ${
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
							className={`block px-3 py-2 rounded-md ${
								location.pathname === "/edit"
									? "bg-blue-900"
									: "hover:bg-blue-800"
							}`}
							onClick={() => setMobileMenuOpen(false)}
						>
							Edit Parameters
						</Link>
					</div>
				)}
			</nav>

			<div className="container mx-auto p-4">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/edit" element={<EditParameters />} />
				</Routes>
			</div>

			<footer className="bg-gray-200 p-4 text-center text-gray-600 safe-area-inset-bottom">
				<p>Personal Financial Dashboard © {new Date().getFullYear()}</p>
			</footer>
		</div>
	);
}

export default App;
