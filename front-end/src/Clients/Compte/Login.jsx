import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust this path
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, LoaderCircle, AlertTriangle } from 'lucide-react';
import Header from '../Header/Nav'; // Adjust this path

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, authError, setAuthError, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => { setAuthError(null); };
  }, [setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
        setAuthError("Email and Password are required.");
        return;
    }
    try {
      await login(email, password, rememberMe);
    } catch (error) {
      console.error("Login attempt failed:", error);
    }
  };

  // --- Tailwind CSS Styling Constants with 'tw-' prefix ---
  // NOTE: The prefix is applied in the JSX, not here, for clarity.
  const inputBaseClass = "tw-w-full tw-rounded-xl tw-text-sm tw-text-gray-200 tw-placeholder-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/70";
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
              Welcome back to LO DRIVE! Access your account.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="tw-space-y-6">
              {authError && (
                <div className="tw-bg-red-900/50 tw-border tw-border-red-700/60 tw-text-red-300 tw-px-4 tw-py-3 tw-rounded-lg tw-relative tw-flex tw-items-center">
                   <AlertTriangle size={18} className="tw-mr-3 tw-flex-shrink-0" />
                   <span className="tw-block sm:tw-inline tw-text-sm">{authError}</span>
                </div>
              )}
              
              <div className={inputWrapperClass}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputFieldClass}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-full ${iconBackgroundClass} tw-rounded-r-xl hover:tw-bg-opacity-100 tw-transition-opacity`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} className="tw-text-gray-400" /> : <Eye size={18} className="tw-text-gray-400" />}
                </button>
              </div>

              <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                <label htmlFor="rememberMe" className="tw-flex tw-items-center tw-cursor-pointer">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`tw-h-4 tw-w-4 tw-bg-gray-700 tw-border-gray-600 tw-rounded focus:tw-ring-blue-500/50 tw-mr-2 tw-text-blue-500`}
                  />
                  <span className="tw-text-gray-400">Remember Me</span>
                </label>
                <a href="#" className={`tw-font-medium ${accentBlue} ${accentBlueHover} hover:tw-underline`}>
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3.5 tw-rounded-xl tw-transition-colors tw-shadow-lg tw-flex tw-items-center tw-justify-center disabled:tw-bg-blue-800 disabled:tw-cursor-not-allowed"
              >
                {isLoading ? (
                    <LoaderCircle size={22} className="tw-animate-spin" />
                ) : (
                    'Login'
                )}
              </button>
            </form>

            <p className="tw-text-center tw-text-sm tw-text-gray-400 tw-mt-8">
              Don't have an Account?{' '}
              <Link to="/signup" className={`tw-font-semibold ${accentBlue} ${accentBlueHover} hover:tw-underline`}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;