import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Edit, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { fetchMeThunk } from '@/store/index.js'
import { authApi } from '@/services/api.js'
import { profileCoverImage, maleProfileIcon, femaleProfileIcon, userProfileIcon } from '../assets/images/index.js'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router'

function Profile() {
  const user = useSelector((state) => state?.auth?.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    nationality: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  useEffect(() => {}, [formData])

  useEffect(() => {
    if (user) {
      
      
      // Parse date of birth if it exists
      let dob = null
      if (user.date_of_birth) {
        // Handle both Date object and string formats
        const dateStr = user.date_of_birth
        if (typeof dateStr === 'string') {
          // Extract just the date part to avoid timezone issues
          // Handles: "1989-12-31T18:30:00.000Z" or "1989-12-31" or ISO strings
          let dateOnly = dateStr
          if (dateStr.includes('T')) {
            // ISO string - extract just the date part before 'T'
            dateOnly = dateStr.split('T')[0]
          } else if (dateStr.includes(' ')) {
            // Date with space separator - take first part
            dateOnly = dateStr.split(' ')[0]
          }
          
          // Parse YYYY-MM-DD format
          const parts = dateOnly.split('-')
          if (parts.length === 3) {
            const [year, month, day] = parts.map(Number)
            // Create date at noon UTC to avoid timezone conversion issues
            // Using UTC methods ensures the date stays the same regardless of user's timezone
            dob = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)) // noon UTC, month is 0-indexed
            
          } else {
            console.error('Profile: Invalid date format:', dateStr)
          }
        } else if (dateStr instanceof Date) {
          // If already a Date object, extract date components and create at UTC noon
          const year = dateStr.getUTCFullYear()
          const month = dateStr.getUTCMonth()
          const day = dateStr.getUTCDate()
          dob = new Date(Date.UTC(year, month, day, 12, 0, 0))
          
        }
        
        // Validate the date
        if (dob && isNaN(dob.getTime())) {
          console.error('Profile: Invalid date:', dateStr)
          dob = null
        } else if (dob) {
          // Log in both UTC and local for debugging
          
        }
      }
      
      // Normalize gender: DB has 'Male', 'Female', 'Other' (capitalized), form needs lowercase
      const rawGender = (user.gender || '').toString()
      let normalizedGender = ''
      if (rawGender.toLowerCase().startsWith('m') || rawGender === 'Male') {
        normalizedGender = 'male'
      } else if (rawGender.toLowerCase().startsWith('f') || rawGender === 'Female') {
        normalizedGender = 'female'
      } else if (rawGender && rawGender !== '') {
        normalizedGender = 'other'
      }

      // Normalize nationality: DB stores codes like 'US', 'IN', match to our option values
      const normalizeNationality = (nat) => {
        if (!nat) {
          return ''
        }
        const n = nat.toString().trim()
        
        // First try exact code match (case-insensitive)
        const byCode = nationalityOptions.find(o => o.code.toUpperCase() === n.toUpperCase())
        if (byCode) {
          return byCode.value
        }
        
        // Then try label match
        const byLabel = nationalityOptions.find(o => o.label.toLowerCase() === n.toLowerCase())
        if (byLabel) {
          return byLabel.value
        }
        
        // Finally try value match
        const byValue = nationalityOptions.find(o => o.value.toLowerCase() === n.toLowerCase())
        if (byValue) {
          return byValue.value
        }
        
        return ''
      }

      const normalizedNat = normalizeNationality(user.nationality)
      

      const dobLocal = dob ? new Date(dob.getFullYear(), dob.getMonth(), dob.getDate()) : null

      const newFormData = {
        firstName: user.first_name || user.firstName || '',
        lastName: user.last_name || user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: dobLocal,
        gender: normalizedGender,
        nationality: normalizedNat
      }
      
      // Force set the state
      setFormData(() => newFormData)
      
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getProfileImage = () => {
    const gender = (formData.gender || user?.gender || '').toString().toLowerCase()
    if (gender.startsWith('m')) return maleProfileIcon
    if (gender.startsWith('f')) return femaleProfileIcon
    return userProfileIcon
  }

  const getFullName = () => {
    const firstName = formData.firstName || user?.first_name || user?.firstName || ''
    const lastName = formData.lastName || user?.last_name || user?.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Full Name'
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div>
        <div className='w-full aspect-[8/1] relative'>
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
            <img src={profileCoverImage} alt="profile cover image" className='w-full h-full object-cover' />
        </div>
        <div className='w-full relative aspect-[18/1]'>
            <img src={getProfileImage()} alt="profile image" className='w-36 h-36 absolute top-0 left-0 translate-x-1/3 -translate-y-1/2 ring-4 ring-white rounded-full object-cover' />
        </div>
        <div className='px-16'>
            <h1 className='text-3xl font-medium text-gray-900 leading-none tracking-tight mb-3.5'>{getFullName()}</h1>
            <div className='grid grid-cols-2 grid-rows-4 gap-4'>
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
                        disabled={!isEditing}
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
                        disabled={!isEditing}
                    />
                </div>

                {/* Row 2: Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        disabled={!isEditing}
                    />
                </div>

                {/* Row 2: Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        disabled={!isEditing}
                    />
                </div>

                {/* Row 3: Date of Birth */}
                <div className={!isEditing ? "opacity-60 pointer-events-none" : ""}>
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

                {/* Row 3: Gender */}
                <div className={!isEditing ? "opacity-60 pointer-events-none" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                    </label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className="w-full h-12 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-teal-500 transition-colors bg-white" disabled={!isEditing}>
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

                {/* Row 4: Nationality */}
                <div className={!isEditing ? "opacity-60 pointer-events-none" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                    </label>
                    <Select 
                        value={formData.nationality || undefined} 
                        onValueChange={(value) => handleInputChange('nationality', value)}
                    >
                        <SelectTrigger className="w-full h-12 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-teal-500 transition-colors bg-white" disabled={!isEditing}>
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

                {/* Row 4: Edit/Save Button */}
                <div className="flex items-end justify-end">
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={async () => {
                                if (isSaving) return;
                                try {
                                    setIsSaving(true)
                                    // Map gender and nationality to backend expected values
                                    const genderMap = { male: 'Male', female: 'Female', other: 'Other' }
                                    const nationalityOptions = [
                                        { value: 'indian', code: 'IN' },
                                        { value: 'american', code: 'US' },
                                        { value: 'british', code: 'GB' },
                                        { value: 'canadian', code: 'CA' },
                                        { value: 'australian', code: 'AU' },
                                        { value: 'german', code: 'DE' },
                                        { value: 'french', code: 'FR' },
                                        { value: 'japanese', code: 'JP' },
                                        { value: 'chinese', code: 'CN' },
                                        { value: 'other', code: 'XX' }
                                    ]
                                    const nat = nationalityOptions.find(n => n.value === formData.nationality)?.code || null
                                    const dobStr = formData.dateOfBirth ? `${formData.dateOfBirth.getFullYear()}-${String(formData.dateOfBirth.getMonth()+1).padStart(2,'0')}-${String(formData.dateOfBirth.getDate()).padStart(2,'0')}` : null
                                    const payload = {
                                        firstName: formData.firstName || '',
                                        lastName: formData.lastName || '',
                                        phone: formData.phone || null,
                                        dateOfBirth: dobStr,
                                        gender: genderMap[formData.gender] || null,
                                        nationality: nat,
                                    }
                                    await authApi.updateMe(payload)
                                    await dispatch(fetchMeThunk())
                                    setIsEditing(false)
                                } catch (e) {
                                    // noop or show toast later
                                } finally {
                                    setIsSaving(false)
                                }
                            }}
                            className="w-fit bg-gradient-to-r from-emerald-600 to-green-100 hover:from-emerald-700 hover:to-green-200 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="w-fit bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Profile