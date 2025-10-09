import React from 'react'
import { GoaBeach, IndiaGate, TajMahal, JalMahal, StatueOfUnity } from '../assets/images'

function VistedPlacesSection() {
  return (
    <div className="w-full py-10 mb-16">
      <div className="max-w-9xl mx-auto">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            TOP VISITED PLACES
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg whitespace-pre-line">
            {`Explore breathtaking landscapes, historic sites, and vibrant 
            cities worldwide.`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-6xl scale-90 min-h-[80vh] mx-auto">
          <div className="grid grid-rows-3 gap-6">
              <div
                className="row-span-1 rounded-lg bg-center bg-cover bg-no-repeat relative group overflow-hidden"
                style={{ backgroundImage: `url(${GoaBeach})` }}
                aria-label="Goa Beach"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xl font-bold tracking-wide">Goa Beach</span>
                </div>
              </div>
              <div
                className="row-span-2 rounded-lg bg-center bg-cover bg-no-repeat relative group overflow-hidden"
                style={{ backgroundImage: `url(${IndiaGate})` }}
                aria-label="India Gate"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xl font-bold tracking-wide">India Gate</span>
                </div>
              </div>
          </div>
          <div className="grid grid-rows-3 gap-6">
              <div
                className="row-span-2 rounded-lg bg-center bg-cover bg-no-repeat relative group overflow-hidden"
                style={{ backgroundImage: `url(${TajMahal})` }}
                aria-label="Taj Mahal"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xl font-bold tracking-wide">Taj Mahal</span>
                </div>
              </div>
              <div
                className="row-span-1 rounded-lg bg-center bg-cover bg-no-repeat relative group overflow-hidden"
                style={{ backgroundImage: `url(${JalMahal})` }}
                aria-label="Jal Mahal"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xl font-bold tracking-wide">Jal Mahal</span>
                </div>
              </div>
          </div>
          <div
            className="rounded-lg bg-center bg-cover bg-no-repeat relative group overflow-hidden"
            style={{ backgroundImage: `url(${StatueOfUnity})` }}
            aria-label="Statue of Unity"
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xl font-bold tracking-wide">Statue of Unity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VistedPlacesSection