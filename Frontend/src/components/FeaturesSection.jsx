import { features } from '../data/mockData'
import FeatureCard from './FeatureCard'
import SectionHeader from './SectionHeader'

function FeaturesSection() {
  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Semua kebutuhan kesehatan, dalam satu alur yang ringkas"
          description="Dirancang mengikuti flow inti aplikasi: konsultasi, resep digital, pembelian obat, hingga pembayaran yang aman."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
