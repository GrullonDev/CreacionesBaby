import { Link } from 'react-router-dom'
import NewsletterForm from './NewsletterForm'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#f5f3f0] dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 mt-auto border-t border-slate-200/60 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <span className="text-slate-800 dark:text-white text-lg font-bold tracking-tight block">
              Creaciones<span className="text-primary font-black">Baby</span>
            </span>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
              Acompañándote en el viaje más increíble de tu vida con dulzura, seguridad y diseño.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <span className="material-symbols-outlined text-lg cursor-pointer hover:text-primary transition-colors">share</span>
              <span className="material-symbols-outlined text-lg cursor-pointer hover:text-primary transition-colors">language</span>
            </div>
          </div>

          {/* Col 2: Customer Service */}
          <div>
            <h4 className="text-slate-800 dark:text-white font-extrabold text-xs uppercase tracking-widest mb-4">
              Atención al Cliente
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products" className="hover:text-primary transition-colors">Guía de Tallas</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Cuidado de Productos</Link></li>
              <li><Link to="/account" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/account" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Col 3: Services/Company */}
          <div>
            <h4 className="text-slate-800 dark:text-white font-extrabold text-xs uppercase tracking-widest mb-4">
              Nuestras Colecciones
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/products?category=baby_gear" className="hover:text-primary transition-colors">Baby Essentials</Link></li>
              <li><Link to="/products?category=smart_tech" className="hover:text-primary transition-colors">Smart Technology</Link></li>
              <li><Link to="/streaming" className="hover:text-primary transition-colors">Streaming Media</Link></li>
              <li><Link to="/products?deals=true" className="hover:text-primary transition-colors">Ofertas & Deals</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-slate-800 dark:text-white font-extrabold text-xs uppercase tracking-widest mb-4">
              Sigue nuestra ternura
            </h4>
            <p className="text-xs text-slate-500">
              Inscríbete para recibir ofertas exclusivas y novedades sobre el cuidado de tu bebé.
            </p>
            <NewsletterForm compact />
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-200/80 dark:border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {currentYear} CreacionesBaby. Con amor para tu familia.</p>
          <div className="flex gap-6">
            <Link to="/products" className="hover:text-primary transition-colors">Términos</Link>
            <Link to="/products" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
