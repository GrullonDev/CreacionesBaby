import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { fetchProducts } from '../services/productService'

export default function Streaming() {
  const { addItem } = useCart()
  const [streamingItems, setStreamingItems] = useState([])

  useEffect(() => {
    fetchProducts().then((all) => {
      const items = all.filter(p => p.category === 'streaming')
      setStreamingItems(items)
    })
  }, [])

  // Dynamic branding colors for subscription cards
  const getSubTheme = (brand) => {
    switch (brand.toLowerCase()) {
      case 'netflix':
        return {
          bgGrad: 'from-red-950/90 to-black',
          badgeBg: 'bg-red-600 text-white',
          cartBg: 'bg-red-600 hover:bg-red-700 text-white',
          accentBorder: 'border-red-500/20'
        }
      case 'disney':
        return {
          bgGrad: 'from-blue-950/90 to-black',
          badgeBg: 'bg-sky-600 text-white',
          cartBg: 'bg-sky-600 hover:bg-sky-700 text-white',
          accentBorder: 'border-sky-500/20'
        }
      case 'hbo':
        return {
          bgGrad: 'from-violet-950/90 to-black',
          badgeBg: 'bg-purple-600 text-white',
          cartBg: 'bg-purple-600 hover:bg-purple-700 text-white',
          accentBorder: 'border-purple-500/20'
        }
      case 'spotify':
        return {
          bgGrad: 'from-emerald-950/90 to-black',
          badgeBg: 'bg-emerald-500 text-black',
          cartBg: 'bg-emerald-500 hover:bg-emerald-600 text-black',
          accentBorder: 'border-emerald-500/20'
        }
      default:
        return {
          bgGrad: 'from-[#5c4c3e]/90 to-black',
          badgeBg: 'bg-[#5c4c3e] text-white',
          cartBg: 'bg-[#5c4c3e] hover:bg-stone-700 text-white',
          accentBorder: 'border-stone-500/20'
        }
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow text-slate-800 dark:text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-6 text-left shadow-sm">
          {/* User Concierge Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
            <span className="material-symbols-outlined text-3xl text-slate-400">account_circle</span>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Welcome</p>
              <h4 className="font-extrabold text-xs text-[#5c4c3e] dark:text-rose-200">Premium Concierge</h4>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link to="/products" className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-800 transition-colors">
              <span className="material-symbols-outlined text-lg">apps</span>
              All Categories
            </Link>
            <Link to="/products?category=baby_gear" className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-800 transition-colors">
              <span className="material-symbols-outlined text-lg">child_friendly</span>
              Baby Essentials
            </Link>
            <Link to="/products?category=smart_tech" className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-800 transition-colors">
              <span className="material-symbols-outlined text-lg">devices</span>
              Tech Hub
            </Link>
            <Link to="/streaming" className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-bold bg-[#fff1f2] dark:bg-rose-950/20 text-[#5c4c3e] dark:text-rose-200">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Streaming Media
            </Link>
            <Link to="/account" className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-800 transition-colors">
              <span className="material-symbols-outlined text-lg">loyalty</span>
              Member Rewards
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full bg-[#5c4c3e] hover:bg-[#4a3e35] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
              Become a Member
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Hero Banner Card */}
          <div className="bg-gradient-to-r from-indigo-950 via-[#18092a] to-slate-950 rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden border border-purple-900/30 shadow-xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
            
            <div className="max-w-xl space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs select-none">bolt</span>
                Instant Digital Delivery
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Premium Entertainment, <span className="text-[#c084fc]">Unbeatable Prices.</span>
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed">
                Get instant access to shared premium profiles for the world's best streaming services. No contracts, no hassle, just pure cinematic joy from CreacionesBaby.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#active-subs" className="bg-[#c084fc] hover:bg-purple-400 text-slate-950 px-6 py-3 rounded-full text-xs font-bold transition-all">
                  Explore Subscriptions
                </a>
                <a href="#how-it-works" className="border border-purple-500/50 hover:bg-purple-950/40 text-purple-200 px-6 py-3 rounded-full text-xs font-bold transition-all">
                  How It Works
                </a>
              </div>
            </div>
          </div>

          {/* Active Subscriptions Grid */}
          <section id="active-subs" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Subscriptions</h3>
                <p className="text-xs text-slate-400 mt-1">Choose your profile and start watching in minutes.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500">
                  1,260+ Profiles Available
                </span>
                <span className="px-2.5 py-1 bg-[#fff1f2] dark:bg-rose-950/20 rounded-full text-[10px] font-bold text-primary">
                  Best Price Guaranteed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {streamingItems.slice(0, 4).map((item) => {
                const subTheme = getSubTheme(item.brand);
                return (
                  <div 
                    key={item.id}
                    className={`bg-gradient-to-b ${subTheme.bgGrad} rounded-2xl p-5 border ${subTheme.accentBorder} flex flex-col justify-between h-64 text-left relative overflow-hidden shadow-sm hover:shadow-md transition-all group`}
                  >
                    <div>
                      {/* Top Brand Tag */}
                      <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${subTheme.badgeBg}`}>
                        {item.brand}
                      </span>
                      <h4 className="text-white font-extrabold text-base mt-4 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-baseline">
                        <span className="text-white font-black text-lg">${item.price.toFixed(2)}</span>
                        <span className="text-slate-500 text-[10px] ml-0.5">/month</span>
                      </div>

                      <button
                        onClick={() => addItem(item)}
                        className={`size-9 rounded-full flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 ${subTheme.cartBg}`}
                        title="Add to cart"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How It Works Row */}
          <section id="how-it-works" className="py-8 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center max-w-lg mx-auto mb-10">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">How it works</h3>
              <p className="text-xs text-slate-400 mt-2">
                Getting your premium access is simple, secure, and lightning fast with CreacionesBaby.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl space-y-3">
                <div className="size-9 rounded-lg bg-[#fff1f2] dark:bg-rose-950/20 text-[#5c4c3e] dark:text-rose-300 flex items-center justify-center font-extrabold text-xs">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">1. Choose Service</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Select your favorite streaming platform and subscription duration from our catalog.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl space-y-3">
                <div className="size-9 rounded-lg bg-[#fff1f2] dark:bg-rose-950/20 text-[#5c4c3e] dark:text-rose-300 flex items-center justify-center font-extrabold text-xs">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">2. Quick Checkout</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Complete your purchase using our secure encrypted payment gateway in seconds.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl space-y-3">
                <div className="size-9 rounded-lg bg-[#fff1f2] dark:bg-rose-950/20 text-[#5c4c3e] dark:text-rose-300 flex items-center justify-center font-extrabold text-xs">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">3. Instant Access</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Receive your profile credentials immediately via email and dashboard notification.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Banner Section */}
          <section className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-center border border-slate-900 shadow-xl relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-5 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Start Streaming Today</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join over 50,000 satisfied users enjoying premium content without the premium price tag. CreacionesBaby reliability is our core promise.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-[10px] text-purple-200">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check_circle</span>
                  100% Account Safety
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check_circle</span>
                  24/7 Live Support
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check_circle</span>
                  Auto-Renewal Ready
                </span>
              </div>

              <div className="pt-2">
                <a href="#active-subs" className="inline-block bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-bold px-8 py-3.5 rounded-full text-xs shadow-md transition-all">
                  Get Instant Credentials
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
