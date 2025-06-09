import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Eye, EyeOff } from 'lucide-react';
import Header from '../Header/Nav';

const LoginClient = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 // In src/Clients/Compte/Login.jsx

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);

      // --- ADD THIS LOG ---
      console.log('[Login Page] User object received from login function:', user); 
      // --- END LOG ---

      if (user && user.roles && user.roles.includes('admin')) {
        console.log('[Login Page] Role is admin. Navigating to /admin/dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('[Login Page] Role is NOT admin. Navigating to /');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Login attempt failed:', error);
    }
};
  const inputBaseClass = "w-full rounded-xl text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70";
  const inputFieldClass = `${inputBaseClass} bg-transparent py-3 pl-4 pr-12`;
  const inputWrapperClass = "relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl shadow-md";
  const iconBackgroundClass = "bg-slate-700/70";
  const accentBlue = "text-blue-400";
  const accentBlueHover = "hover:text-blue-300";

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <div
        className="absolute inset-0 h-full bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: "url('/images/Cars/Bently.jpg')" }}
      ></div>

      <header className="relative z-50 py-5 px-6 sm:px-10 md:px-16">
        <Header />
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className={`${accentBlue} pt-2`}>Login</span> to
              Your <br /> Account<span className={`${accentBlue}`}>.</span>
            </h1>
            <p className="mt-4 text-gray-300 text-base sm:text-lg">
              Welcome back to RECALO! Access your account.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={inputWrapperClass}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputFieldClass}
                  required
                  disabled={isLoading}
                />
                <div className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full ${iconBackgroundClass} rounded-r-xl pointer-events-none`}>
                    <Mail size={18} className="text-gray-400" />
                </div>
              </div>
              
              <div className={inputWrapperClass}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputFieldClass}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full ${iconBackgroundClass} rounded-r-xl hover:bg-opacity-100 transition-opacity`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>

              {authError && (
                <div className="text-center text-red-400 text-sm font-medium">
                  {authError}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label htmlFor="rememberMe" className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    className={`h-4 w-4 ${accentBlue.replace('text-', 'text-')} bg-gray-700 border-gray-600 rounded focus:ring-blue-500/50 mr-2`}
                    disabled={isLoading}
                  />
                  <span className="text-gray-400">Remember Me</span>
                </label>
                <a href="#" className={`font-medium ${accentBlue} ${accentBlueHover} hover:underline`}>
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg disabled:bg-blue-800 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-8">
              Don't have an Account?{' '}
              <a href="/signup" className={`font-semibold ${accentBlue} ${accentBlueHover} hover:underline`}>
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginClient;