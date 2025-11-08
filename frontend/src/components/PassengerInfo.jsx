import React, { useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function PassengerDetails() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    nationality: ''
  })

  // Common nationalities list with ISO country codes
  const nationalityOptions = [
    { value: 'indian', label: 'Indian', code: 'IN' },
    { value: 'american', label: 'American', code: 'US' },
    { value: 'british', label: 'British', code: 'GB' },
    { value: 'canadian', label: 'Canadian', code: 'CA' },
    { value: 'australian', label: 'Australian', code: 'AU' },
    { value: 'german', label: 'German', code: 'DE' },
    { value: 'french', label: 'French', code: 'FR' },
    { value: 'japanese', label: 'Japanese', code: 'JP' },
    { value: 'chinese', label: 'Chinese', code: 'CN' },
    { value: 'other', label: 'Other', code: 'XX' }
  ]

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='flex items-center'>
      <div className='h-fit mx-auto w-full px-4 pt-2 pb-2.5 bg-white rounded-xl border border-gray-200'>
        <h1 className='text-xl font-medium text-gray-900 leading-none tracking-tight mt-2 mb-4'>Passenger 1</h1>
        <div className='grid grid-cols-2 gap-4'>
          {/* Row 1: First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Row 1: Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Row 2: Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <DatePicker
              date={formData.dateOfBirth}
              onDateChange={(date) => handleInputChange('dateOfBirth', date)}
              placeholder="Pick a date"
              className="w-full h-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              disabled={(date) => date > new Date()}
            />
          </div>

          {/* Row 2: Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className="w-full h-12 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-teal-500 transition-colors bg-white">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <Select 
              value={formData.nationality || undefined} 
              onValueChange={(value) => handleInputChange('nationality', value)}
            >
              <SelectTrigger className="w-full h-12 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-teal-500 transition-colors bg-white">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className='flex items-center justify-between gap-3'>
                      <span>{option.label}</span>
                      <span className='text-xs text-gray-500 font-mono'>{option.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PassengerDetails