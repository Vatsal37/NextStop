import React, { useEffect, useState } from 'react'
import { plane } from '../assets/images/index.js'

function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='container h-screen mt-32 flex flex-col items-center relative overflow-hidden'>
        <h3 
          className='text-xl text-center text-gray-700 relative transition-all duration-300 ease-out'
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.003)
          }}
        >
          READY TAKE-OFF
        </h3>
        <h1 
          className='whitespace-pre-line text-center text-7xl font-extrabold tracking-normal text-gray-900 leading-none transition-all duration-300 ease-out'
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.002)
          }}
        >
            {`CONVENIENT ONLINE
            FLIGHT BOOKING SERVICES`}
        </h1>
        <img 
          src={plane} 
          alt="plane3d" 
          className='absolute z-30 scale-65 top-7.5 left-10 transition-all duration-300 ease-out'
          style={{
            transform: `translateY(${scrollY * 0.7}px) translateX(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.0015)
          }}
        />
    </div>
  )
}

export default HeroSection