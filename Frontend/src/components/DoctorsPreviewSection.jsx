import { doctors } from '../data/mockData'
import DoctorCard from './DoctorCard'
import SectionHeader from './SectionHeader'

function DoctorsPreviewSection() {
  return (
    <section id="consultation" className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Pilih dokter sesuai kebutuhanmu"
          description="Temukan dokter terpercaya untuk konsultasi online dengan rating tinggi dan pengalaman terverifikasi."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default DoctorsPreviewSection
