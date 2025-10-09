import React from 'react'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import AirlinesSection from '../components/AirlinesSection'
import VistedPlacesSection from '../components/VistedPlacesSection'
import FAQSection from '../components/FAQSection'

function Home() {
  return (
    <div className=''>
        <HeroSection/>
        <SearchSection/>
        <AirlinesSection/>
        <VistedPlacesSection/>
        <FAQSection/>
    </div>
  )
}

export default Home