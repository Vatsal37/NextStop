import React from 'react'
import PassengerDetails from './PassengerInfo'

function PassengerDetailsSection() {
  return (
    <div className="px-9 py-9">
        <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight">
          PASSENGER DETAILS
        </h1>
        <div className="mt-4">
          <PassengerDetails />
        </div>
      </div>
  )
}

export default PassengerDetailsSection