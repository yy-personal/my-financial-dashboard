import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EditParameters from "./components/EditParameters";

function App() {
	const location = useLocation();

	return (
		<div className="min-h-screen bg-gray-100">
			<nav className="bg-blue-700 text-white p-4">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold">
						Personal Financial Dashboard
					</h1>
					<div className="space-x-4">
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
				</div>
			</nav>

			<div className="container mx-auto p-4">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/edit" element={<EditParameters />} />
				</Routes>
			</div>

			<footer className="bg-gray-200 p-4 text-center text-gray-600">
				<p>Personal Financial Dashboard © {new Date().getFullYear()}</p>
			</footer>
		</div>
	);
}

export default App;
