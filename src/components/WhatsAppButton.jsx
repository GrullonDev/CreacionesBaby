const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '50200000000'
const DEFAULT_MESSAGE = 'Hola, tengo una pregunta sobre CreacionesBaby 🍼'

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chatea con nosotros por WhatsApp"
      title="Chatea con nosotros por WhatsApp"
      className="fixed bottom-5 right-5 z-40 size-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105"
    >
      <span className="material-symbols-outlined text-2xl">chat</span>
    </a>
  )
}
