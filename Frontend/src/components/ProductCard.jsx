function ProductCard({ product }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-sm font-medium text-slate-500">
          Foto Produk
        </div>
      </div>
      <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {product.category}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-3 text-sm font-semibold text-red-500">{product.price}</p>
      <button className="mt-4 w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-out hover:border-red-200 hover:bg-red-500/10 hover:text-red-500 hover:shadow-none">
        Tambah ke Keranjang
      </button>
    </article>
  )
}

export default ProductCard
