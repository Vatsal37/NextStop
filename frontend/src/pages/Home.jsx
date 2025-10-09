import React from 'react'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import AirlinesSection from '../components/AirlinesSection'
import VistedPlacesSection from '../components/VistedPlacesSection'

function Home() {
  return (
    <div className=''>
        <HeroSection/>
        <SearchSection/>
        <AirlinesSection/>
        <VistedPlacesSection/>
    </div>
  )
}

export default Home