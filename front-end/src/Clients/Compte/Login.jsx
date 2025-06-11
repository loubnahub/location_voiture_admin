// src/pages/Client/LoginPageClient.jsx (Assuming this is the path for client login)
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Eye, EyeOff } from 'lucide-react';
import Header from '../Header/Nav'; // Adjusted path assuming Header is in components

const LoginClient = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any previous auth errors when the component mounts or when location changes (if needed)
    setAuthError(null);
  }, [setAuthError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) { // Clear error message when user starts typing
        setAuthError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null); // Clear previous errors before new attempt
    try {
      // The login function from useAuth should handle API call and set isAuthenticated/currentUser
      const user = await login(formData.email, formData.password); 

      console.log('[Login Page] User object received from login function:', user);
      
      // Check if login was successful (user object might be null/undefined on failure if login func handles it that way)
      // The navigation logic might be better handled within the AuthContext or based on isAuthenticated state change
      if (user) { // Assuming login function returns user on success
        if (user.roles && user.roles.some(role => role.name === 'admin')) { // Check role name
          console.log('[Login Page] Role is admin. Navigating to /admin/dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('[Login Page] Role is NOT admin or no roles. Navigating to /home');
          navigate('/home', { replace: true }); // Default redirect for non-admin users
        }
      } else {
        // If login function doesn't throw but returns falsy on failure, setAuthError might be needed here.
        // However, useAuth's login should ideally set authError itself.
        console.log('[Login Page] Login function returned no user.');
      }
    } catch (error) {
      // This catch block will be hit if the login function in useAuth throws an error.
      // authError should already be set by the login function in useAuth.
      console.error('Login attempt failed in component:', error);
    }
  };
  
  // Tailwind classes with 'tw-' prefix
  const inputBaseClass = "tw-w-full tw-rounded-xl tw-text-sm tw-text-gray-200 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/70";
  const inputFieldClass = `${inputBaseClass} tw-bg-transparent tw-py-3 tw-pl-4 tw-pr-12`;
  const inputWrapperClass = "tw-relative tw-flex tw-items-center tw-bg-slate-800/80 tw-border tw-border-slate-700 tw-rounded-xl tw-shadow-md";
  const iconBackgroundClass = "tw-bg-slate-700/70";
  const accentBlue = "tw-text-blue-400";
  const accentBlueHover = "hover:tw-text-blue-300";

  return (
    <div className="tw-min-h-screen tw-bg-[#1A1A1A] tw-text-white tw-flex tw-flex-col">
      <div
        className="tw-absolute tw-inset-0 tw-h-full tw-bg-cover tw-bg-center tw-opacity-20 tw-z-0"
        style={{ backgroundImage: "url('/images/Cars/Bently.jpg')" }}
      ></div>

      <header className="tw-relative tw-z-50 tw-py-5 tw-px-6 sm:tw-px-10 md:tw-px-16">
        <Header />
      </header>

      <main className="tw-relative tw-z-10 tw-flex-grow tw-flex tw-items-center tw-justify-center tw-py-10 tw-px-4 sm:tw-px-6">
        <div className="tw-w-full tw-max-w-md">
          <div className="tw-text-center tw-mb-10">
            <h1 className="tw-text-4xl sm:tw-text-5xl tw-font-bold">
              <span className={`${accentBlue} tw-pt-2`}>Login</span> to
              Your <br /> Account<span className={`${accentBlue}`}>.</span>
            </h1>
            <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg">
              Welcome back to RECALO! Access your account.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="tw-space-y-6">
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
                <div className={`tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-full ${iconBackgroundClass} tw-rounded-r-xl tw-pointer-events-none`}>
                    <Mail size={18} className="tw-text-gray-400" />
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
                  className={`tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-full ${iconBackgroundClass} tw-rounded-r-xl hover:tw-bg-opacity-100 tw-transition-opacity`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} className="tw-text-gray-400" /> : <Eye size={18} className="tw-text-gray-400" />}
                </button>
              </div>

              {authError && (
                <div className="tw-text-center tw-text-red-400 tw-text-sm tw-font-medium">
                  {authError}
                </div>
              )}

              <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                <label htmlFor="rememberMe" className="tw-flex tw-items-center tw-cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    className={`tw-h-4 tw-w-4 ${accentBlue.replace('tw-text-', 'text-')} tw-bg-gray-700 tw-border-gray-600 tw-rounded focus:tw-ring-blue-500/50 tw-mr-2`}
                    disabled={isLoading}
                  />
                  <span className="tw-text-gray-400">Remember Me</span>
                </label>
                <a href="#" className={`tw-font-medium ${accentBlue} ${accentBlueHover} hover:tw-underline`}>
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3.5 tw-rounded-xl tw-transition-colors tw-shadow-lg disabled:tw-bg-blue-800 disabled:tw-cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="tw-text-center tw-text-sm tw-text-gray-400 tw-mt-8">
              Don't have an Account?{' '}
              <Link to="/Signup" className={`tw-font-semibold ${accentBlue} ${accentBlueHover} hover:tw-underline tw-no-underline`}> {/* Changed href to Link to, added tw-no-underline */}
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginClient;