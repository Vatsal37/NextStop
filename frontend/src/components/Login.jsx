import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { loginCover, logo, loginBGImage } from '../assets/images/index.js';
import Toast from './ui/Toast.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../store/index.js';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const closeTimeoutRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastCode, setToastCode] = useState(0);
  const auth = useSelector((s) => s.auth);

  const handleSubmit = async () => {
    if (!email || !password) {
      setToastMessage('Please enter email and password');
      setToastCode(400);
      return;
    }
    const action = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(action)) {
      setToastMessage('Login successful');
      setToastCode(200);
      setTimeout(() => navigate('/'), 800);
    } else {
      setToastMessage(action.payload || 'Invalid credentials');
      setToastCode(401);
    }
  };

  useEffect(() => {
    // Restart enter animation on mount and when navigated back to this route
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
  }, [location.pathname]);

  const handleBackdropClick = () => {
    // Play exit animation then navigate
    setIsOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      navigate('/');
    }, 400); // match duration-500
  };

  return (
    <div className="h-screen flex items-center justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden" onClick={handleBackdropClick}>
      {/* Background with ocean/water texture effect */}

      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginBGImage})`,
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
      <div className={`relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row border-9 border-white transform transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-0 right-0 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
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
              backgroundImage: `url(${loginCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 z-10 bg-black/30 rounded-3xl"></div>
          
          {/* Gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 via-cyan-900/50 to-slate-900/70"/> */}
          
          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-between">
            <div>
              {/* <h1 className="text-2xl font-bold mb-16">LOGO</h1> */}
              <img src={logo} alt="logo" className="absolute top-0 left-0 w-12 h-12 object-contain" />
            </div>
            
            {/* <div>
              <h2 className="text-4xl md:text-5xl text-gray-800 font-bold leading-tight mb-6">
                YOUR<br />
                NEXT ADVENTURE<br />
                AWAITS!
              </h2>
              
              <p className="text-gray-200 text-base md:text-lg mb-4 leading-relaxed max-w-md">
                Log in to unlock exclusive deals, plan your dream escapes, and pick up where you left off. Whether it's mountains, beaches, or city lights
              </p>
              
              <p className="text-gray-100 text-lg font-medium">
                Your journey starts here.
              </p>
            </div> */}
            <div>
                <h2 
                    className="text-4xl md:text-5xl text-white font-bold mb-5"
                    // style={{ textShadow: '2px 2px 8px rgba(255,255,255,0.5)' }}
                >
                    YOUR<br />
                    NEXT ADVENTURE<br />
                    AWAITS!
                </h2>
                
                <p 
                    className="text-white text-base md:text-md mb-3 leading-tight max-w-md font-medium"
                    // style={{ textShadow: '1px 1px 4px rgba(255,255,255,0.3)' }}
                >
                    Log in to unlock exclusive deals, plan your dream escapes, and pick up where you left off. Whether it's mountains, beaches, or city lights
                </p>
                
                <p 
                    className="text-white text-md font-medium"
                    // style={{ textShadow: '1px 1px 4px rgba(255,255,255,0.3)' }}
                >
                    Your journey starts here.
                </p>
            </div>
          </div>

          {/* Decorative bird silhouette */}
          {/* <div className="absolute bottom-32 right-8 md:right-12 opacity-70">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 5C28 8 26 12 25 15C24 12 22 8 20 5C18 8 15 12 13 16C12 14 10 11 8 9C10 12 12 16 13 20C10 18 7 16 4 15C7 17 11 20 14 23C11 22 8 21 5 20C8 22 12 25 16 28C13 27 10 26 7 25C10 27 14 30 18 33L15 32C17 34 20 36 23 38C20 37 17 36 14 35C17 37 21 40 25 42C30 45 35 45 40 42C44 40 48 37 51 35C48 36 45 37 42 38C45 36 48 34 51 32L48 33C52 30 56 27 59 25C56 26 53 27 50 28C54 25 58 22 61 20C58 21 55 22 52 23C55 20 59 17 62 15C59 16 56 18 53 20C54 16 56 12 58 9C56 11 54 14 53 16C51 12 48 8 46 5C44 8 42 12 41 15C40 12 38 8 36 5Z" fill="#1e293b"/>
            </svg>
            </div> */}
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">WELCOME BACK !</h1>
            <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>

            <div>
              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button className="text-sm font-semibold text-gray-900 hover:text-teal-600 hover:underline">
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-sky-900 hover:bg-sky-950 text-white font-semibold py-3 rounded-lg transition duration-200 mb-4"
              >
                Sign in
              </button>

              {/* Google Sign In */}
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
                Sign in with Google
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <button className="font-semibold text-gray-900 hover:text-teal-600">
                  Sign up
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

export default Login;