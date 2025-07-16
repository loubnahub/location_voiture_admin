import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Header from '../Header/Nav';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error feedback
  const navigate = useNavigate();

  // Reusing your beautiful styles
  const inputBaseClass = "tw-w-full tw-rounded-xl tw-text-sm tw-text-gray-200 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/70";
  const inputFieldClass = `${inputBaseClass} tw-bg-transparent tw-py-3 tw-pl-4 tw-pr-12`;
  const inputWrapperClass = "tw-relative tw-flex tw-items-center tw-bg-slate-800/80 tw-border tw-border-slate-700 tw-rounded-xl tw-shadow-md";
  const iconBackgroundClass = "tw-bg-slate-700/70";
  const accentBlue = "tw-text-blue-400";
  const accentBlueHover = "hover:tw-text-blue-300";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // --- API CALL SIMULATION ---
    // In a real app, you would make an API call here to your backend
    // to trigger the password reset email.
    // await api.post('/auth/forgot-password', { email });
    console.log(`Password reset requested for: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    setIsLoading(false);
    
    // On success, navigate to a confirmation page
    // Pass the email in state to display it on the next page
    navigate('/reset-confirmation', { state: { email } });

    // Handle potential errors from the API call
    // For example: setMessage('No account found with that email.');
  };

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
              Forgot Your<br/>Password<span className={`${accentBlue}`}>?</span>
            </h1>
            <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg">
              No problem. Enter your email address below and we'll send you a link to reset it.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="tw-space-y-6">
              <div className={inputWrapperClass}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email Address"
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
              
              {message && (
                <div className="tw-text-center tw-text-red-400 tw-text-sm tw-font-medium">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3.5 tw-rounded-xl tw-transition-colors tw-shadow-lg disabled:tw-bg-blue-800 disabled:tw-cursor-not-allowed"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="tw-text-center tw-mt-8">
              <Link 
                to="/login" // Or your client login path
                className={`tw-inline-flex tw-items-center tw-gap-2 tw-font-semibold ${accentBlue} ${accentBlueHover} hover:tw-underline tw-no-underline`}
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;