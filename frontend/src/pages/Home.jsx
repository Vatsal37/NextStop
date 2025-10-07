import React from 'react'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'

function Home() {
  return (
    <div className=''>
        <HeroSection/>
        <SearchSection/>
        
        {/* Test Content Sections for Parallax Effect */}
        <section className='py-20 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-4xl font-bold text-center mb-8'>Top Flight Deals</h2>
            <p className='text-lg text-gray-600 text-center max-w-2xl mx-auto'>
              Discover amazing flight deals and book your next adventure with ease. 
              Our platform offers the best prices and most convenient booking experience.
            </p>
          </div>
        </section>

        <section className='py-20 bg-white'>
          <div className='container mx-auto px-4'>
            <h2 className='text-4xl font-bold text-center mb-8'>Popular Destinations</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='bg-gray-100 p-6 rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>Tokyo, Japan</h3>
                <p className='text-gray-600'>Experience the perfect blend of traditional culture and modern innovation.</p>
              </div>
              <div className='bg-gray-100 p-6 rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>Berlin, Germany</h3>
                <p className='text-gray-600'>Discover rich history, vibrant nightlife, and stunning architecture.</p>
              </div>
              <div className='bg-gray-100 p-6 rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>New York, USA</h3>
                <p className='text-gray-600'>The city that never sleeps offers endless possibilities for exploration.</p>
              </div>
            </div>
          </div>
        </section>

        <section className='py-20 bg-blue-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-4xl font-bold text-center mb-8'>Why Choose NextStop?</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-white text-2xl'>✈</span>
                </div>
                <h3 className='text-lg font-semibold mb-2'>Best Prices</h3>
                <p className='text-gray-600'>Find the most competitive flight prices guaranteed.</p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-white text-2xl'>🛡</span>
                </div>
                <h3 className='text-lg font-semibold mb-2'>Secure Booking</h3>
                <p className='text-gray-600'>Your personal and payment information is always protected.</p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-white text-2xl'>📱</span>
                </div>
                <h3 className='text-lg font-semibold mb-2'>Easy Booking</h3>
                <p className='text-gray-600'>Simple and intuitive booking process for everyone.</p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
                  <span className='text-white text-2xl'>🎯</span>
                </div>
                <h3 className='text-lg font-semibold mb-2'>24/7 Support</h3>
                <p className='text-gray-600'>Round-the-clock customer support whenever you need it.</p>
              </div>
            </div>
          </div>
        </section>

        <section className='py-20 bg-gray-900 text-white'>
          <div className='container mx-auto px-4 text-center'>
            <h2 className='text-4xl font-bold mb-8'>Ready to Start Your Journey?</h2>
            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
              Book your next flight with NextStop and experience the convenience of modern travel booking.
            </p>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors'>
              Book Now
            </button>
          </div>
        </section>
    </div>
  )
}

export default Home