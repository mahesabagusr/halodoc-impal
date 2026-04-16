import { useState } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import DoctorsPreviewSection from './components/DoctorsPreviewSection'
import StorePreviewSection from './components/StorePreviewSection'
import Footer from './components/Footer'
import LoginRegisterPage from './components/LoginRegisterPage'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  if (isAuthOpen) {
    return <LoginRegisterPage onClose={() => setIsAuthOpen(false)} />
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1f2_0%,#ffffff_30%,#f8fafc_100%)]">
      <Navbar onLoginClick={() => setIsAuthOpen(true)} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DoctorsPreviewSection />
        <StorePreviewSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
