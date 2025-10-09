import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

const OPEN_DURATION_MS = 700;
const CLOSE_DURATION_MS = 800; // slower, smoother close

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef(null);
  const openTimeoutRef = useRef(null);

  // Handle external open/close
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // ensure initial hidden state before enabling visibility in the next task
      setIsVisible(false);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = setTimeout(() => setIsVisible(true), 0);
    } else if (isMounted) {
      setIsVisible(false);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => setIsMounted(false), CLOSE_DURATION_MS);
    }
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, []);

  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsMounted(false);
      onClose?.();
    }, CLOSE_DURATION_MS);
  };

  // Lock body scroll when modal is mounted
  useEffect(() => {
    if (isMounted) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMounted]);

  if (!isMounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
         style={{ transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms` }}>
      {/* Backdrop with synced opacity + blur animation */}
      <div
        className="absolute inset-0"
        onClick={handleCloseWithAnimation}
        style={{
          // Keep blur and color constant; animate only opacity for perfect sync
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          transitionProperty: 'opacity',
          transitionTimingFunction: 'ease-in-out',
          transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms`,
          willChange: 'opacity',
          opacity: isVisible ? 1 : 0
        }}
      />
      
      {/* Modal Container */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
           style={{ transitionDuration: `${isVisible ? OPEN_DURATION_MS : CLOSE_DURATION_MS}ms` }}>
        {/* Decorative gradient bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-white to-indigo-600 rounded-t-2xl" />
        
        {/* Modal Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
            <LogOut className="text-teal-700" size={32} strokeWidth={2} />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Logout Confirmation
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Cancel Button */}
            <button
              onClick={handleCloseWithAnimation}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-100 border-r border-r-gray-300 hover:from-red-700 hover:to-red-200 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            
            {/* Logout Button */}
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-100 border-r border-r-gray-300 hover:from-indigo-700 hover:to-indigo-200 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;