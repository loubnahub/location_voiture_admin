import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import Header from '../Header/Nav';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    // In a real app, you might want to validate the token with the backend
    // as soon as the component loads. If invalid, redirect.
    if (!token) {
        setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);


  // Reusing your beautiful styles
  const inputBaseClass = "tw-w-full tw-rounded-xl tw-text-sm tw-text-gray-200 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/70";
  const inputFieldClass = `${inputBaseClass} tw-bg-transparent tw-py-3 tw-pl-4 tw-pr-12`;
  const inputWrapperClass = "tw-relative tw-flex tw-items-center tw-bg-slate-800/80 tw-border tw-border-slate-700 tw-rounded-xl tw-shadow-md";
  const iconBackgroundClass = "tw-bg-slate-700/70";
  const accentBlue = "tw-text-blue-400";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    // --- API CALL SIMULATION ---
    // In a real app, you would make an API call here to your backend
    // to finally reset the password, sending the token and new password.
    // await api.post('/auth/reset-password', { token, password: formData.password });
    console.log(`Password reset for token: ${token} with new password.`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    setIsLoading(false);
    setSuccess(true);
    
    // Redirect to login after a few seconds
    setTimeout(() => {
        navigate('/login'); // Or your client login path
    }, 4000);
  };

  if (success) {
      return (
          <div className="tw-min-h-screen tw-bg-[#1A1A1A] tw-text-white tw-flex tw-items-center tw-justify-center tw-p-4">
              <div className="tw-text-center">
                  <CheckCircle size={60} className="tw-mx-auto tw-text-green-400" />
                  <h1 className="tw-mt-6 tw-text-3xl tw-font-bold">Password Reset Successful!</h1>
                  <p className="tw-mt-2 tw-text-gray-300">You can now log in with your new password.</p>
                  <p className="tw-mt-4 tw-text-sm tw-text-gray-400">Redirecting to login page...</p>
              </div>
          </div>
      );
  }

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
              Create New<br/>Password<span className={`${accentBlue}`}>.</span>
            </h1>
            <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="tw-space-y-6">
              {/* New Password Field */}
              <div className={inputWrapperClass}>
                <input
                  type={showPassword ? "text" : "password"} name="password" placeholder="New Password"
                  value={formData.password} onChange={handleChange} className={inputFieldClass} required disabled={isLoading || !token}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-full ${iconBackgroundClass} tw-rounded-r-xl`}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className={inputWrapperClass}>
                <input
                  type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm New Password"
                  value={formData.confirmPassword} onChange={handleChange} className={inputFieldClass} required disabled={isLoading || !token}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`tw-absolute tw-right-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-full ${iconBackgroundClass} tw-rounded-r-xl`}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {error && (
                <div className="tw-text-center tw-text-red-400 tw-text-sm tw-font-medium">
                  {error}
                </div>
              )}

              <button type="submit" className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3.5 tw-rounded-xl tw-transition-colors tw-shadow-lg disabled:tw-bg-blue-800 disabled:tw-cursor-not-allowed"
                disabled={isLoading || !token}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;