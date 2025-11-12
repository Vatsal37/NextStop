import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { authApi } from '../services/api.js';
import Toast from './ui/Toast.jsx';
import { signupBGImage, signupCover, logo } from '../assets/images/index.js';
import { useDispatch } from 'react-redux';
import { loginThunk, fetchMeThunk } from '../store/index.js';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const fromPage = location.state?.from || null;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastCode, setToastCode] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSentInitialOTP, setHasSentInitialOTP] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const inputRefs = useRef([]);
  const closeTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (remainingSeconds > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [remainingSeconds]);

  const handleResendOTP = async (isInitial = false) => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!isInitial) {
      setIsResending(true);
    }
    setError('');

    try {
      await authApi.resendOTP({ email });
      // Show toast after OTP is successfully sent
      setToastMessage(`OTP sent to ${email}`);
      setToastCode(200);
      setRemainingSeconds(0); // Reset countdown
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      const remainingSecs = err.response?.data?.remainingSeconds;
      
      if (err.response?.status === 429 && remainingSecs) {
        // Rate limited - start countdown timer, show toast error
        setRemainingSeconds(remainingSecs);
        setToastMessage('Please wait before requesting a new OTP');
        setToastCode(429);
      } else {
        setError(errorMessage);
        // Show error in toast as well
        setToastMessage(errorMessage);
        setToastCode(400);
      }
    } finally {
      if (!isInitial) {
        setIsResending(false);
      }
    }
  };

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }
    setIsOpen(true);
    
    // Don't automatically resend OTP if coming from signup (OTP was already sent during registration)
    // Only auto-resend if coming from login page (user needs a new OTP)
    const fromSignup = fromPage === '/signup';
    if (!hasSentInitialOTP && !fromSignup) {
      setHasSentInitialOTP(true);
      // Send OTP and show toast after it's sent
      handleResendOTP(true);
    } else if (!hasSentInitialOTP && fromSignup) {
      // Mark as sent to prevent auto-resend, but don't actually resend
      // OTP was already sent during registration
      setHasSentInitialOTP(true);
      setToastMessage(`OTP sent to ${email}`);
      setToastCode(200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        if (digits.length === 6) {
          const newOtp = [...otp];
          digits.forEach((digit, i) => {
            if (i < 6) newOtp[i] = digit;
          });
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.verifyEmail({ email, otp: otpCode });
      
      // After successful verification, automatically log the user in if password is available
      const password = location.state?.password || location.state?.formData?.password;
      
      if (password) {
        // Automatically log in the user
        const action = await dispatch(loginThunk({ email, password }));
        if (loginThunk.fulfilled.match(action)) {
          // Fetch complete user data after successful login
          await dispatch(fetchMeThunk());
          setToastMessage('Email verified successfully! You are now logged in.');
          setToastCode(200);
          setTimeout(() => navigate('/'), 1500);
        } else {
          // Login failed, redirect to login page
          setToastMessage('Email verified successfully! Please log in.');
          setToastCode(200);
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        // No password available (direct navigation), redirect to login
        setToastMessage('Email verified successfully! Please log in.');
        setToastCode(200);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      // Navigate back to the page they came from, preserving form data
      if (fromPage) {
        navigate(fromPage, { state: location.state });
      } else {
        // Try to go back in history, fallback to home
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }
    }, 400);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden" onClick={handleBackdropClick}>
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${signupBGImage})`,
          backgroundColor: '#0a1f2b'
        }}
      />
      
      {/* Additional texture overlays */}
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
          <div 
            className="absolute inset-0 z-0 rounded-3xl"
            style={{
              backgroundImage: `url(${signupCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 z-10 bg-black/30 rounded-3xl"></div>
          
          <div className="relative z-20 h-full flex flex-col justify-between">
            <div>
              <img src={logo} alt="logo" className="absolute top-0 left-0 w-12 h-12 object-contain rounded-lg" />
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl text-white font-bold mb-5">
                VERIFY<br />
                YOUR<br />
                EMAIL
              </h2>
              
              <p className="text-white text-base md:text-md mb-3 leading-tight max-w-md font-medium">
                We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>. Please enter it below to complete your registration.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - OTP Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center bg-gray-50 overflow-y-hidden">
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">VERIFY EMAIL</h1>
            <p className="text-gray-600 mb-6">Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{email}</span></p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Verification Code
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-sky-900 hover:bg-sky-950 text-white font-semibold py-3 rounded-lg transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleResendOTP}
                  disabled={isResending || remainingSeconds > 0}
                  className="text-sm font-semibold text-sky-900 hover:text-sky-950 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
                {remainingSeconds > 0 && (
                  <span className="text-sm text-gray-500 font-medium">
                    ({remainingSeconds}s)
                  </span>
                )}
              </div>
            </div>

            {/* Back to Sign Up */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Wrong email?{' '}
              <button 
                onClick={handleBackdropClick}
                className="font-semibold text-gray-900 hover:text-teal-600 hover:underline"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} code={toastCode} />
    </div>
  );
}

export default VerifyEmail;

