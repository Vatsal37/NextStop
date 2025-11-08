import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import Home from './pages/Home.jsx'
import Login from './components/Login.jsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store/index.js'
import Search from './pages/Search.jsx'
import FlightCardTest from './pages/FlightCardTest.jsx'
import SeatSelection from './pages/SeatSelection.jsx'
import SignUp from './components/SignUp.jsx'
import Profile from './pages/Profile.jsx'
import BookingConfirmation from './components/BookingConfirmation.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/card" element={<FlightCardTest />} />
      <Route path="/seat" element={<SeatSelection />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/search" element={<Search />} />
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
