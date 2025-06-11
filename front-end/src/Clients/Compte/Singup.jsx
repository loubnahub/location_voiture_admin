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
import Header from '../Header/Nav'; // Assuming Header/Nav.jsx is the correct path
import apiClient from '../../services/api'; // Assuming services/api.js is correct

// --- Alert Component ---
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
    fullName: '', // Corresponds to 'name' in backend for users
    phone: '',
    postalCode: '', // This might be part of 'address' or a separate field if your User model has it
    city: '',     // This might be part of 'address'
    country: '',  // This might be part of 'address'
    address: '',  // Full address string
    email: '',
    password: '',
    profilePicture: null, // Corresponds to 'profile_photo_path' or similar after upload
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setAlert({ show: false, type: '', message: '' });

    // --- Prepare data for backend ---
    // Your backend likely expects 'name' instead of 'fullName'.
    // Address fields (postalCode, city, country) might need to be combined
    // or sent as separate fields if your backend supports that for user registration.
    // For this example, I'll assume a typical Laravel Jetstream/Sanctum registration endpoint.
    const submissionData = new FormData();
    submissionData.append('name', formData.fullName); // Corrected: fullName to name
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    // submissionData.append('password_confirmation', formData.password); // Often required

    // Optional fields (adjust based on your backend User model and validation)
    if (formData.phone) submissionData.append('phone_number', formData.phone); // Example: 'phone_number'
    
    // Combine address parts or send separately if your backend handles it
    let fullAddress = formData.address;
    if(formData.city) fullAddress += `, ${formData.city}`;
    if(formData.postalCode) fullAddress += `, ${formData.postalCode}`;
    if(formData.country) fullAddress += `, ${formData.country}`;
    if (fullAddress.trim() !== '') submissionData.append('address', fullAddress.trim());

    if (formData.profilePicture) {
      submissionData.append('profile_photo', formData.profilePicture); // 'profile_photo' is common with Jetstream
    }

    try {
      // Assuming your apiClient is set up for Sanctum CSRF
      await apiClient.get('/sanctum/csrf-cookie');
      const response = await apiClient.post('/register', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      // After successful registration, you might want to log the user in automatically
      // or redirect to a login page.
      // If the /register endpoint logs the user in and returns user data/token:
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        setAlert({ show: true, type: 'success', message: 'Account created successfully! Redirecting...' });
        setTimeout(() => {
          navigate('/home'); // Or to a user dashboard if you have one
        }, 2000);
      } else {
         // If registration is successful but doesn't auto-login
        setAlert({ show: true, type: 'success', message: 'Account created successfully! Please log in.' });
        setTimeout(() => {
          navigate('/Login'); // Navigate to client login page
        }, 2000);
      }

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
    } finally {
      // Only set loading to false if not redirecting (i.e., on error)
      if (!localStorage.getItem('authToken') && !(alert.type === 'success' && alert.show)) {
         setIsLoading(false);
      }
    }
  };

  // --- STYLING: Merge of both designs, favoring the "tw-" prefix for consistency ---
  const inputWrapperClass = "tw-relative"; // From HEAD
  // Base for input field, then specific styling
  const inputFieldBaseClass = "tw-w-full tw-rounded-lg tw-py-3 tw-text-sm tw-text-gray-200 placeholder:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[#FFB700]";
  
  // Specific styling for inputs (from HEAD, adjusted for icon padding)
  const inputFieldWithIconClass = `${inputFieldBaseClass} tw-bg-gray-900/50 tw-border tw-border-white/10 tw-pl-12 tw-pr-4`;
  // Specific styling for password input (for show/hide button)
  const inputFieldPasswordClass = `${inputFieldBaseClass} tw-bg-gray-900/50 tw-border tw-border-white/10 tw-pl-12 tw-pr-12`;
  
  const iconClass = "tw-absolute tw-left-4 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400"; // From HEAD

  return (
    <div
      className="tw-min-h-screen tw-text-white tw-flex tw-flex-col tw-bg-cover tw-bg-center"
      style={{
        backgroundImage: "linear-gradient(rgba(26, 26, 26, 0.85), rgba(26, 26, 26, 0.85)), url('/images/Cars/Bently.jpg')",
        backgroundAttachment: 'scroll', // Keep scroll for potentially long pages
      }}
    >
      <header className="tw-py-5 tw-px-6 sm:tw-px-10 md:tw-px-16 relative z-10"> {/* Added z-10 */}
        <Header />
      </header>

      <main className="tw-flex-grow tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-10 tw-px-4 relative z-10"> {/* Added z-10 */}
        <div className="tw-w-full tw-max-w-xl tw-mx-auto tw-text-center"> {/* Changed max-w-4xl to max-w-xl for a tighter form */}
          <h1 className="tw-text-4xl sm:tw-text-5xl lg:tw-text-6xl tw-font-bold">
            <span className="tw-text-[#FFB700]">Join</span>
            <span> The Elite Fleet</span>
            <span className="tw-text-[#007BFF]">.</span>
          </h1>
          <p className="tw-mt-4 tw-text-gray-300 tw-text-base sm:tw-text-lg tw-max-w-md tw-mx-auto"> {/* Changed max-w-2xl to max-w-md */}
            Create your account to unlock exclusive access to our premium vehicles and seamless rental services.
          </p>

          <div className="tw-mt-10 tw-bg-black/30 backdrop-blur-sm tw-border tw-border-white/10 tw-rounded-xl tw-p-8 sm:tw-p-10 tw-shadow-2xl"> {/* Glassmorphism card */}
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
                {errors.name && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.name[0]}</p>}
                {/* Note: Laravel errors for 'name' if you send 'fullName' and map it to 'name' */}
              </div>

              <div className="tw-grid sm:tw-grid-cols-2 tw-gap-5">
                <div>
                  <div className={inputWrapperClass}>
                    <Phone size={18} className={iconClass} />
                    <input type="tel" name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {errors.phone_number && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.phone_number[0]}</p>}
                  {/* Note: errors.phone if backend expects 'phone' */}
                </div>
                <div>
                  <div className={inputWrapperClass}>
                    <ScanLine size={18} className={iconClass} />
                    <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {/* Error display for combined address or specific postal_code error */}
                  {errors.address && errors.address[0].includes("postal code") && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.address[0]}</p>}
                  {errors.postal_code && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.postal_code[0]}</p>}
                </div>
              </div>

              <div className="tw-grid sm:tw-grid-cols-2 tw-gap-5">
                <div>
                  <div className={inputWrapperClass}>
                    <Building size={18} className={iconClass} />
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                   {errors.address && errors.address[0].includes("city") && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.address[0]}</p>}
                   {errors.city && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.city[0]}</p>}
                </div>
                <div>
                  <div className={inputWrapperClass}>
                    <Globe size={18} className={iconClass} />
                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputFieldWithIconClass} />
                  </div>
                  {errors.address && errors.address[0].includes("country") && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-left">{errors.address[0]}</p>}
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
                  {/* Using Eye as placeholder, actual icon button is separate */}
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
                {errors.profile_photo && <p className="tw-text-red-400 tw-text-xs tw-mt-1 tw-text-center">{errors.profile_photo[0]}</p>}
                 {/* Note: errors.profilePicture if backend expects that */}
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
            <Link to="/Login" className="tw-font-semibold tw-text-[#FFB700] hover:tw-underline"> {/* Changed to /Login for client login */}
              Login Here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpClient;