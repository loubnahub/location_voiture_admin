import React, { useState, useRef } from 'react';
import { User, Phone, Mail, Eye, MapPin, Building, Globe, ScanLine, CloudUpload, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Nav';
import apiClient from '../../services/api';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

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
  
  // 2. ADD STATE FOR OUR CUSTOM ALERT
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
    } else {
      setFormData({ ...formData, profilePicture: null });
      setProfilePicPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setAlert({ show: false, type: '', message: '' }); // Hide previous alerts

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submissionData.append(key, formData[key]);
      }
    });

    try {
      const response = await apiClient.post('/register', submissionData);
      
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // 3. SHOW A SUCCESS ALERT
      setAlert({ show: true, type: 'success', message: 'Account created successfully! Redirecting...' });

      // Redirect after a short delay so the user can read the message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      // 4. SHOW AN ERROR ALERT
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        setAlert({ show: true, type: 'error', message: 'Please correct the highlighted errors in the form.' });
      } else {
        console.error('An unexpected error occurred:', error);
        setAlert({ show: true, type: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      // Don't turn off loading on success because we are redirecting
      if (!localStorage.getItem('authToken')) {
         setIsLoading(false);
      }
    }
  };

  // Your styles remain exactly the same
  const inputBaseClass = "w-full rounded-xl text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB700]/50";
  const inputFieldClass = `${inputBaseClass} bg-transparent py-3 pl-4 pr-12`;
  const inputWrapperClass = "relative flex items-center bg-[#4A3B20] bg-opacity-80 border border-[#6B5B3E] border-opacity-60 rounded-xl shadow-md";
  const iconWrapperClass = "absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full bg-[#3A2D1A] bg-opacity-90 rounded-r-xl pointer-events-none";

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <div
        className="absolute inset-0 h-[114%] bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: "url('/images/Cars/Bently.jpg')" }}
      ></div>

      <header className="relative z-50 py-5 px-6 sm:px-10 md:px-16">
        <Header />
      </header>

      <main className="relative z-10 flex-grow flex items-center py-10 px-4 sm:px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
              <span className="text-[#FFB700]">Create</span>
              <br />
              Your Account<span className="text-[#007BFF]">.</span>
            </h1>
            <p className="mt-6 text-gray-300 text-base sm:text-lg max-w-md mx-auto lg:mx-0">
              Welcome to LO DRIVE – your trusted partner in smart, flexible car rentals. Sign up in seconds and get access to our full fleet, exclusive offers, and more
            </p>
          </div>

          <div className="w-full max-w-lg mx-auto lg:mx-0">
            {/* 5. RENDER THE ALERT COMPONENT CONDITIONALLY */}
            {alert.show && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ show: false, type: '', message: '' })}
              />
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* All form inputs remain exactly the same, but now show errors below them */}
              <div>
                <div className={inputWrapperClass}>
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><User size={18} className="text-gray-400" /></div>
                </div>
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={inputWrapperClass}>
                    <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={inputFieldClass} />
                    <div className={iconWrapperClass}><Phone size={18} className="text-gray-400" /></div>
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
                </div>
                <div>
                  <div className={inputWrapperClass}>
                    <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className={inputFieldClass} required />
                    <div className={iconWrapperClass}><ScanLine size={18} className="text-gray-400" /></div>
                  </div>
                  {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className={inputWrapperClass}>
                      <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputFieldClass} required />
                      <div className={iconWrapperClass}><Building size={18} className="text-gray-400" /></div>
                    </div>
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city[0]}</p>}
                </div>
                <div>
                    <div className={inputWrapperClass}>
                      <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputFieldClass} required />
                      <div className={iconWrapperClass}><Globe size={18} className="text-gray-400" /></div>
                    </div>
                    {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country[0]}</p>}
                </div>
              </div>
              
              <div>
                <div className={inputWrapperClass}>
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><MapPin size={18} className="text-gray-400" /></div>
                </div>
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address[0]}</p>}
              </div>

              <div>
                <div className={inputWrapperClass}>
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><Mail size={18} className="text-gray-400" /></div>
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
              </div>
              
              <div>
                <div className={inputWrapperClass}>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputFieldClass} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full bg-[#3A2D1A] bg-opacity-90 rounded-r-xl">
                    {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
              </div>

              <div>
                <label htmlFor="profilePictureInput" className={`${inputWrapperClass} w-full h-28 sm:h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-90 transition-opacity`}>
                  <input type="file" id="profilePictureInput" name="profilePicture" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                  {profilePicPreview ? ( <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover rounded-xl" /> ) : (
                    <>
                      <CloudUpload size={36} className="text-gray-300 mb-2" />
                      <span className="text-gray-300 text-sm text-center px-2">Upload Profile Picture (Optional)</span>
                    </>
                  )}
                </label>
                {formData.profilePicture && ( <p className="text-xs text-gray-400 mt-1 text-center">Selected: {formData.profilePicture.name}</p> )}
                {errors.profilePicture && <p className="text-red-400 text-xs mt-1 text-center">{errors.profilePicture[0]}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-[#3B2F1C] hover:bg-[#4C3D23] text-gray-200 font-semibold py-3.5 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an Account?{' '}
              <a href="/login" className="font-semibold text-[#FFB700] hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpClient;