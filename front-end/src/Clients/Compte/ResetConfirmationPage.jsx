import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import Header from '../Header/Nav';

const ResetConfirmationPage = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email address'; // Fallback text
  
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
        <div className="tw-w-full tw-max-w-md tw-text-center">

          <div className="tw-flex tw-justify-center tw-mb-6">
            <div className="tw-w-20 tw-h-20 tw-bg-blue-600/20 tw-border-2 tw-border-blue-500/50 tw-rounded-full tw-flex tw-items-center tw-justify-center">
              <MailCheck size={40} className={accentBlue} />
            </div>
          </div>
          
          <h1 className="tw-text-4xl sm:tw-text-5xl tw-font-bold">
            Check Your<br/>Inbox<span className={`${accentBlue}`}>.</span>
          </h1>
          <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg">
            We have sent a password reset link to <br/>
            <span className="tw-font-semibold tw-text-gray-100">{email}</span>.
          </p>
          <p className="tw-mt-4 tw-text-gray-400 tw-text-sm">
            Didn't receive the email? Check your spam folder, or you can try again.
          </p>

          <div className="tw-mt-10">
            <Link
                to="/login" // Or your client login path
                className="tw-w-full sm:tw-w-auto tw-inline-block tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-font-semibold tw-py-3 tw-px-8 tw-rounded-xl tw-transition-colors tw-shadow-lg"
            >
                Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetConfirmationPage;