import { useState } from 'react'
import { Outlet } from 'react-router'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBackground from './components/AnimatedBackground.jsx'

function App() {

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <AnimatedBackground/>
          <Header/>
          <main className=''>
          <Outlet/>
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default App
