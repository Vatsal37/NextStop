import React from 'react'
import FlightCard from '../components/FlightCard'

function FlightCardTest() {
  // Sample flight data for testing - matching backend format
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const sampleFlight = {
    schedule_id: 1,
    flight_number: 'AI100',
    flight_date: today, // Flight date
    departure_time: '08:00:00', // Backend format: HH:mm:ss
    arrival_time: '10:30:00',   // Backend format: HH:mm:ss
    source_code: 'DEL',
    source_city: 'Delhi',
    destination_code: 'BOM',
    destination_city: 'Mumbai',
    airline_name: 'Air India',
    aircraft_type: 'Airbus A320',
    base_price: 4500,
    tax_amount: 400,
    total_price: 4900,
    currency: 'INR',
    class_name: 'Economy',
    class_code: 'Y'
  }

  const handleViewDetails = (flight) => {
    console.log('View details for flight:', flight)
  }

  const handleBookNow = (flight) => {
    console.log('Book now for flight:', flight)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Flight Card Test Page</h1>
        <p className="text-gray-600 mb-6">This page shows how the FlightCard component looks with sample data:</p>
        
        <FlightCard 
          flight={sampleFlight}
          onViewDetails={handleViewDetails}
          onBookNow={handleBookNow}
        />
        
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Sample Flight Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(sampleFlight, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default FlightCardTest

