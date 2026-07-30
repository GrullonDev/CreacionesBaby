import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import QuickView from '../components/QuickView'
import { getFeaturedProducts } from '../data/products'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    getFeaturedProducts().then(setFeatured)
  }, [])

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-slate-100 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            alt="Ropa de bebé de algodón orgánico" 
            className="w-full h-full object-cover object-center" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBezkUr28nhggeQJQ2LmHCstYHSSMxyny0IzhIpGq3w0y5Yt9zD647fBq-YRw4Wuyo_dq2It6-ZsUnqTjLk1580kh4pxGh7a6MlVRf3ZSV7Z8ElS6Rpkgzm6no64ZLYrbK-LmTBttd5ZOf4x7OPWnzdn8mZPKGFQAhtcfkvpwb4ffsgBdWBX8ALB4in68xeimvHPAS1VbuFpZ26I-SulFe0c6wdvyyx7VJorHs0ou7JbQgyJJZvr4S6BxK4-eD12byNyaPS2x8-argC"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent dark:from-background-dark/95 dark:to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-extrabold tracking-widest text-primary uppercase bg-primary/10 rounded-full">
              Nueva Colección Pima
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Seguridad en la que confías, comodidad que ellos aman
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md">
              Descubre nuestra línea de textiles premium diseñados para las pieles más delicadas. Calidad artesanal que crece con ellos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="bg-primary hover:bg-opacity-95 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
              >
                Ver Colección
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <a 
                href="#about" 
                className="bg-white/80 hover:bg-white text-slate-900 dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold border border-slate-200/55 dark:border-slate-800 transition-all"
              >
                Nuestra Historia
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Envío a domicilio</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Entrega rápida en todo el país</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Algodón Pima Certificado</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Suavidad pura para la piel de tu bebé</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Compra Segura</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Garantía de devolución de 30 días</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Compra por Etapa</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Encuentra la prenda perfecta según el crecimiento de tu bebé.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/products?category=recien_nacidos" className="group relative block overflow-hidden rounded-2xl">
            <div className="aspect-square overflow-hidden bg-slate-200">
              <img 
                alt="Recién Nacidos" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvg0CpquvOUQe-vcuJ3url2KYmvVjyd9HeAe29b2mKXWBawN88LkELkuXGz5LK6PI1HmjrL31N4tGsjb_NAx9cJxyQco2EMcoczoMBnaM2kcTttOVYqe7tfiN3Ev7i0a4McmLsfsk40buzxyxWxnUlJNbwYRZYyhYUnB4CfVQJSxW46vkSMdKX9f89X9OTnofYcf5kFUTMHKWXTxlWJ4gl9j12wFTzFGeKRIX7Y8imV0GmTZQlG6trJbXZ5xuRf0OQY5TKrP2koIxP"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Recién Nacido</h3>
              <p className="text-xs text-slate-300 mt-1">Prendas ultra suaves de 0 a 6 meses</p>
            </div>
          </Link>

          <Link to="/products?category=mamelucos" className="group relative block overflow-hidden rounded-2xl">
            <div className="aspect-square overflow-hidden bg-slate-200">
              <img 
                alt="Bebés" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5pZiWwbADtme4ewiO47wv3Fp8Wd6A74ptFWlWVUhg31qt6XpJXH8Nr6X3UaOftV4Fa1GIKUYihPMEpQkCJHPVyMk5ZwRSsFJRPqlTu7mn0CI3mxC3Xkh1fhHROsy9TY2Pv1he4N48vUGWERkJwI0fPCgto8GYxYk2nkgx5GLffKJBuRRsBXyaSz0ews_FSxq9JJtU0PRsOZw-uHU79sK0ZyC_E8v8K1oGmiEM1i-g7mU65N6SAIC3J5xttKX457cR4xmllijvHcy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Mamelucos & Rompers</h3>
              <p className="text-xs text-slate-300 mt-1">Comodidad y libertad de 6 a 24 meses</p>
            </div>
          </Link>

          <Link to="/products?category=conjuntos" className="group relative block overflow-hidden rounded-2xl">
            <div className="aspect-square overflow-hidden bg-slate-200">
              <img 
                alt="Niños" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjeDetrF4pBrJzTvMCfORza0f9CWX5dS5uVD39Y2oN4bbc7qUZQ2XUaSsFZqgjP83fvpw02JMoiwHayDyFxCIUi76BWNykpVCxj9ch3O1x-4N9GE4aUzcVE7L3KkSR-9RfNoUZqSo-46n271udcgbEKOhQuhIzjM6f6Xq6L_EpyDBsHeVyW5wCltwUUALYSYbueKlzEohaySsViBYVZma6cjz4K3siHwKmj4kzpbwzwWL2nDe175r5zGgvxJ5XvUdBvjvhiRwQqeoH"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Conjuntos</h3>
              <p className="text-xs text-slate-300 mt-1">Estilo y calidad de 2 a 5 años</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Los más vendidos</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Nuestros esenciales favoritos por las mamás.</p>
              </div>
              <Link to="/products" className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
                Ver todos los productos
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
      )}

      {/* Brand Values / About section */}
      <section id="about" className="py-24 bg-background-light dark:bg-slate-900/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  alt="Nuestra historia" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvg0CpquvOUQe-vcuJ3url2KYmvVjyd9HeAe29b2mKXWBawN88LkELkuXGz5LK6PI1HmjrL31N4tGsjb_NAx9cJxyQco2EMcoczoMBnaM2kcTttOVYqe7tfiN3Ev7i0a4McmLsfsk40buzxyxWxnUlJNbwYRZYyhYUnB4CfVQJSxW46vkSMdKX9f89X9OTnofYcf5kFUTMHKWXTxlWJ4gl9j12wFTzFGeKRIX7Y8imV0GmTZQlG6trJbXZ5xuRf0OQY5TKrP2koIxP"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-xl text-white shadow-xl hidden md:block">
                <p className="text-3xl font-extrabold italic">"Solo lo mejor para ellos"</p>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <span className="text-primary font-extrabold text-xs uppercase tracking-widest block">
                Nuestra Filosofía
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Hecho con amor y algodón de pureza incomparable
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                Cada prenda en Creaciones Baby se elabora pensando en el bienestar físico y el descanso diario de tu bebé. Trabajamos exclusivamente con algodón Pima de origen ético, garantizando una suavidad sedosa, alta durabilidad frente a lavados frecuentes, y nulas reacciones alérgicas.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Nuestros artesanos vigilan de cerca cada detalle, desde la flexibilidad de los costuras hasta la presión justa de los cierres elásticos. Es calidad familiar diseñada para acompañar su crecimiento saludable.
              </p>
              <div className="pt-4">
                <Link to="/products" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3.5 rounded-xl font-bold transition-all text-xs hover:scale-105">
                  Descubre las Colecciones
                </Link>
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
