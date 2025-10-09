import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AirIndia, BritishAirlines, Empirates, Indigo, QatarAirways, SingaporeAirlines, TurkishAirlines, Vistara } from '../assets/images';

const AirlinesCarousel = () => {
  const swiperRef = useRef(null);

  const airlines = [
    { id: 1, name: 'AIR INDIA', image: AirIndia },
    { id: 2, name: 'BRITISH AIRWAYS', image: BritishAirlines },
    { id: 3, name: 'EMIRATES', image: Empirates },
    { id: 4, name: 'INDIGO', image: Indigo },
    { id: 5, name: 'QATAR AIRWAYS', image: QatarAirways },
    { id: 6, name: 'SINGAPORE AIRLINES', image: SingaporeAirlines },
    { id: 7, name: 'TURKISH AIRLINES', image: TurkishAirlines },
    { id: 8, name: 'VISTARA', image: Vistara },
  ];

  useEffect(() => {
    // Import Swiper CSS
    const swiperCSS = document.createElement('link');
    swiperCSS.rel = 'stylesheet';
    swiperCSS.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    document.head.appendChild(swiperCSS);

    // Import Swiper JS
    const swiperScript = document.createElement('script');
    swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
    swiperScript.async = true;
    
    swiperScript.onload = () => {
      if (window.Swiper && swiperRef.current) {
        new window.Swiper(swiperRef.current, {
          effect: 'coverflow',
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          coverflowEffect: {
            rotate: 30,
            stretch: 0,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          },
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          breakpoints: {
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          },
        });
      }
    };
    
    document.body.appendChild(swiperScript);

    return () => {
      if (document.head.contains(swiperCSS)) {
        document.head.removeChild(swiperCSS);
      }
      if (document.body.contains(swiperScript)) {
        document.body.removeChild(swiperScript);
      }
    };
  }, []);

  return (
    <div className="relative pb-8">
          <div ref={swiperRef} className="swiper swiper-coverflow">
            <div className="swiper-wrapper">
              {airlines.map((airline) => (
                <div key={airline.id} className="swiper-slide">
                  <div className="relative w-full max-w-sm mx-auto h-80 overflow-hidden group cursor-pointer transition-all duration-300 rounded-3xl shadow-lg swiper-slide-active:shadow-2xl will-change-transform" style={{ borderRadius: '1.5rem' }}>
                    {/* Background Image */}
                    <img
                      src={airline.image}
                      alt={airline.name}
                      className="w-full h-full object-cover will-change-transform"
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                    />
                    
                    {/* Bottom Section with Airline Name and Arrow */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-8 py-2 flex items-center justify-between">
                      <h3 className="text-gray-900 font-bold text-base tracking-wide">
                        {airline.name}
                      </h3>
                      
                      {/* Arrow Button */}
                      <div className="bg-sky-400 rounded-full p-3 flex items-center justify-center hover:bg-sky-500 transition-colors">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};

export default AirlinesCarousel;
