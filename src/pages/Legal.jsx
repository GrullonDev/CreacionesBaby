import { Link, Navigate, useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const LEGAL_PAGES = {
  terminos: {
    title: 'Terminos',
    eyebrow: 'Condiciones de compra',
    icon: 'contract',
    intro:
      'Estos terminos resumen las condiciones generales para navegar, comprar y usar los servicios de Creaciones Baby.',
    sections: [
      {
        title: 'Uso del sitio',
        items: [
          'La informacion del catalogo puede actualizarse por disponibilidad, temporada o ajustes comerciales.',
          'Los precios, promociones y costos de envio se confirman antes de completar el checkout.',
          'El usuario es responsable de revisar los datos de contacto y direccion antes de enviar su pedido.',
        ],
      },
      {
        title: 'Pedidos y pagos',
        items: [
          'Un pedido queda sujeto a validacion de inventario y confirmacion del pago.',
          'Si un producto no esta disponible, contactaremos al cliente para ofrecer cambio, espera o reembolso.',
          'Las promociones no son acumulables salvo que se indique expresamente.',
        ],
      },
      {
        title: 'Cambios y garantia',
        items: [
          'Los cambios aplican segun estado del producto, empaque, etiquetas y comprobante de compra.',
          'Los articulos personalizados o en liquidacion pueden tener condiciones especiales.',
          'La garantia cubre fallas atribuibles al producto, no danos por uso inadecuado o lavado incorrecto.',
        ],
      },
    ],
  },
  privacidad: {
    title: 'Privacidad',
    eyebrow: 'Proteccion de datos',
    icon: 'shield_lock',
    intro:
      'Esta politica explica que informacion podemos usar para procesar pedidos, mejorar la experiencia y atender solicitudes.',
    sections: [
      {
        title: 'Informacion que usamos',
        items: [
          'Datos de contacto necesarios para confirmar pedidos, entregas y soporte.',
          'Informacion de navegacion y preferencias guardadas localmente, como carrito, favoritos y busquedas recientes.',
          'Datos de compra necesarios para seguimiento, cambios y atencion posventa.',
        ],
      },
      {
        title: 'Finalidad',
        items: [
          'Procesar compras, coordinar entregas y responder solicitudes de atencion al cliente.',
          'Personalizar la experiencia con productos vistos, favoritos y recomendaciones relevantes.',
          'Enviar comunicaciones comerciales solo cuando el usuario se suscribe o autoriza recibirlas.',
        ],
      },
      {
        title: 'Control del usuario',
        items: [
          'Puedes solicitar la actualizacion o eliminacion de tus datos de contacto.',
          'Puedes borrar datos locales del navegador, como carrito, favoritos y busquedas recientes.',
          'Puedes cancelar la suscripcion a comunicaciones promocionales cuando lo necesites.',
        ],
      },
    ],
  },
}

const LEGAL_LINKS = Object.entries(LEGAL_PAGES).map(([slug, page]) => ({
  slug,
  title: page.title,
  icon: page.icon,
}))

export default function Legal() {
  const { slug = 'terminos' } = useParams()
  const page = LEGAL_PAGES[slug]
  const pageTitle = page?.title || 'Legal'

  usePageTitle(pageTitle, `${pageTitle} de Creaciones Baby.`)

  if (!page) return <Navigate to="/legal/terminos" replace />

  return (
    <main className="flex-grow bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <section className="bg-[#f5f3f0] dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl text-left">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary">
              <span className="material-symbols-outlined text-sm">{page.icon}</span>
              {page.eyebrow}
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#5c4c3e] dark:text-white">
              {page.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
              {page.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 items-start">
          <aside className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 lg:sticky lg:top-24">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 px-2 pb-3">
              Informacion legal
            </h2>
            <nav className="space-y-1">
              {LEGAL_LINKS.map((link) => {
                const active = link.slug === slug
                return (
                  <Link
                    key={link.slug}
                    to={`/legal/${link.slug}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{link.icon}</span>
                    {link.title}
                  </Link>
                )
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            {page.sections.map((section) => (
              <article
                key={section.title}
                className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 text-left"
              >
                <h2 className="text-xl font-extrabold text-[#5c4c3e] dark:text-white">
                  {section.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-base text-primary mt-0.5 flex-shrink-0">
                        check_circle
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            <div className="rounded-2xl bg-[#fff1f2] dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-6 sm:p-8 text-left">
              <h2 className="text-lg font-extrabold text-[#5c4c3e] dark:text-white">
                Tienes una consulta legal o de datos?
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Contactanos para revisar solicitudes relacionadas con compras, datos personales o condiciones del servicio.
              </p>
              <Link
                to="/atencion-al-cliente/contacto"
                className="mt-5 inline-flex items-center gap-2 bg-[#5c4c3e] hover:bg-[#4a3e35] text-white px-5 py-3 rounded-xl font-bold text-xs transition-colors"
              >
                Ir a contacto
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

