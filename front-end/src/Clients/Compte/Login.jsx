import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import Header from '../Header/Nav'; // Assuming this path is correct

// LoDriveLogo can be reused if you keep it in a shared location or copy it here
// For simplicity, I'll assume it's accessible or you can copy it from SignUpPage.jsx

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', formData);
    alert('Login simulated!');
    // Perform login logic, then redirect
  };

  // --- NEW COLOR SCHEME FOR FORM ---
  // Base input styles, focus ring updated
  const inputBaseClass = "w-full rounded-xl text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70"; // Blue focus ring
  
  // Input field class, uses base class
  const inputFieldClass = `${inputBaseClass} bg-transparent py-3 pl-4 pr-12`;
  
  // Wrapper for input field + icon area
  const inputWrapperClass = "relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl shadow-md"; // Cooler gray/slate background
  
  // Background for the icon part of the input
  const iconBackgroundClass = "bg-slate-700/70"; // Slightly different slate for icon area, or could be darker e.g., bg-slate-900/70

  // Primary accent color for links and interactive elements
  const accentBlue = "text-blue-400";
  const accentBlueHover = "hover:text-blue-300";

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      {/* Background  for the section */}
      <div
        className="absolute inset-0 h-full bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: "url('/images/Cars/Bently.jpg')" }}
      ></div>

      {/* Header */}
      <header className="relative z-50 py-5 px-6 sm:px-10 md:px-16">
        <Header />
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className={`${accentBlue} pt-2`}>Login</span> to {/* Changed to accentBlue */}
              Your <br /> Account<span className={`${accentBlue}`}>.</span> {/* Changed to accentBlue */}
            </h1>
            <p className="mt-4 text-gray-300 text-base sm:text-lg">
              Welcome back to LO DRIVE! Access your account.
            </p>
          </div>

          {/* Login form section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className={inputWrapperClass}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputFieldClass}
                  required
                />
                <div className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full ${iconBackgroundClass} rounded-r-xl pointer-events-none`}>
                    <Mail size={18} className="text-gray-400" />
                </div>
              </div>
              
              {/* Password */}
              <div className={inputWrapperClass}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputFieldClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full ${iconBackgroundClass} rounded-r-xl hover:bg-opacity-100 transition-opacity`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label htmlFor="rememberMe" className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="rememberMe" 
                    className={`h-4 w-4 ${accentBlue.replace('text-', 'text-')} bg-gray-700 border-gray-600 rounded focus:ring-blue-500/50 mr-2`} // Blue accent for checkbox
                  />
                  <span className="text-gray-400">Remember Me</span>
                </label>
                <a href="#" className={`font-medium ${accentBlue} ${accentBlueHover} hover:underline`}> {/* Blue link */}
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg" // Blue button
              >
                Login
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-8">
              Don't have an Account?{' '}
              <a href="/signup" className={`font-semibold ${accentBlue} ${accentBlueHover} hover:underline`}> {/* Blue link */}
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;