import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Eye,
  MapPin,
  Building,
  Globe,
  ScanLine,
  CloudUpload,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import Header from '../Header/Nav';
import { register } from '../../services/api'; // Correctly importing the register function

// --- Alert Component (No Changes) ---
const alertStyles = {
  base: 'flex items-center p-4 mb-4 text-sm rounded-xl shadow-lg border',
  success: 'bg-green-900/50 border-green-700/60 text-green-300',
  error: 'bg-red-900/50 border-red-700/60 text-red-300',
};

const iconStyles = {
  success: <CheckCircle2 className="h-5 w-5 mr-3" />,
  error: <AlertTriangle className="h-5 w-5 mr-3" />,
};

const Alert = ({ message, type = 'error', onClose }) => {
  if (!message) return null;
  return (
    <div className={`${alertStyles.base} ${alertStyles[type]}`} role="alert">
      {iconStyles[type]}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 -mr-1 p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

// --- SignUpClient Component ---
const SignUpClient = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    postalCode: '',
    city: '',
    country: '',
    address: '',
    email: '',
    password: '',
    profilePicture: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // No changes to handleChange or handleFileChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
      if (errors.profilePicture) {
        setErrors(prevErrors => ({ ...prevErrors, profilePicture: null }));
      }
    } else {
      setFormData({ ...formData, profilePicture: null });
      setProfilePicPreview(null);
    }
  };

  // --- REFINED: handleSubmit function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setAlert({ show: false, type: '', message: '' });

    // Prepare data with keys that EXACTLY match Laravel validation
    const submissionData = new FormData();
    submissionData.append('fullName', formData.fullName);
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    
    // Send optional fields only if they have a value
    if (formData.phone) {
      submissionData.append('phone', formData.phone);
    }

    // Send address fields separately, not combined
    submissionData.append('address', formData.address);
    submissionData.append('city', formData.city);
    submissionData.append('postalCode', formData.postalCode);
    submissionData.append('country', formData.country);

    if (formData.profilePicture) {
      submissionData.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await register(submissionData);

      // On success, always redirect to login page for a clean auth flow
      setAlert({ show: true, type: 'success', message: 'Account created successfully! Please log in.' });
      setTimeout(() => {
        navigate('/Login');
      }, 2000);

    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response) {
        if (error.response.status === 422) {
          // Laravel validation errors
          setErrors(error.response.data.errors);
          errorMessage = 'Please correct the highlighted errors in the form.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      console.error('Registration error:', error);
      setAlert({ show: true, type: 'error', message: errorMessage });
      setIsLoading(false); // Stop loading only on error
    }
  };

  // --- STYLING (No Changes) ---
  const inputWrapperClass = "tw-relative";
  const inputFieldBaseClass = "tw-w-full tw-rounded-lg tw-py-3 tw-text-sm tw-text-gray-200 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[#FFB700]";
  const inputFieldWithIconClass = `${inputFieldBaseClass} tw-bg-gray-900/50 tw-border tw-border-white/10 tw-pl-12 tw-pr-4`;
  const inputFieldPasswordClass = `${inputFieldBaseClass} tw-bg-gray-900/50 tw-border tw-border-white/10 tw-pl-12 tw-pr-12`;
  const iconClass = "tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400";

  return (
    <div
      className="tw-min-h-screen tw-text-white tw-flex tw-flex-col tw-bg-cover tw-bg-center"
      style={{
        backgroundImage: "linear-gradient(rgba(26, 26, 26, 0.85), rgba(26, 26, 26, 0.85)), url('/images/Cars/Bently.jpg')",
        backgroundAttachment: 'scroll',
      }}
    >
      <header className="tw-py-5 tw-px-6 sm:tw-px-10 md:tw-px-16 relative z-10">
        <Header />
      </header>

      <main className="tw-flex-grow tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-10 tw-px-4 relative z-10">
        <div className="tw-w-full tw-max-w-xl tw-mx-auto tw-text-center">
          <h1 className="tw-text-4xl sm:tw-text-5xl lg:tw-text-6xl tw-font-bold">
            <span className="tw-text-[#FFB700]">Join</span>
            <span> The Elite Fleet</span>
            <span className="tw-text-[#007BFF]">.</span>
          </h1>
          <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg tw-max-w-md tw-mx-auto">
            Create your account to unlock exclusive access to our premium vehicles and seamless rental services.
          </p>

          <div className="tw-mt-10 tw-bg-black/30 backdrop-blur-sm tw-border tw-border-white/10 tw-rounded-xl tw-p-8 sm:tw-p-10 tw-shadow-2xl">
            {alert.show && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ show: false, type: '', message: '' })}
              />
            )}
            
            <form onSubmit={handleSubmit} className="tw-space-y-5">
              
              <div>
                <div className={inputWrapperClass}>
                  <User size={18} className={iconClass} />
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputFieldWithIconClass} required />
                </div>
                {/* REFINED: Use 'fullName' to match backend error key */}
                {errors.fullName && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.fullName[0]}</p>}
              </div>

              <div className="tw-grid sm:tw-grid-cols-2 tw-gap-5">
                <div>
                  <div className={inputWrapperClass}>
                    <Phone size={18} className={iconClass} />
                    <input type="tel" name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {/* REFINED: Use 'phone' to match backend error key */}
                  {errors.phone && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.phone[0]}</p>}
                </div>
                <div>
                  <div className={inputWrapperClass}>
                    <ScanLine size={18} className={iconClass} />
                    <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {/* REFINED: Use 'postalCode' to match backend error key */}
                  {errors.postalCode && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.postalCode[0]}</p>}
                </div>
              </div>

              <div className="tw-grid sm:tw-grid-cols-2 tw-gap-5">
                <div>
                  <div className={inputWrapperClass}>
                    <Building size={18} className={iconClass} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {/* REFINED: Use 'city' to match backend error key */}
                   {errors.city && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.city[0]}</p>}
                </div>
                <div>
                  <div className={inputWrapperClass}>
                    <Globe size={18} className={iconClass} />
                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {/* REFINED: Use 'country' to match backend error key */}
                  {errors.country && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.country[0]}</p>}
                </div>
              </div>

              <div>
                <div className={inputWrapperClass}>
                  <MapPin size={18} className={iconClass} />
                  <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} className={inputFieldWithIconClass} />
                </div>
                {errors.address && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.address[0]}</p>}
              </div>
              
              <div>
                <div className={inputWrapperClass}>
                  <Mail size={18} className={iconClass} />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputFieldWithIconClass} required />
                </div>
                {errors.email && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.email[0]}</p>}
              </div>

              <div>
                <div className={inputWrapperClass}>
                  <Eye size={18} className={`${iconClass} pointer-events-none`} /> 
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputFieldPasswordClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="tw-absolute tw-right-4 tw-top-1/2 -tw-translate-y-1/2 tw-border-0 tw-bg-transparent tw-p-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} className="tw-text-gray-400" /> : <Eye size={18} className="tw-text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.password[0]}</p>}
              </div>

              <div>
                <label
                  htmlFor="profilePictureInput"
                  className="tw-w-full tw-h-28 tw-border-2 tw-border-dashed tw-border-gray-500 tw-rounded-lg tw-flex tw-flex-col tw-items-center tw-justify-center tw-cursor-pointer hover:tw-border-[#FFB700] hover:tw-bg-gray-900/70 tw-transition-colors"
                >
                  <input
                    type="file"
                    id="profilePictureInput"
                    name="profilePicture"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="tw-hidden"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile preview" className="tw-w-24 tw-h-24 tw-object-cover tw-rounded-full" />
                  ) : (
                    <>
                      <CloudUpload size={32} className="tw-text-gray-400 tw-mb-2" />
                      <span className="tw-text-gray-400 tw-text-sm">Upload Profile Picture (Optional)</span>
                    </>
                  )}
                </label>
                {formData.profilePicture && (
                  <p className="tw-text-xs tw-text-gray-400 tw-mt-2 tw-text-center">
                    Selected: {formData.profilePicture.name}
                  </p>
                )}
                {/* REFINED: Use 'profilePicture' to match backend error key */}
                {errors.profilePicture && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-center">{errors.profilePicture[0]}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="tw-w-full tw-bg-[#FFB700] hover:tw-bg-yellow-500 disabled:tw-bg-yellow-700 tw-text-black tw-font-bold tw-py-3.5 tw-rounded-lg tw-transition-colors tw-shadow-lg tw-shadow-yellow-500/20 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="tw-text-center tw-text-sm tw-text-gray-400 tw-mt-8">
            Already have an Account?{' '}
            <Link to="/Login" className="tw-font-semibold tw-text-[#FFB700] hover:tw-underline">
              Login Here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpClient;