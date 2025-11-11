import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { CreditCard, Lock } from 'lucide-react'
import { paymentsApi } from '../services/api'

function Payment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookingId = searchParams.get('bookingId')
  const amount = parseFloat(searchParams.get('amount') || '0')
  const pnr = searchParams.get('pnr')
  
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async (e) => {
    e.preventDefault()
    
    // Validate payment method specific fields
    if (paymentMethod === 'CARD') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setError('Please fill all card details')
        return
      }
      
      // Basic card number validation (should be 16 digits)
      const cardNumberDigits = cardNumber.replace(/\s/g, '')
      if (cardNumberDigits.length !== 16 || !/^\d+$/.test(cardNumberDigits)) {
        setError('Please enter a valid 16-digit card number')
        return
      }
      
      // Basic CVV validation
      if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        setError('Please enter a valid 3-digit CVV')
        return
      }
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Generate a mock transaction ID (in real app, this would come from payment gateway)
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      const payload = {
        bookingId: parseInt(bookingId),
        amount: amount,
        currency: 'INR',
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentGateway: paymentMethod === 'CARD' ? 'STRIPE' : paymentMethod === 'UPI' ? 'RAZORPAY' : 'NETBANKING'
      }

      await paymentsApi.create(payload)
      
      // Navigate to confirmation page on success
      if (pnr) {
        navigate(`/confirmation?pnr=${pnr}`)
      } else {
        setError('Payment successful but PNR not found')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err?.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    setExpiryDate(value)
  }

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3)
    setCvv(value)
  }

  if (!bookingId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-red-600">
          <p className="text-lg font-medium mb-2">Invalid Payment Request</p>
          <p className="text-sm">Missing booking information. Please try booking again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-gray-900 leading-none tracking-tight mb-2">
            Payment
          </h1>
          <p className="text-gray-600">Complete your booking by making the payment</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-medium text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600">
              Rs {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Secure Payment</h2>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">NetBanking</span>
              </button>
            </div>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'CARD' && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Processing Payment...' : `Pay Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </button>
            </form>
          )}

          {/* UPI Payment */}
          {paymentMethod === 'UPI' && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  UPI payment will be processed through your UPI app. Please complete the payment in the app.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Processing Payment...' : `Pay Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </button>
            </form>
          )}

          {/* NetBanking Payment */}
          {paymentMethod === 'NETBANKING' && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  NetBanking payment will redirect you to your bank's payment gateway.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-100 hover:from-indigo-700 hover:to-indigo-200 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Processing Payment...' : `Pay Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </button>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  )
}

export default Payment







