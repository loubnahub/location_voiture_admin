// src/pages/Client/LoginPageClient.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Eye, EyeOff } from 'lucide-react';
import Header from '../Header/Nav';
// --- ANIMATION START ---
// 1. Import motion and AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
// --- ANIMATION END ---

// --- ANIMATION START ---
// 2. Define animation variants for a staggered fade-in effect.
// This makes the elements appear one after another.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Time delay between each child animating in
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const errorVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 5, scale: 0.95, transition: { duration: 0.2 } },
};
// --- ANIMATION END ---

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
    if (authError) {
        setAuthError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const user = await login(formData.email, formData.password); 
      console.log('[Login Page] User object received from login function:', user);
      
      if (user) {
        if (user.roles && user.roles.some(role => role.name === 'admin')) {
          console.log('[Login Page] Role is admin. Navigating to /admin/dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('[Login Page] Role is NOT admin or no roles. Navigating to /home');
          navigate('/home', { replace: true });
        }
      } else {
        console.log('[Login Page] Login function returned no user.');
      }
    } catch (error) {
      console.error('Login attempt failed in component:', error);
    }
  };
  
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
        {/* --- ANIMATION START --- */}
        {/* 3. Wrap the main content container with motion.div and apply the variants */}
        <motion.div
          className="tw-w-full tw-max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 4. Apply the itemVariants to child elements to make them part of the stagger animation */}
          <motion.div variants={itemVariants} className="tw-text-center tw-mb-10">
            <h1 className="tw-text-4xl sm:tw-text-5xl tw-font-bold">
              <span className={`${accentBlue} tw-pt-2`}>Login</span> to
              Your <br /> Account<span className={`${accentBlue}`}>.</span>
            </h1>
            <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg">
              Welcome back !! Access your account.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <form onSubmit={handleSubmit} className="tw-space-y-6">
              <motion.div variants={itemVariants} className={inputWrapperClass}>
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
              </motion.div>
              
              <motion.div variants={itemVariants} className={inputWrapperClass}>
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
              </motion.div>

              {/* --- ANIMATION START --- */}
              {/* 5. Wrap the conditional error message with AnimatePresence for enter/exit animations */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="tw-text-center tw-text-red-400 tw-text-sm tw-font-medium"
                  >
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* --- ANIMATION END --- */}

              <motion.div variants={itemVariants} className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                <label htmlFor="rememberMe" className="tw-flex tw-items-center tw-cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    className={`tw-h-4 tw-w-4 ${accentBlue.replace('tw-text-', 'text-')} tw-bg-gray-700 tw-border-gray-600 tw-rounded focus:tw-ring-blue-500/50 tw-mr-2`}
                    disabled={isLoading}
                  />
                  <span className="tw-text-gray-400">Remember Me</span>
                </label>
                <Link to="/forgot-password" className={`tw-font-medium ${accentBlue} ${accentBlueHover} hover:tw-underline`}>
                  Forgot Password?
                </Link>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3.5 tw-rounded-xl tw-transition-colors tw-shadow-lg disabled:tw-bg-blue-800 disabled:tw-cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>

            <motion.p variants={itemVariants} className="tw-text-center tw-text-sm tw-text-gray-400 tw-mt-8">
              Don't have an Account?{' '}
              <Link to="/Signup" className={`tw-font-semibold ${accentBlue} ${accentBlueHover} hover:tw-underline tw-no-underline`}>
                Sign Up
              </Link>
            </motion.p>
          </motion.div>
        {/* --- ANIMATION END --- */}
        </motion.div>
      </main>
    </div>
  );
};

export default LoginClient;