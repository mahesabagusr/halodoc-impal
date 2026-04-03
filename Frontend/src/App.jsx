import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import DoctorsPreviewSection from './components/DoctorsPreviewSection'
import StorePreviewSection from './components/StorePreviewSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1f2_0%,#ffffff_30%,#f8fafc_100%)]">
      <Navbar />
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
