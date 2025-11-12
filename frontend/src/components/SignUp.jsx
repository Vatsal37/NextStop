import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { authApi } from '../services/api.js';
import { loginThunk, fetchMeThunk } from '../store/index.js';
import Toast from './ui/Toast.jsx';
import { signupBGImage, signupCover, logo } from '../assets/images/index.js';
import { validatePassword } from '../utils/passwordValidation.js';

// Placeholder images - replace with your actual imports

function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastCode, setToastCode] = useState(0);
  const closeTimeoutRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: location.state?.formData?.firstName || '',
    lastName: location.state?.formData?.lastName || '',
    email: location.state?.formData?.email || '',
    password: location.state?.formData?.password || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    const requiredFields = Object.keys(formData);
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate password format
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      const errorMessage = passwordValidation.errors[0];
      setError(''); // Clear inline error
      setToastMessage(errorMessage);
      setToastCode(400);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Register the user
      const response = await authApi.register(formData);
      
      // Check if backend says to redirect to verification (unverified user)
      if (response.data?.data?.redirectToVerification) {
        setToastMessage('Please verify your email to continue.');
        setToastCode(200);
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`, { state: { from: '/signup', formData } }), 1500);
        return;
      }
      
      // Show success message and redirect to email verification
      setToastMessage('Registration successful! Please verify your email.');
      setToastCode(201);
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`, { state: { from: '/signup', formData } }), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      
      // Check if it's an email already exists error
      if (errorMessage.toLowerCase().includes('email') && (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('registered') || err.response?.status === 409)) {
        setToastMessage('This email is already registered. Please use a different email or sign in.');
        setToastCode(409);
        setError(''); // Clear inline error
      } else {
        // Show other errors inline
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    const rafId = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleBackdropClick = () => {
    setIsOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      navigate('/');
    }, 400);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden" onClick={handleBackdropClick}>
      {/* Background with ocean/water texture effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${signupBGImage})`,
          backgroundColor: '#0a1f2b'
        }}
      />
      
      {/* Additional ocean texture overlays */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(79, 209, 197, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 40% 80%, rgba(26, 188, 156, 0.1) 0%, transparent 50%)`
      }}/>

      {/* Main Container */}
      <div className={`relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row border-9 border-white transform transition-all duration-500 ease-in-out my-8 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={handleBackdropClick}
          aria-label="Close"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Panel - Hero Section */}
        <div className="relative w-full md:w-1/2 p-6 md:p-8 text-white overflow-hidden">
          {/* Background with ocean marble texture */}
          <div 
            className="absolute inset-0 z-0 rounded-3xl"
            style={{
              backgroundImage: `url(${signupCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 z-10 bg-black/30 rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-between">
            <div>
              <img src={logo} alt="logo" className="absolute top-0 left-0 w-12 h-12 object-contain rounded-lg" />
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl text-white font-bold mb-5">
                START<br />
                YOUR JOURNEY<br />
                TODAY!
              </h2>
              
              <p className="text-white text-base md:text-md mb-3 leading-tight max-w-md font-medium">
                Create your account to search and book flights faster, save traveler details, and get exclusive travel deals.
              </p>
              
              <p className="text-white text-md font-medium">
                Adventure is just a click away.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - SignUp Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-gray-50 overflow-y-hidden">
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">CREATE ACCOUNT</h1>
            <p className="text-gray-600 mb-6">Book flights faster and manage your trips with ease.</p>

            <div>
              {/* Name Fields - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2.5 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                  <p>Must be at least 8 characters, include a number and a special character.</p>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-sky-900 hover:bg-sky-950 text-white font-semibold py-3 rounded-lg transition duration-200 mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Google Sign Up */}
              <button
                type="button"
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3818 13.3 14.6727 14.3591 13.6091 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4"/>
                  <path d="M10.2 20C12.9 20 15.1636 19.1045 16.8273 17.5773L13.6091 15.0682C12.7091 15.6682 11.5545 16.0227 10.2 16.0227C7.59545 16.0227 5.39091 14.2636 4.58636 11.9H1.25455V14.4909C2.90909 17.7591 6.29091 20 10.2 20Z" fill="#34A853"/>
                  <path d="M4.58636 11.9C4.39091 11.3 4.27727 10.6591 4.27727 10C4.27727 9.34091 4.39091 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC05"/>
                  <path d="M10.2 3.97727C11.6818 3.97727 13.0045 4.48182 14.0409 5.47273L16.8909 2.62273C15.1591 0.986364 12.8955 0 10.2 0C6.29091 0 2.90909 2.24091 1.25455 5.50909L4.58636 8.1C5.39091 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className="font-semibold text-gray-900 hover:text-teal-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} code={toastCode} />
    </div>
  );
}

export default SignUp;