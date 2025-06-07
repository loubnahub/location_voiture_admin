import React, { useState, useRef } from 'react'; // Added useRef
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
  Image as ImageIcon 
} from 'lucide-react';
import Header from '../Header/Nav'; 




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
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null); 
  const fileInputRef = useRef(null); 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, profilePicture: null });
      setProfilePicPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    
    alert('Account creation simulated! Check console for data.');
  };

  //  input styles 
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
            <form onSubmit={handleSubmit} className="space-y-5">
               {/* Full Name */}
               <div className={inputWrapperClass}>
                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputFieldClass} required />
                <div className={iconWrapperClass}><User size={18} className="text-gray-400" /></div>
              </div>

              {/* Phone & Postal Code Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className={inputWrapperClass}>
                  <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><Phone size={18} className="text-gray-400" /></div>
                </div>
                <div className={inputWrapperClass}>
                  <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><ScanLine size={18} className="text-gray-400" /></div>
                </div>
              </div>

              {/* City & Country Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className={inputWrapperClass}>
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><Building size={18} className="text-gray-400" /></div>
                </div>
                <div className={inputWrapperClass}>
                  <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputFieldClass} required />
                  <div className={iconWrapperClass}><Globe size={18} className="text-gray-400" /></div>
                </div>
              </div>

              {/* Address */}
              <div className={inputWrapperClass}>
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={inputFieldClass} required />
                <div className={iconWrapperClass}><MapPin size={18} className="text-gray-400" /></div>
              </div>

              {/* Email */}
              <div className={inputWrapperClass}>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputFieldClass} required />
                <div className={iconWrapperClass}><Mail size={18} className="text-gray-400" /></div>
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
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-12 h-full bg-[#3A2D1A] bg-opacity-90 rounded-r-xl"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>


              <div>
                <label
                  htmlFor="profilePictureInput"
                  className={`${inputWrapperClass} w-full h-28 sm:h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-90 transition-opacity`}
                >
                  <input
                    type="file"
                    id="profilePictureInput"
                    name="profilePicture"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/png, image/jpeg, image/jpg" 
                  />
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <CloudUpload size={36} className="text-gray-300 mb-2" />
                      <span className="text-gray-300 text-sm text-center px-2">
                        Upload Profile Picture (Optional)
                      </span>
                    </>
                  )}
                </label>
                {formData.profilePicture && (
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Selected: {formData.profilePicture.name}
                  </p>
                )}
              </div>


              {/* Create Account Button */}
              <button type="submit" className="w-full bg-[#3B2F1C] hover:bg-[#4C3D23] text-gray-200 font-semibold py-3.5 rounded-xl transition-colors shadow-lg">
                Create Account
              </button>
            </form>

            {/* Login link) */}
            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an Account?{' '}
              <a href="#" className="font-semibold text-[#FFB700] hover:underline">
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