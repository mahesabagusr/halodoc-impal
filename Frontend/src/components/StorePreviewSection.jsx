import { products } from '../data/mockData'
import ProductCard from './ProductCard'
import SectionHeader from './SectionHeader'

function StorePreviewSection() {
  return (
    <section id="store" className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Produk kesehatan populer minggu ini"
          description="Belanja obat dan produk kesehatan dengan pengalaman checkout sederhana dan alur pembayaran yang jelas."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default StorePreviewSection
