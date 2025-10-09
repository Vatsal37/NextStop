import React from 'react';
import AirlinesCarousel from './AirlinesCarousel';

const AirlinesSection = () => {
  return (
    <div className="w-full py-24">
      <div className="max-w-9xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            MOST POPULAR AIRLINES
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg whitespace-pre-line">
            {`The world's leading airlines offer top-notch service, ensuring 
            memorable travel experiences for passengers.`}
          </p>
        </div>

        {/* Airlines Carousel */}
        <AirlinesCarousel />
      </div>
    </div>
  );
};

export default AirlinesSection;