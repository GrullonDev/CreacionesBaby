import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import NewsletterForm from '../components/NewsletterForm'
import { fetchFeaturedProducts } from '../services/productService'
import { testimonials, storeStats } from '../data/testimonials'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle(null)
  const [featured, setFeatured] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    fetchFeaturedProducts().then(setFeatured)
  }, [])

  return (
    <main className="flex-grow bg-white dark:bg-slate-900">
      
      {/* Hero Banner Section */}
      <section className="relative bg-[#fff1f2]/80 dark:bg-rose-950/20 py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text details */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-[#5c4c3e] dark:text-rose-200 uppercase bg-[#5c4c3e]/10 rounded-full">
                NUEVA COLECCIÓN SOFT
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#5c4c3e] dark:text-white leading-tight">
                Cuidamos cada pequeño detalle
              </h1>
              <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Descubre un mundo de ternura con nuestra selección de textiles orgánicos, muebles artesanales y accesorios diseñados para los sueños más dulces.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  to="/products?category=baby_gear" 
                  className="bg-[#5c4c3e] hover:bg-[#4a3e35] text-white px-8 py-3.5 rounded-full font-bold shadow-md transition-all text-xs"
                >
                  Explorar Colección
                </Link>
                <Link 
                  to="/account" 
                  className="border border-[#5c4c3e] text-[#5c4c3e] dark:border-rose-300 dark:text-rose-200 hover:bg-[#5c4c3e]/5 px-8 py-3.5 rounded-full font-bold transition-all text-xs"
                >
                  Lista de Nacimiento
                </Link>
              </div>
            </div>

            {/* Image Illustration */}
            <div className="lg:col-span-6 flex justify-center relative">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg bg-stone-100">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqbh_zsZQxMx0fNfMgkI2y5ywarUsyuRMcflrJWqxjwoYPtGE5DiNR_yIwf29QzL1mJSyW48CbfMjq2m-d1NCyXMzJbbs4V2IC5zYvLG_w8nWfBx8VkHPYqdPzNqVdVUBmv-DbuAmpJwYBoqeMpyORPHKx_5L1eUP1cERnq1JYuTHg8nNCS9uFBGA45z48tUE328OpbwYKfZzKiS-LD-B7JK-D0SwK7t4Uwl9eGS9Edq9GZHTvqti7RVPjoYCV04L6YpnXdlf6SEpv" 
                  alt="Portabebé ergonómico" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative background shape */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 rounded-full bg-rose-200/50 filter blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-[#5c4c3e] dark:text-white">Nuestras Categorías</h2>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Todo lo necesario para su crecimiento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Category 1 */}
          <Link to="/products?category=baby_gear" className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-stone-100 shadow-sm">
            <img 
              alt="Recién Nacido" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvg0CpquvOUQe-vcuJ3url2KYmvVjyd9HeAe29b2mKXWBawN88LkELkuXGz5LK6PI1HmjrL31N4tGsjb_NAx9cJxyQco2EMcoczoMBnaM2kcTttOVYqe7tfiN3Ev7i0a4McmLsfsk40buzxyxWxnUlJNbwYRZYyhYUnB4CfVQJSxW46vkSMdKX9f89X9OTnofYcf5kFUTMHKWXTxlWJ4gl9j12wFTzFGeKRIX7Y8imV0GmTZQlG6trJbXZ5xuRf0OQY5TKrP2koIxP"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-0.5">Cuidado y Amor</span>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-200 transition-colors">Recién Nacido</h3>
              <span className="text-[10px] text-slate-300 mt-2 flex items-center gap-1">
                Ver Colección
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Category 2 */}
          <Link to="/products?category=baby_gear" className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-stone-100 shadow-sm">
            <img 
              alt="La Habitación" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5r88sGeoasfN61uQYqXgRp-C7_WgUFh3Qg14Hlz7lUhXFFl9EFGCezRybU2qOi0Jkgo1W0GXpVjl8ZFguP_RLiuok8mBsdY726ir893DfWoSroZsvEZXf0CXN0RfnF5fYLZSTs-5WYC6uPD5ibx5zgdodaCNvXf-pghslAASj7HGVlsro0TE3RiMVMpOi5SXnxDDbU8itURPAqrgSk3aZ-fwKRZv1YrAHTnJphw36pL-jB77Z2OGhu9MPWTvrugdbveUI-vue29uF"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-0.5">Espacios Soñados</span>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-200 transition-colors">La Habitación</h3>
              <span className="text-[10px] text-slate-300 mt-2 flex items-center gap-1">
                Ver Mobiliario
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>

          {/* Category 3 */}
          <Link to="/products?category=baby_gear" className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-stone-100 shadow-sm">
            <img 
              alt="Accesorios" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjeDetrF4pBrJzTvMCfORza0f9CWX5dS5uVD39Y2oN4bbc7qUZQ2XUaSsFZqgjP83fvpw02JMoiwHayDyFxCIUi76BWNykpVCxj9ch3O1x-4N9GE4aUzcVE7L3KkSR-9RfNoUZqSo-46n271udcgbEKOhQuhIzjM6f6Xq6L_EpyDBsHeVyW5wCltwUUALYSYbueKlzEohaySsViBYVZma6cjz4K3siHwKmj4kzpbwzwWL2nDe175r5zGgvxJ5XvUdBvjvhiRwQqeoH"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-0.5">Paseo y Juego</span>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-200 transition-colors">Accesorios</h3>
              <span className="text-[10px] text-slate-300 mt-2 flex items-center gap-1">
                Explorar
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5c4c3e] dark:text-white">Los Favoritos de Mamá</h2>
              <p className="text-xs text-slate-400 mt-2">Productos estrella elegidos por nuestra comunidad.</p>
            </div>
            <Link 
              to="/products" 
              className="text-xs font-bold text-[#5c4c3e] dark:text-rose-300 hover:underline flex items-center gap-1"
            >
              Ver catálogo completo
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="py-14 bg-[#5c4c3e] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {storeStats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-100/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-[#5c4c3e] dark:text-rose-200 uppercase bg-[#5c4c3e]/10 rounded-full mb-4">
              Testimonios reales
            </span>
            <h2 className="text-3xl font-extrabold text-[#5c4c3e] dark:text-white">Familias que confían en nosotros</h2>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Miles de bebés felices, miles de historias</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="bg-[#fdf6f5] dark:bg-slate-950 border border-rose-100/60 dark:border-slate-800 rounded-2xl p-6 text-left flex flex-col gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-amber-400 text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <blockquote className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-grow">
                  “{t.text}”
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-3 border-t border-rose-100/60 dark:border-slate-800">
                  <div className="size-9 rounded-full bg-[#5c4c3e] text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#5c4c3e] dark:text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.role}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
                    {t.product}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter & Comunidad Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fff1f2] dark:bg-rose-950/20 rounded-3xl p-8 sm:p-12 lg:p-16 border border-rose-100/50 dark:border-rose-900/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Form Side */}
              <div className="space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#5c4c3e] dark:text-white">
                  Comunidad CreacionesBaby
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed max-w-md">
                  Únete a nuestra newsletter para recibir consejos de crianza, guías de estilo y promociones exclusivas para tu familia.
                </p>
                <NewsletterForm className="max-w-md" />
              </div>

              {/* Badges Info Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[#5c4c3e] dark:text-rose-300 shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#5c4c3e] dark:text-white">Seguridad Certificada</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Normas internacionales estrictas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[#5c4c3e] dark:text-rose-300 shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">eco</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#5c4c3e] dark:text-white">Materiales Orgánicos</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Algodón Pima 100% puro</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[#5c4c3e] dark:text-rose-300 shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#5c4c3e] dark:text-white">Asesoría Personal</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Te ayudamos en cada etapa</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[#5c4c3e] dark:text-rose-300 shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">featured_seasonal</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#5c4c3e] dark:text-white">Envoltorio Regalo</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Detalles especiales sin costo</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </main>
  )
}
