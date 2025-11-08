import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Menu, X } from "lucide-react";
import logo from '../assets/images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchMeThunk } from '../store/index.js';
import LogoutModal from './LogoutModel.jsx';
import { userProfileIcon, maleProfileIcon, femaleProfileIcon } from '../assets/images/index.js';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const isLoggedIn = useSelector((s) => Boolean(s?.auth?.token));
  const user = useSelector((s) => s?.auth?.user);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Ensure user profile is loaded when logged in
  useEffect(() => {
    if (isLoggedIn && !user) {
      dispatch(fetchMeThunk());
    }
  }, [isLoggedIn, user, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;

    const navItems = navRef.current.querySelectorAll('a');
    const activeLink = Array.from(navItems).find(link => link.getAttribute('href') === activePath);

    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const containerRect = navRef.current.getBoundingClientRect();

      indicatorRef.current.style.width = `${rect.width}px`;
      indicatorRef.current.style.left = `${rect.left - containerRect.left}px`;
    } else {
      indicatorRef.current.style.width = `0px`;
    }
  }, [activePath]);

  const handlePageClick = (path, state) => (e) => {
    e.preventDefault();
    setActivePath(path);
    navigate(path, { state });
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => activePath === path;

  // Close profile menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isProfileMenuOpen]);

  const getProfileImage = () => {
    const gender = (user?.gender || '').toString().toLowerCase();
    if (gender.startsWith('m')) return maleProfileIcon;
    if (gender.startsWith('f')) return femaleProfileIcon;
    return userProfileIcon;
  };

  const getFirstName = () => {
    const rawName = user?.firstName
      || user?.first_name
      || (typeof user?.name === 'string' ? user.name : null)
      || (typeof user?.fullName === 'string' ? user.fullName : null)
      || (typeof user?.email === 'string' ? user.email.split('@')[0] : null)
      || null;
    if (rawName && typeof rawName === 'string') {
      const trimmed = rawName.trim();
      if (!trimmed) return '';
      return trimmed.split(/\s+/)[0];
    }
    return '';
  };

  return (
    <header className={`static top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-gray-100/95 backdrop-blur-md shadow-md border-b border-gray-200" : "bg-transparent"}`}>
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <a href="/" onClick={handlePageClick('/')} className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <img src={logo} alt="NextStop Logo" className="object-contain w-10 h-10" />
            </div>
            <span className="hidden font-bold sm:inline-block gradient-text text-2xl">
              NextStop
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden md:flex md:relative items-center gap-6">
          <a
            href="/"
            onClick={handlePageClick('/')}
            className={`text-sm font-medium hover:text-primary ${isActive('/') ? 'text-blue-700' : 'text-gray-700'}`}
          >
            Home
          </a>

          <a
            href="/search"
            onClick={handlePageClick('/search')}
            className={`text-sm font-medium hover:text-primary ${isActive('/search') ? 'text-blue-700' : 'text-gray-700'}`}
          >
            Search Flights
          </a>

          <a
            href="/support"
            onClick={handlePageClick('/support')}
            className={`text-sm font-medium hover:text-primary ${isActive('/support') ? 'text-blue-700' : 'text-gray-700'}`}
          >
            Support
          </a>

          {/* Active Indicator */}
          <div id="active-indicator" ref={indicatorRef} className="absolute -bottom-2 h-0.5 bg-blue-600 transition-all duration-300" />
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop Auth Area */}
          <div className="hidden md:flex gap-2 items-center">
            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
              <button 
                type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="text-sm font-medium text-gray-700">{`Hi${getFirstName() ? ", " + getFirstName() : ''}`}</span>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-1 z-50">
                    <button
                      onClick={handlePageClick('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handlePageClick('/bookings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Bookings
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsLogoutOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={handlePageClick('/signup')}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-4xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
                <button 
                  onClick={handlePageClick('/login')}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-4 py-2 rounded-4xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-600 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-100 border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="/" onClick={handlePageClick('/')} className="text-sm font-medium text-gray-700">Home</a>
            <a href="/search" onClick={handlePageClick('/search')} className="text-sm font-medium text-gray-700">Search Flights</a>
            <a href="/support" onClick={handlePageClick('/support')} className="text-sm font-medium text-gray-700">Support</a>

            {/* Mobile Auth Area */}
            {isLoggedIn ? (
              <div className="mt-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-200">
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                  />
                  <div className="text-gray-800 font-medium">
                    {`Hi${getFirstName() ? ", " + getFirstName() : ''}`}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <button
                    onClick={handlePageClick('/profile')}
                    className="w-full text-left px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handlePageClick('/bookings')}
                    className="w-full text-left px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    My Bookings
                  </button>
              <button 
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                    className="w-full text-left px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                Logout
              </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handlePageClick('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
                <button 
                  onClick={handlePageClick('/signup')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-md hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          dispatch(logout());
          setIsLogoutOpen(false);
          setIsMenuOpen(false);
          navigate('/');
        }}
      />
    </header>
  );
}

export default Header