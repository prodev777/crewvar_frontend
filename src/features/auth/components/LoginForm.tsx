import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const LoginForm = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            console.log('Attempting login with:', { email, password });
            
            // Use Firebase authentication
            await signIn(email, password);
            
            console.log('Login successful!');
            navigate("/dashboard");
            
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoAccount = () => {
        setEmail("test3@example.com");
        setPassword("123123");
    };
    
    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
                        required
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full font-semibold text-sm bg-dark text-white transition hover:bg-opacity-90 rounded-xl py-3 px-4 mb-2 disabled:opacity-50"
                >
                    {isLoading ? "Signing In..." : "Sign In"}
                </button>
                
                <button 
                    type="button"
                    onClick={handleDemoAccount}
                    className="w-full font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4"
                >
                    Use Demo Account
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Need an account?{" "}
                    <Link
                        className="font-semibold text-primary transition-colors hover:text-dark"
                        to="/auth/signup"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;