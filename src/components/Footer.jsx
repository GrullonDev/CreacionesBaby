import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Desc */}
          <div className="space-y-4">
            <span className="text-white text-xl font-bold uppercase">
              Creaciones<span className="text-primary">.</span>Baby
            </span>
            <p className="text-xs leading-relaxed text-slate-400">
              Prendas tejidas con el alma, diseñadas para la piel más tierna y el descanso más puro de tu bebé.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Colecciones</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=mamelucos" className="hover:text-primary transition-colors">
                  Mamelucos
                </Link>
              </li>
              <li>
                <Link to="/products?category=conjuntos" className="hover:text-primary transition-colors">
                  Conjuntos
                </Link>
              </li>
              <li>
                <Link to="/products?category=recien_nacidos" className="hover:text-primary transition-colors">
                  Recién Nacidos
                </Link>
              </li>
              <li>
                <Link to="/products?category=accesorios" className="hover:text-primary transition-colors">
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Compañía</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-primary transition-colors">Nuestra Historia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sustentabilidad</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Puntos de Venta</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Soporte</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-primary transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Envíos y Retornos</a></li>
              <li><a href="mailto:soporte@creacionesbaby.com" className="hover:text-primary transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} Creaciones Baby. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
