// src/components/Login.js
import React, { useState, useEffect } from "react";
import { loginWithEmail } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [loginSuccess, setLoginSuccess] = useState(false);
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	// If user is already authenticated, redirect to dashboard
	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			console.log(`Attempting login with email: ${email}`);
			const { user, error } = await loginWithEmail(email, password);
			if (error) {
				console.error("Login error in component:", error);
				setError(error);
			} else if (user) {
				// Show success message briefly before redirecting
				setLoginSuccess(true);
				console.log("Login successful in component, redirecting...");

				// Small delay to show success message
				setTimeout(() => {
					navigate("/");
				}, 1000);
			}
		} catch (err) {
			console.error("Unexpected login error:", err);
			setError("Failed to login. Please check your credentials.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-xl">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Financial Dashboard Login
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Please sign in to access your financial dashboard
					</p>
				</div>

				{loginSuccess && (
					<div
						className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded relative"
						role="alert"
					>
						<span className="block sm:inline">
							Login successful! Redirecting to dashboard...
						</span>
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					{error && (
						<div
							className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative"
							role="alert"
						>
							<span className="block sm:inline">{error}</span>
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
								isLoading
									? "bg-blue-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							}`}
						>
							{isLoading ? (
								<>
									<span className="absolute left-0 inset-y-0 flex items-center pl-3">
										<svg
											className="animate-spin h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									</span>
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</button>
					</div>

					<div className="text-center text-sm">
						<p>
							For demo, use: <br />
							Email: demo@example.com <br />
							Password: password123
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
