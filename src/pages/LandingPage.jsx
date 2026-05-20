import { Link } from 'react-router-dom'
import { Store, ShoppingBag, Truck, Shield, ArrowRight, Smartphone, MapPin } from 'lucide-react'
import { APP_NAME } from '../utils/constants'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 md:px-8 h-14 border-b border-neutral-100 max-w-6xl mx-auto">
        <span className="text-xl font-bold">{APP_NAME}</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600 mb-6">
          <Smartphone className="w-3.5 h-3.5" />
          Built for Maldives · Mobile-first
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
          Your island.<br />Your shop.<br />Your marketplace.
        </h1>
        <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
          MarketMV lets anyone in the Maldives open an online store and sell products easily.
          Browse, shop, and sell — all in one simple app.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/home"
            className="flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-3.5 border border-neutral-200 font-semibold rounded-full hover:bg-neutral-50"
          >
            Open your store
          </Link>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Store, title: 'Open a store', desc: 'Create your shop in minutes' },
            { icon: ShoppingBag, title: 'Sell products', desc: 'Upload photos, set prices in MVR' },
            { icon: Truck, title: 'Island delivery', desc: 'COD & bank transfer payments' },
            { icon: Shield, title: 'Trusted platform', desc: 'Verified stores & safe orders' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 bg-white rounded-2xl border border-neutral-100">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-neutral-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-xs text-neutral-400 border-t border-neutral-100">
        <p className="flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
          © {new Date().getFullYear()} {APP_NAME} · Made for the Maldives
        </p>
      </footer>
    </div>
  )
}
