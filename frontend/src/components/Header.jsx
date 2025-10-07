import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Menu, X } from "lucide-react";
import logo from '../assets/images/logo.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

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
  };

  const isActive = (path) => activePath === path;

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-gray-100/95 backdrop-blur-md shadow-md border-b border-gray-200" : "bg-transparent"}`}>
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <a href="/" onClick={handlePageClick('/')} className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <img src={logo} alt="NextStop Logo" className="object-contain w-10 h-10" />
            </div>
            <span className="hidden font-bold sm:inline-block gradient-text text-lg">
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
          {/* Desktop Login Button */}
          <div className="hidden md:block">
            <button 
              onClick={handlePageClick('/login')}
              className="bg-gradient-to-l from-indigo-600 to-white hover:from-indigo-800 hover:to-white text-white px-4 py-2 rounded-4xl cursor-pointer transition-all duration-200"
            >
              Login
            </button>
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
            <a href="/support" onClick={handlePageClick('/support')} className="text-sm font-medium text-gray-700">Support</a>

            {/* Mobile Login Button */}
            <button 
              onClick={handlePageClick('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-indigo-600 transition-all duration-200"
            >
              Login
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header