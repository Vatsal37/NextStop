import React from 'react'

function VistedPlacesSection() {
  return (
    <div className="w-full py-24">
      <div className="max-w-9xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            TOP VISITED PLACES
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg whitespace-pre-line">
            {`Explore breathtaking landscapes, historic sites, and vibrant 
            cities worldwide.`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default VistedPlacesSection