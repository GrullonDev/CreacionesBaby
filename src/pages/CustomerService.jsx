import { Link, Navigate, useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const CUSTOMER_SERVICE_PAGES = {
  'guia-de-tallas': {
    title: 'Guia de Tallas',
    eyebrow: 'Ajuste correcto',
    icon: 'straighten',
    intro:
      'Consulta las medidas recomendadas antes de elegir ropa, calzado o accesorios para tu bebe.',
    sections: [
      {
        title: 'Ropa de bebe',
        items: [
          '0-3 meses: 50-62 cm de estatura aproximada.',
          '3-6 meses: 62-68 cm de estatura aproximada.',
          '6-12 meses: 68-80 cm de estatura aproximada.',
          '12-24 meses: 80-92 cm de estatura aproximada.',
        ],
      },
      {
        title: 'Consejo de compra',
        items: [
          'Si tu bebe esta entre dos tallas, elige la talla mayor para mas comodidad.',
          'Revisa largo, contorno de pecho y elasticidad del tejido antes de confirmar.',
        ],
      },
    ],
  },
  'envios-y-devoluciones': {
    title: 'Envios y Devoluciones',
    eyebrow: 'Compras con claridad',
    icon: 'local_shipping',
    intro:
      'Encuentra las condiciones principales para recibir tu pedido y solicitar cambios cuando sea necesario.',
    sections: [
      {
        title: 'Envios',
        items: [
          'Procesamos pedidos confirmados en dias habiles.',
          'El costo y tiempo de entrega se calculan segun direccion y disponibilidad.',
          'Recibiras actualizaciones del estado del pedido desde tu historial de compras.',
        ],
      },
      {
        title: 'Devoluciones',
        items: [
          'Los productos deben conservar etiquetas, empaque original y no mostrar uso.',
          'Para iniciar una solicitud, contactanos con tu numero de pedido y motivo.',
          'Los articulos personalizados pueden tener condiciones especiales.',
        ],
      },
    ],
  },
  'cuidado-de-productos': {
    title: 'Cuidado de Productos',
    eyebrow: 'Mas vida util',
    icon: 'dry_cleaning',
    intro:
      'Sigue estas recomendaciones para conservar textiles, accesorios y productos de bebe en buen estado.',
    sections: [
      {
        title: 'Textiles',
        items: [
          'Lava con agua fria o tibia y detergente suave.',
          'Evita cloro, suavizantes fuertes y secadora a temperatura alta.',
          'Seca a la sombra para proteger colores y fibras delicadas.',
        ],
      },
      {
        title: 'Accesorios',
        items: [
          'Limpia superficies con pano humedo y jabon neutro.',
          'No sumerjas piezas con componentes electronicos o partes metalicas.',
          'Guarda los productos en lugares secos y ventilados.',
        ],
      },
    ],
  },
  'preguntas-frecuentes': {
    title: 'Preguntas Frecuentes',
    eyebrow: 'Respuestas rapidas',
    icon: 'help',
    intro:
      'Resolvemos las dudas mas comunes sobre pedidos, disponibilidad, pagos y atencion personalizada.',
    sections: [
      {
        title: 'Compras',
        items: [
          'Puedes buscar productos por categoria, oferta o nombre desde la barra superior.',
          'Los favoritos se guardan en tu cuenta local para comparar antes de comprar.',
          'La disponibilidad se valida antes de completar el checkout.',
        ],
      },
      {
        title: 'Soporte',
        items: [
          'Para dudas sobre un pedido, ten a mano tu numero de compra.',
          'Si necesitas una recomendacion de talla o regalo, escribenos por el formulario de contacto.',
        ],
      },
    ],
  },
  contacto: {
    title: 'Contacto',
    eyebrow: 'Atencion personalizada',
    icon: 'support_agent',
    intro:
      'Estamos disponibles para ayudarte con productos, pedidos, regalos y recomendaciones para cada etapa.',
    sections: [
      {
        title: 'Canales de atencion',
        items: [
          'WhatsApp: usa el boton flotante para una respuesta directa.',
          'Correo: soporte@creacionesbaby.com',
          'Horario: lunes a viernes de 9:00 a 18:00.',
        ],
      },
      {
        title: 'Antes de escribirnos',
        items: [
          'Incluye tu numero de pedido si consultas sobre una compra.',
          'Para asesorias, comparte edad, peso aproximado y uso esperado del producto.',
        ],
      },
    ],
  },
}

const LINKS = Object.entries(CUSTOMER_SERVICE_PAGES).map(([slug, page]) => ({
  slug,
  title: page.title,
  icon: page.icon,
}))

export default function CustomerService() {
  const { slug = 'guia-de-tallas' } = useParams()
  const page = CUSTOMER_SERVICE_PAGES[slug]
  const pageTitle = page?.title || 'Atencion al Cliente'

  usePageTitle(pageTitle, `${pageTitle} de Creaciones Baby.`)

  if (!page) return <Navigate to="/atencion-al-cliente/guia-de-tallas" replace />

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
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          <aside className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 lg:sticky lg:top-24">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 px-2 pb-3">
              Atencion al Cliente
            </h2>
            <nav className="space-y-1">
              {LINKS.map((link) => {
                const active = link.slug === slug
                return (
                  <Link
                    key={link.slug}
                    to={`/atencion-al-cliente/${link.slug}`}
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
                Necesitas ayuda adicional?
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Escribenos y te orientamos con tallas, productos, pedidos o regalos.
              </p>
              <Link
                to="/atencion-al-cliente/contacto"
                className="mt-5 inline-flex items-center gap-2 bg-[#5c4c3e] hover:bg-[#4a3e35] text-white px-5 py-3 rounded-xl font-bold text-xs transition-colors"
              >
                Contactar soporte
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

